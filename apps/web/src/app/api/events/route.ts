import { NextResponse } from "next/server";

import { getEvents } from "@/services/event.service";

/**
 * GET /api/events
 *
 * Returns all events, newest first, with each event's related exam name and slug.
 * No authentication, pagination, or filtering in this sprint.
 */
export async function GET() {
  try {
    const events = await getEvents();

    return NextResponse.json(events, { status: 200 });
  } catch (error) {
    console.error("[GET /api/events]", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
