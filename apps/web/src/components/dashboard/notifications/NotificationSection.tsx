"use client";

import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { copy } from "@/lib/copy";
import { getFilterEventTypes } from "@/lib/notification-filters";
import type {
  DashboardNotification,
  NotificationFilterId,
  NotificationsApiResponse,
} from "@/types/dashboard-notification";

import { NotificationCard } from "./NotificationCard";
import { NotificationFilters } from "./NotificationFilters";

type SubscribedExam = {
  id: string;
  name: string;
  slug: string;
};

type NotificationSectionProps = {
  subscribedExams: SubscribedExam[];
};

const PAGE_SIZE = 10;

function buildNotificationsUrl(
  page: number,
  filterId: NotificationFilterId,
  examSlug: string,
): string {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(PAGE_SIZE),
  });

  if (examSlug) {
    params.set("exam", examSlug);
  }

  const eventTypes = getFilterEventTypes(filterId);
  for (const eventType of eventTypes) {
    params.append("eventType", eventType);
  }

  return `/api/me/notifications?${params.toString()}`;
}

export function NotificationSection({
  subscribedExams,
}: NotificationSectionProps) {
  const [notifications, setNotifications] = useState<DashboardNotification[]>(
    [],
  );
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [activeFilter, setActiveFilter] = useState<NotificationFilterId>("all");
  const [examSlug, setExamSlug] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(
    async (targetPage: number, append: boolean) => {
      if (append) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      try {
        const response = await fetch(
          buildNotificationsUrl(targetPage, activeFilter, examSlug),
        );

        if (!response.ok) {
          const data = (await response.json()) as { error?: string };
          throw new Error(data.error ?? "Failed to load notifications");
        }

        const data = (await response.json()) as NotificationsApiResponse;

        setNotifications((current) =>
          append ? [...current, ...data.notifications] : data.notifications,
        );
        setPage(data.page);
        setTotalPages(data.totalPages);
        setTotalCount(data.totalCount);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
        if (!append) {
          setNotifications([]);
          setTotalPages(0);
          setTotalCount(0);
        }
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [activeFilter, examSlug],
  );

  useEffect(() => {
    void fetchNotifications(1, false);
  }, [fetchNotifications]);

  function handleFilterChange(filterId: NotificationFilterId) {
    setActiveFilter(filterId);
    setPage(1);
  }

  function handleExamChange(nextExamSlug: string) {
    setExamSlug(nextExamSlug);
    setPage(1);
  }

  function handleLoadMore() {
    if (page >= totalPages || isLoadingMore) {
      return;
    }

    void fetchNotifications(page + 1, true);
  }

  const showEmptyState = !isLoading && notifications.length === 0 && !error;
  const showLoadMore = page < totalPages && notifications.length > 0;

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 border-b-2 border-aviso-dark/10 pb-4 dark:border-aviso-light/10">
        <h2 className="font-heading text-xl font-bold uppercase">
          {copy.dashboard.notificationsTitle}
        </h2>
        <p className="font-body text-sm opacity-70">
          {copy.dashboard.notificationsDescription}
        </p>
      </div>

      <div className="space-y-3">
        {subscribedExams.length > 1 && (
          <label className="flex flex-col gap-2">
            <span className="font-heading text-xs font-bold uppercase tracking-wide opacity-70">
              Exam
            </span>
            <select
              value={examSlug}
              onChange={(event) => handleExamChange(event.target.value)}
              className="rounded-chunky brutal-border bg-aviso-light px-4 py-2 font-body text-sm dark:bg-aviso-dark"
            >
              <option value="">All exams</option>
              {subscribedExams.map((exam) => (
                <option key={exam.id} value={exam.slug}>
                  {exam.name}
                </option>
              ))}
            </select>
          </label>
        )}

        <NotificationFilters
          activeFilter={activeFilter}
          onFilterChange={handleFilterChange}
        />
      </div>

      {error && (
        <p className="rounded-chunky brutal-border bg-aviso-coral/20 px-4 py-3 font-body text-sm">
          {error}
        </p>
      )}

      {isLoading && (
        <p className="font-body text-sm opacity-60">
          {copy.dashboard.notificationsLoading}
        </p>
      )}

      {showEmptyState && (
        <Card variant="sky" className="text-center">
          <CardTitle className="text-2xl">{copy.dashboard.notificationsEmptyTitle}</CardTitle>
          <CardDescription className="mx-auto max-w-md text-base">
            {copy.dashboard.notificationsEmptyBody}
          </CardDescription>
        </Card>
      )}

      {!isLoading && notifications.length > 0 && (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <NotificationCard key={notification.id} notification={notification} />
          ))}
        </div>
      )}

      {showLoadMore && (
        <div className="flex justify-center pt-2">
          <Button
            variant="secondary"
            size="sm"
            disabled={isLoadingMore}
            onClick={handleLoadMore}
          >
            {isLoadingMore ? "Loading..." : copy.dashboard.notificationsLoadMore}
          </Button>
        </div>
      )}

      {!isLoading && notifications.length > 0 && (
        <p className="text-center font-body text-xs opacity-50">
          Showing {notifications.length} of {totalCount}
        </p>
      )}
    </section>
  );
}
