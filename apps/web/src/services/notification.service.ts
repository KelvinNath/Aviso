import {
  EventType,
  ExamCyclePhase,
  NotificationStatus,
  NotifyPolicy,
  SubscriptionStatus,
  type Prisma,
} from "@prisma/client";

import { getExamCycleYear } from "@aviso/shared-utils";

import { getActionableEventCutoffs, isActionableEvent } from "@/lib/is-actionable-event";
import { prisma } from "@/lib/prisma";
import type {
  DashboardNotification,
  GetNotificationsOptions,
  PaginatedNotifications,
} from "@/types/dashboard-notification";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;
const MAX_FETCH_MULTIPLIER = 5;

type NotificationWithEvent = {
  id: string;
  status: NotificationStatus;
  createdAt: Date;
  deliveredAt: Date | null;
  event: {
    title: string;
    summary: string;
    type: EventType;
    sourceUrl: string;
    notifyPolicy: NotifyPolicy;
    publishedAt: Date | null;
    detectedAt: Date;
    effectiveDate: Date | null;
    exam: {
      name: string;
      slug: string;
    };
  };
};

function toDashboardNotification(
  notification: NotificationWithEvent,
): DashboardNotification {
  return {
    id: notification.id,
    title: notification.event.title,
    summary: notification.event.summary,
    examName: notification.event.exam.name,
    examSlug: notification.event.exam.slug,
    eventType: notification.event.type,
    sourceUrl: notification.event.sourceUrl,
    status: notification.status,
    createdAt: notification.createdAt.toISOString(),
    deliveredAt: notification.deliveredAt?.toISOString() ?? null,
  };
}

function buildActionableEventWhere(now: Date = new Date()): Prisma.EventWhereInput {
  const { freshPublishCutoff } = getActionableEventCutoffs(now);
  const cycleYear = getExamCycleYear(now);

  return {
    notifyPolicy: { not: NotifyPolicy.REFERENCE },
    exam: {
      NOT: {
        cycles: {
          some: {
            cycleYear,
            phase: ExamCyclePhase.COMPLETE,
          },
        },
      },
    },
    AND: [
      {
        OR: [{ effectiveDate: null }, { effectiveDate: { gte: now } }],
      },
      {
        OR: [{ publishedAt: null }, { publishedAt: { gte: freshPublishCutoff } }],
      },
    ],
  };
}

function buildWhereClause(
  userId: string,
  options: GetNotificationsOptions,
): Prisma.NotificationWhereInput {
  const subscriptionWhere: Prisma.SubscriptionWhereInput = {
    userId,
    status: SubscriptionStatus.ACTIVE,
  };

  if (options.examSlug) {
    subscriptionWhere.exam = { slug: options.examSlug };
  }

  const eventFilters: Prisma.EventWhereInput[] = [buildActionableEventWhere()];

  if (options.eventTypes && options.eventTypes.length > 0) {
    eventFilters.push({ type: { in: options.eventTypes } });
  }

  const where: Prisma.NotificationWhereInput = {
    subscription: subscriptionWhere,
    event:
      eventFilters.length === 1
        ? eventFilters[0]
        : {
            AND: eventFilters,
          },
  };

  return where;
}

function isActionableNotification(
  notification: NotificationWithEvent,
  now: Date = new Date(),
): boolean {
  return isActionableEvent(
    {
      notifyPolicy: notification.event.notifyPolicy,
      publishedAt: notification.event.publishedAt,
      detectedAt: notification.event.detectedAt,
      effectiveDate: notification.event.effectiveDate,
    },
    now,
  );
}

const notificationSelect = {
  id: true,
  status: true,
  createdAt: true,
  deliveredAt: true,
  event: {
    select: {
      title: true,
      summary: true,
      type: true,
      sourceUrl: true,
      notifyPolicy: true,
      publishedAt: true,
      detectedAt: true,
      effectiveDate: true,
      exam: {
        select: {
          name: true,
          slug: true,
        },
      },
    },
  },
} satisfies Prisma.NotificationSelect;

async function fetchActionableNotifications(
  where: Prisma.NotificationWhereInput,
  skip: number,
  take: number,
  now: Date = new Date(),
): Promise<NotificationWithEvent[]> {
  const actionable: NotificationWithEvent[] = [];
  let dbSkip = 0;
  let skipped = 0;
  const batchSize = 50;

  while (actionable.length < take) {
    const batch = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: dbSkip,
      take: batchSize,
      select: notificationSelect,
    });

    if (batch.length === 0) {
      break;
    }

    for (const notification of batch) {
      if (!isActionableNotification(notification, now)) {
        continue;
      }

      if (skipped < skip) {
        skipped += 1;
        continue;
      }

      actionable.push(notification);

      if (actionable.length === take) {
        break;
      }
    }

    dbSkip += batch.length;

    if (batch.length < batchSize) {
      break;
    }

    if (dbSkip > skip + take * MAX_FETCH_MULTIPLIER) {
      break;
    }
  }

  return actionable;
}

async function countActionableNotifications(
  where: Prisma.NotificationWhereInput,
  now: Date = new Date(),
): Promise<number> {
  const batchSize = 100;
  let dbSkip = 0;
  let total = 0;

  while (true) {
    const batch = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: dbSkip,
      take: batchSize,
      select: notificationSelect,
    });

    if (batch.length === 0) {
      break;
    }

    total += batch.filter((notification) =>
      isActionableNotification(notification, now),
    ).length;
    dbSkip += batch.length;

    if (batch.length < batchSize) {
      break;
    }
  }

  return total;
}

/**
 * Returns paginated notifications for a user, scoped to active subscriptions.
 */
export async function getNotificationsByUserId(
  userId: string,
  options: GetNotificationsOptions = {},
): Promise<PaginatedNotifications> {
  const page = Math.max(options.page ?? DEFAULT_PAGE, 1);
  const limit = Math.min(Math.max(options.limit ?? DEFAULT_LIMIT, 1), MAX_LIMIT);
  const skip = (page - 1) * limit;
  const where = buildWhereClause(userId, options);
  const now = new Date();

  const [totalCount, notifications] = await Promise.all([
    countActionableNotifications(where, now),
    fetchActionableNotifications(where, skip, limit, now),
  ]);

  const totalPages = totalCount === 0 ? 0 : Math.ceil(totalCount / limit);

  return {
    notifications: notifications.map(toDashboardNotification),
    page,
    totalPages,
    totalCount,
  };
}

/**
 * Returns true if the user has an active subscription for the given exam slug.
 */
export async function userHasExamSubscription(
  userId: string,
  examSlug: string,
): Promise<boolean> {
  const subscription = await prisma.subscription.findFirst({
    where: {
      userId,
      status: SubscriptionStatus.ACTIVE,
      exam: { slug: examSlug },
    },
    select: { id: true },
  });

  return subscription !== null;
}

export { DEFAULT_LIMIT, MAX_LIMIT };
