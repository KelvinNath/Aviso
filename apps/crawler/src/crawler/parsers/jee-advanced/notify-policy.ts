import { normalizeTitleForClassification } from "../shared/normalize-title.js";

import type { NotifyPolicy } from "@aviso/shared-utils";

const REFERENCE_TITLE_PATTERNS = [
  /^examination date$/i,
  /^eligibility criteria$/i,
  /^information brochure$/i,
  /examination pattern/i,
  /practice tests for jee \(advanced\)/i,
  /video guide for filling jee \(advanced\)/i,
  /issues with registration/i,
] as const;

/**
 * Marks evergreen JEE Advanced homepage blocks as reference-only (ingest, do not notify).
 */
export function getJeeAdvancedNotifyPolicy(title: string): NotifyPolicy {
  const normalized = normalizeTitleForClassification(title);

  if (
    REFERENCE_TITLE_PATTERNS.some(
      (pattern) => pattern.test(normalized) || pattern.test(title),
    )
  ) {
    return "REFERENCE";
  }

  return "ALERT";
}
