import { EventType } from "@prisma/client";
import { NextResponse } from "next/server";

import { auth } from "@/auth";
import {
  DEFAULT_LIMIT,
  getNotificationsByUserId,
  MAX_LIMIT,
  userHasExamSubscription,
} from "@/services/notification.service";

const VALID_EVENT_TYPES = new Set<string>(Object.values(EventType));

/**
 * GET /api/me/notifications
 *
 * Returns paginated notifications for the authenticated user.
 */
export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parsePositiveInt(searchParams.get("page"), 1);
    const limit = parsePositiveInt(searchParams.get("limit"), DEFAULT_LIMIT);

    if (limit > MAX_LIMIT) {
      return NextResponse.json(
        { error: `limit must be at most ${MAX_LIMIT}` },
        { status: 400 },
      );
    }

    const examSlug = searchParams.get("exam")?.trim() || undefined;
    if (examSlug) {
      const hasSubscription = await userHasExamSubscription(
        session.user.id,
        examSlug,
      );

      if (!hasSubscription) {
        return NextResponse.json(
          { error: "Invalid exam filter" },
          { status: 400 },
        );
      }
    }

    const eventTypes = parseEventTypes(searchParams);
    if (eventTypes === "invalid") {
      return NextResponse.json(
        { error: "Invalid eventType filter" },
        { status: 400 },
      );
    }

    const result = await getNotificationsByUserId(session.user.id, {
      page,
      limit,
      examSlug,
      eventTypes,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("[GET /api/me/notifications]", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

function parsePositiveInt(value: string | null, fallback: number): number {
  if (!value) {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return fallback;
  }

  return parsed;
}

function parseEventTypes(
  searchParams: URLSearchParams,
): EventType[] | undefined | "invalid" {
  const rawValues = searchParams
    .getAll("eventType")
    .flatMap((value) => value.split(","))
    .map((value) => value.trim())
    .filter(Boolean);

  const uniqueValues = [...new Set(rawValues)];

  if (uniqueValues.length === 0) {
    return undefined;
  }

  const allValid = uniqueValues.every((value) => VALID_EVENT_TYPES.has(value));
  if (!allValid) {
    return "invalid";
  }

  return uniqueValues as EventType[];
}
