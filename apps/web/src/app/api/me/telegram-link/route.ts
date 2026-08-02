import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { createTelegramLinkForUser } from "@/services/telegram-link.service";

/**
 * POST /api/me/telegram-link
 *
 * Generates a one-time Telegram deep-link code for the authenticated user.
 */
export async function POST() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const link = await createTelegramLinkForUser(session.user.id);

    return NextResponse.json(link, { status: 200 });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "NEXT_PUBLIC_TELEGRAM_BOT_USERNAME is not configured"
    ) {
      return NextResponse.json(
        { error: "Telegram bot username is not configured" },
        { status: 503 },
      );
    }

    console.error("[POST /api/me/telegram-link]", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
