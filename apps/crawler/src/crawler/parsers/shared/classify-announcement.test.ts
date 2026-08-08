import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { EventType } from "@prisma/client";
import { describe, expect, it } from "vitest";

import { classifyAnnouncementTitle } from "./classify-announcement.js";

describe("classifyAnnouncementTitle", () => {
  it("classifies result announcements", () => {
    expect(
      classifyAnnouncementTitle("Declaration of Final NTA Scores for Session 2"),
    ).toBe(EventType.RESULT);
  });

  it("classifies admit card announcements", () => {
    expect(
      classifyAnnouncementTitle("Release of Admit Card for JEE Main 2026"),
    ).toBe(EventType.ADMIT_CARD_RELEASED);
  });

  it("classifies application open announcements", () => {
    expect(
      classifyAnnouncementTitle("Online Application Form for JEE Main is now open"),
    ).toBe(EventType.APPLICATION_OPEN);
  });

  it("classifies application close announcements", () => {
    expect(
      classifyAnnouncementTitle("Last date for registration extended"),
    ).toBe(EventType.APPLICATION_CLOSE);
  });

  it("falls back to EXAM_DATE for generic advisories", () => {
    expect(
      classifyAnnouncementTitle("Advisory for candidates appearing in Session 1"),
    ).toBe(EventType.EXAM_DATE);
  });
});
