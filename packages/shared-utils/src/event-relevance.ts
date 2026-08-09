export const FRESH_PUBLISH_GRACE_MS = 48 * 60 * 60 * 1000;
export const LATE_DISCOVERY_GRACE_MS = 7 * 24 * 60 * 60 * 1000;

export type NotifyPolicy = "ALERT" | "REFERENCE";

export type EventRelevanceInput = {
  notifyPolicy: NotifyPolicy;
  publishedAt: Date | null;
  detectedAt: Date;
  effectiveDate: Date | null;
};

/**
 * Returns true when an event is actionable for notify/display (not backfill or reference).
 */
export function isActionableEvent(
  input: EventRelevanceInput,
  now: Date = new Date(),
): boolean {
  if (input.notifyPolicy === "REFERENCE") {
    return false;
  }

  if (input.effectiveDate && input.effectiveDate < now) {
    return false;
  }

  if (input.publishedAt) {
    if (input.publishedAt.getTime() < now.getTime() - FRESH_PUBLISH_GRACE_MS) {
      return false;
    }

    if (
      input.detectedAt.getTime() - input.publishedAt.getTime() >
      LATE_DISCOVERY_GRACE_MS
    ) {
      return false;
    }
  }

  return true;
}

export type ActionableEventFilterInput = {
  now?: Date;
};

/**
 * Builds Prisma-compatible filter fields for actionable events.
 * Late-discovery is enforced in isActionableEvent; stale publish covers most backfill rows.
 */
export function getActionableEventCutoffs(now: Date = new Date()): {
  freshPublishCutoff: Date;
} {
  return {
    freshPublishCutoff: new Date(now.getTime() - FRESH_PUBLISH_GRACE_MS),
  };
}
