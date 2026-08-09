import { EventType, ExamCyclePhase } from "@prisma/client";
import { NextResponse } from "next/server";

import { auth } from "@/auth";
import {
  CURRENT_CYCLE_YEAR,
  getCurrentCyclePhase,
} from "@/services/exam.service";
import {
  createSubscription,
  findSubscriptionsByUserId,
} from "@/services/subscription.service";

/** Valid event type values from the Prisma schema enum. */
const VALID_EVENT_TYPES = new Set<string>(Object.values(EventType));

type SubscriptionRequestBody = {
  examId: string;
  eventTypes: EventType[];
};

/**
 * GET /api/subscriptions
 *
 * Returns the authenticated user's active subscriptions with related exam details.
 */
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const subscriptions = await findSubscriptionsByUserId(session.user.id);

    return NextResponse.json(subscriptions, { status: 200 });
  } catch (error) {
    console.error("[GET /api/subscriptions]", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/subscriptions
 *
 * Creates a subscription linking the authenticated user to an exam.
 */
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const validationError = validateSubscriptionBody(body);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const { examId, eventTypes } = body as SubscriptionRequestBody;

    const cyclePhase = await getCurrentCyclePhase(examId);

    if (cyclePhase === ExamCyclePhase.COMPLETE) {
      return NextResponse.json(
        { error: `${CURRENT_CYCLE_YEAR} cycle has ended for this exam` },
        { status: 400 },
      );
    }

    const subscription = await createSubscription({
      userId: session.user.id,
      examId,
      eventTypes,
    });

    return NextResponse.json(subscription, { status: 201 });
  } catch (error) {
    console.error("[POST /api/subscriptions]", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * Returns an error message if the body is invalid, otherwise null.
 */
function validateSubscriptionBody(body: unknown): string | null {
  if (typeof body !== "object" || body === null) {
    return "Missing required fields: examId, eventTypes";
  }

  const { examId, eventTypes } = body as Record<string, unknown>;

  if (typeof examId !== "string" || examId.trim() === "") {
    return "Missing required field: examId";
  }

  if (!Array.isArray(eventTypes) || eventTypes.length === 0) {
    return "Missing required field: eventTypes";
  }

  const allValid = eventTypes.every(
    (type) => typeof type === "string" && VALID_EVENT_TYPES.has(type),
  );
  if (!allValid) {
    return "Invalid eventTypes: must be a non-empty array of valid event types";
  }

  return null;
}
