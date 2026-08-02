import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { getUserById } from "@/services/user.service";

/**
 * GET /api/me
 *
 * Returns the currently authenticated user from the database.
 * Session provides identity; the service layer loads the full profile.
 */
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await getUserById(session.user.id);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error("[GET /api/me]", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
