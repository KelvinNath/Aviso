import {
  EventType,
  NotificationStatus,
  NotifyPolicy,
  SubscriptionStatus,
  type Prisma,
} from "@prisma/client";

import { getActionableEventCutoffs } from "@/lib/is-actionable-event";
import { prisma } from "@/lib/prisma";
import type {
  DashboardNotification,
  GetNotificationsOptions,
  PaginatedNotifications,
} from "@/types/dashboard-notification";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

function toDashboardNotification(
  notification: {
    id: string;
    status: NotificationStatus;
    createdAt: Date;
    deliveredAt: Date | null;
    event: {
      title: string;
      summary: string;
      type: EventType;
      sourceUrl: string;
      exam: {
        name: string;
        slug: string;
      };
    };
  },
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

  return {
    notifyPolicy: { not: NotifyPolicy.REFERENCE },
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

  const [totalCount, notifications] = await Promise.all([
    prisma.notification.count({ where }),
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      select: {
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
            exam: {
              select: {
                name: true,
                slug: true,
              },
            },
          },
        },
      },
    }),
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
