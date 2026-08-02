import type { EventType, NotificationStatus } from "@prisma/client";

export type DashboardNotification = {
  id: string;
  title: string;
  summary: string;
  examName: string;
  examSlug: string;
  eventType: EventType;
  sourceUrl: string;
  status: NotificationStatus;
  createdAt: string;
  deliveredAt: string | null;
};

export type PaginatedNotifications = {
  notifications: DashboardNotification[];
  page: number;
  totalPages: number;
  totalCount: number;
};

export type GetNotificationsOptions = {
  page?: number;
  limit?: number;
  examSlug?: string;
  eventTypes?: EventType[];
};

export type NotificationFilterId =
  | "all"
  | "results"
  | "admit-cards"
  | "answer-keys"
  | "exam-dates"
  | "applications"
  | "counselling";

export type NotificationFilterOption = {
  id: NotificationFilterId;
  label: string;
  eventTypes: EventType[];
};

export type NotificationsApiResponse = PaginatedNotifications;
