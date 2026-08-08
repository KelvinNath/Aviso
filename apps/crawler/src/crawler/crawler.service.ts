import { createNotificationsForEvent } from "../services/notification.service.js";
import { ingestEvents } from "../services/event.service.js";
import { getParser } from "./parser.factory.js";

export type ExamSourceInput = {
  examId: string;
  examSourceId: string;
  examSlug: string;
  examName: string;
  url: string;
};

export type CrawlStatistics = {
  parsedEvents: number;
  newEvents: number;
  notificationsQueued: number;
  ok: boolean;
  error?: string;
};

const emptyStatistics = (error?: string): CrawlStatistics => ({
  parsedEvents: 0,
  newEvents: 0,
  notificationsQueued: 0,
  ok: false,
  error,
});

/**
 * Orchestrates crawling for a single exam source.
 *
 * Flow:
 * 1. Fetch HTML from the source URL
 * 2. Parse into normalized events
 * 3. Ingest new events into the database
 * 4. Queue pending notifications for each new event
 */
export async function crawlExamSource(
  source: ExamSourceInput,
): Promise<CrawlStatistics> {
  try {
    const response = await fetch(source.url);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    const parser = getParser(source.examSlug);
    const parsedEvents = parser.parse(html);

    const newEvents = await ingestEvents(
      source.examId,
      source.examSourceId,
      parsedEvents,
    );

    let notificationsQueued = 0;

    for (const event of newEvents) {
      const { createdCount } = await createNotificationsForEvent(event);
      notificationsQueued += createdCount;
    }

    const statistics: CrawlStatistics = {
      parsedEvents: parsedEvents.length,
      newEvents: newEvents.length,
      notificationsQueued,
      ok: true,
    };

    console.log(`[crawler] Exam: ${source.examName}`);
    console.log(`[crawler] Parsed events: ${statistics.parsedEvents}`);
    console.log(`[crawler] New events: ${statistics.newEvents}`);
    console.log(
      `[crawler] Notifications queued: ${statistics.notificationsQueued}`,
    );

    return statistics;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[crawler] Failed to crawl ${source.url}: ${message}`);

    return emptyStatistics(message);
  }
}
