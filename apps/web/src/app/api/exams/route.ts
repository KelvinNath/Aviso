import { NextResponse } from "next/server";

import { getActiveExams } from "@/services/exam.service";

/**
 * GET /api/exams
 *
 * Returns all active exams, ordered alphabetically by name.
 * No authentication, pagination, or filtering in this sprint.
 */
export async function GET() {
  try {
    const exams = await getActiveExams();

    return NextResponse.json(exams, { status: 200 });
  } catch (error) {
    console.error("[GET /api/exams]", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
