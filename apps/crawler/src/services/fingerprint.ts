import { createHash } from "node:crypto";

/**
 * Builds a deterministic fingerprint for deduplicating events.
 * SHA256(examId + title + sourceUrl)
 */
export function buildEventFingerprint(
  examId: string,
  title: string,
  sourceUrl: string,
): string {
  return createHash("sha256")
    .update(examId + title + sourceUrl)
    .digest("hex");
}
