/**
 * Hook for filtering announcements before ingest.
 * Returns true by default — extend when enabling new exams to avoid historical floods.
 */
export function shouldIngestAnnouncement(_title: string, _sourceUrl: string): boolean {
  return true;
}
