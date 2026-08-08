/**
 * Collapses whitespace in scraped text.
 */
export function normalizeText(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

/**
 * Normalizes a title for keyword matching: lowercase, strip punctuation,
 * collapse whitespace.
 */
export function normalizeTitleForClassification(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
