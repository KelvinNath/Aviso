import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { cancelSubscription } from "@/services/subscription.service";

type RouteContext = {
  params: Promise<{ id: string }>;
};

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
