import type { EventType } from "@prisma/client";
import type { NotifyPolicy } from "@aviso/shared-utils";

export type ParsedEvent = {
  type: EventType;
  title: string;
  summary: string;
  sourceUrl: string;
  publishedAt?: Date;
  notifyPolicy?: NotifyPolicy;
};
