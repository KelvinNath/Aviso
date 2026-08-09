import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { parseEventTypesInput } from "@/lib/event-types";
import {
  cancelSubscription,
  updateSubscriptionEventTypes,
} from "@/services/subscription.service";

type RouteContext = {
  params: Promise<{ id: string }>;
};

/**
 * PATCH /api/subscriptions/[id]
 *
 * Updates event type preferences for an active subscription.
 */
export async function PATCH(request: Request, context: RouteContext) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    if (typeof body !== "object" || body === null) {
      return NextResponse.json(
        { error: "Missing required field: eventTypes" },
        { status: 400 },
      );
    }

    const eventTypes = parseEventTypesInput(
      (body as Record<string, unknown>).eventTypes,
    );

    if (!eventTypes) {
      return NextResponse.json(
        {
          error:
            "Invalid eventTypes: must be a non-empty array of valid event types",
        },
        { status: 400 },
      );
    }

    const subscription = await updateSubscriptionEventTypes(
      id,
      session.user.id,
      eventTypes,
    );

    if (!subscription) {
      return NextResponse.json(
        { error: "Subscription not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(subscription, { status: 200 });
  } catch (error) {
    console.error("[PATCH /api/subscriptions/[id]]", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/subscriptions/[id]
 *
 * Soft-deletes a subscription by setting its status to CANCELLED.
 */
export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    const subscription = await cancelSubscription(id, session.user.id);

    if (!subscription) {
      return NextResponse.json(
        { error: "Subscription not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(subscription, { status: 200 });
  } catch (error) {
    console.error("[DELETE /api/subscriptions/[id]]", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
