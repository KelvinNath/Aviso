"use client";

import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { formatRelativeTime } from "@/lib/format-relative-time";
import { EVENT_TYPE_OPTIONS } from "@/lib/event-types";
import type { DashboardNotification } from "@/types/dashboard-notification";
import { NotificationStatus } from "@prisma/client";

const STATUS_LABELS: Record<NotificationStatus, string> = {
  [NotificationStatus.PENDING]: "Pending",
  [NotificationStatus.DELIVERED]: "Delivered",
  [NotificationStatus.FAILED]: "Failed",
};

const STATUS_VARIANTS = {
  [NotificationStatus.PENDING]: "yellow",
  [NotificationStatus.DELIVERED]: "lime",
  [NotificationStatus.FAILED]: "coral",
} as const;

const eventTypeMeta = new Map(
  EVENT_TYPE_OPTIONS.map((option) => [option.value, option]),
);

type NotificationCardProps = {
  notification: DashboardNotification;
};

export function NotificationCard({ notification }: NotificationCardProps) {
  const meta = eventTypeMeta.get(notification.eventType);
  const icon = meta?.emoji ?? "📢";
  const typeLabel = meta?.label ?? notification.eventType;

  return (
    <Card variant="default" className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xl" aria-hidden>
              {icon}
            </span>
            <Badge variant="sky">{notification.examName}</Badge>
            <Badge variant="default">{typeLabel}</Badge>
          </div>
          <CardTitle className="mt-3 text-lg">{notification.title}</CardTitle>
          {notification.summary.trim() && (
            <CardDescription className="text-base">
              {notification.summary}
            </CardDescription>
          )}
        </div>

        <Badge
          variant={STATUS_VARIANTS[notification.status]}
          className="shrink-0 self-start"
        >
          {STATUS_LABELS[notification.status]}
        </Badge>
      </div>

      <div className="flex flex-col gap-3 border-t-2 border-aviso-dark/10 pt-4 sm:flex-row sm:items-center sm:justify-between dark:border-aviso-light/10">
        <p className="font-body text-xs opacity-60">
          {formatRelativeTime(notification.createdAt)}
        </p>

        {notification.sourceUrl.trim() && (
          <ButtonLink
            href={notification.sourceUrl}
            variant="secondary"
            size="sm"
            className="self-start sm:self-center"
            target="_blank"
            rel="noopener noreferrer"
          >
            Official Notice
          </ButtonLink>
        )}
      </div>
    </Card>
  );
}
