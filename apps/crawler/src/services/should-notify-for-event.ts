import type { Event } from "@prisma/client";

import { isActionableEvent } from "@aviso/shared-utils";

/**
 * Returns true when a stored event should trigger user notifications.
 */
export function shouldNotifyForEvent(event: Event, now: Date = new Date()): boolean {
  return isActionableEvent(
    {
      notifyPolicy: event.notifyPolicy,
      publishedAt: event.publishedAt,
      detectedAt: event.detectedAt,
      effectiveDate: event.effectiveDate,
    },
    now,
  );
}
