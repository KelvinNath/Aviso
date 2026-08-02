import type { EventType } from "@prisma/client";

export type ParsedEvent = {
  type: EventType;
  title: string;
  summary: string;
  sourceUrl: string;
  publishedAt?: Date;
};
