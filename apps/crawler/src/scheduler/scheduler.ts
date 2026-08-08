import { ExamStatus, NotificationStatus } from "@prisma/client";
import cron from "node-cron";

import {
  crawlExamSource,
  type CrawlStatistics,
} from "../crawler/crawler.service.js";
import { prisma } from "../lib/prisma.js";
import { processPendingNotifications } from "../workers/notification.worker.js";

const DIVIDER = "━━━━━━━━━━━━━━━━━━";

type SourceCrawlResult = {
  examName: string;
  statistics: CrawlStatistics;
};

function formatSummaryLine(result: SourceCrawlResult): string {
  const name = result.examName.padEnd(14, " ");

  if (!result.statistics.ok) {
    const error = result.statistics.error ?? "unknown error";
    return `${name} ✗  ${error}`;
  }

  return `${name} ✓  parsed ${result.statistics.parsedEvents} · ${result.statistics.newEvents} new`;
}

async function runWorkerPhase(): Promise<{
  processed: number;
  delivered: number;
  failed: number;
}> {
  const workerStartedAt = new Date();

  const pendingBefore = await prisma.notification.count({
    where: { status: NotificationStatus.PENDING },
  });

  try {
    await processPendingNotifications();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[scheduler] Worker failed: ${message}`);
  }

  const [delivered, failed] = await Promise.all([
    prisma.notification.count({
      where: {
        status: NotificationStatus.DELIVERED,
        deliveredAt: { gte: workerStartedAt },
      },
    }),
    prisma.notification.count({
      where: {
        status: NotificationStatus.FAILED,
        attemptedAt: { gte: workerStartedAt },
      },
    }),
  ]);

  return {
    processed: pendingBefore,
    delivered,
    failed,
  };
}

async function runScheduledCrawl(): Promise<void> {
  const startedAt = performance.now();
  const crawlResults: SourceCrawlResult[] = [];

  console.log(DIVIDER);
  console.log("Starting scheduled crawl...\n");

  const sources = await prisma.examSource.findMany({
    where: {
      isActive: true,
      exam: {
        status: ExamStatus.ACTIVE,
      },
    },
    include: {
      exam: true,
    },
    orderBy: {
      exam: {
        name: "asc",
      },
    },
  });

  for (const source of sources) {
    console.log("Processing:");
    console.log(`${source.exam.name}\n`);

    try {
      const statistics = await crawlExamSource({
        examId: source.examId,
        examSourceId: source.id,
        examSlug: source.exam.slug,
        examName: source.exam.name,
        url: source.url,
      });

      crawlResults.push({
        examName: source.exam.name,
        statistics,
      });

      if (statistics.ok) {
        console.log("Fetched HTML");
        console.log(`Parsed: ${statistics.parsedEvents}`);
        console.log(`Inserted: ${statistics.newEvents}`);
        console.log(
          `Notifications Created: ${statistics.notificationsQueued}\n`,
        );
      } else {
        console.error(
          `[scheduler] Source failed (${source.exam.name}): ${statistics.error ?? "unknown error"}\n`,
        );
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`[scheduler] Source failed (${source.exam.name}): ${message}\n`);

      crawlResults.push({
        examName: source.exam.name,
        statistics: {
          parsedEvents: 0,
          newEvents: 0,
          notificationsQueued: 0,
          ok: false,
          error: message,
        },
      });
    }
  }

  if (crawlResults.length > 0) {
    console.log("Summary");
    for (const result of crawlResults) {
      console.log(formatSummaryLine(result));
    }
    console.log("");
  }

  console.log("Worker:");

  const workerStats = await runWorkerPhase();

  console.log(`Processed: ${workerStats.processed}`);
  console.log(`Delivered: ${workerStats.delivered}`);

  if (workerStats.failed > 0) {
    console.log(`Failed: ${workerStats.failed}`);
  }

  const elapsedSeconds = ((performance.now() - startedAt) / 1000).toFixed(1);

  console.log(`\nFinished in ${elapsedSeconds}s`);
  console.log(DIVIDER);
}

/**
 * Starts the crawl scheduler. Runs every 5 minutes.
 */
export function startScheduler(): void {
  cron.schedule("*/5 * * * *", () => {
    runScheduledCrawl().catch((error) => {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`[scheduler] Scheduled run failed: ${message}`);
    });
  });

  console.log("[scheduler] Pipeline scheduler started (every 5 minutes)");
}

export { runScheduledCrawl };
