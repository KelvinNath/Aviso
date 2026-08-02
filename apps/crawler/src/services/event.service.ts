import { Prisma, type Event } from "@prisma/client";

import type { ParsedEvent } from "../crawler/types/parsed-event.js";
import { prisma } from "../lib/prisma.js";
import { buildEventFingerprint } from "./fingerprint.js";

/**
 * Persists parsed events from the crawler into the database.
 *
 * Flow:
 * 1. Compute fingerprint for each ParsedEvent
 * 2. Skip duplicates already stored
 * 3. Create new Event records
 * 4. Return only newly created events
 */
export async function ingestEvents(
  examId: string,
  examSourceId: string,
  events: ParsedEvent[],
): Promise<Event[]> {
  const createdEvents: Event[] = [];

  for (const parsed of events) {
    const fingerprint = buildEventFingerprint(
      examId,
      parsed.title,
      parsed.sourceUrl,
    );

    const existing = await prisma.event.findUnique({
      where: { fingerprint },
    });

    if (existing) {
      continue;
    }

    try {
      const event = await prisma.event.create({
        data: {
          examId,
          examSourceId,
          type: parsed.type,
          title: parsed.title,
          summary: parsed.summary,
          sourceUrl: parsed.sourceUrl,
          fingerprint,
          publishedAt: parsed.publishedAt ?? null,
          detectedAt: new Date(),
        },
      });

      createdEvents.push(event);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        continue;
      }

      throw error;
    }
  }

  return createdEvents;
}
