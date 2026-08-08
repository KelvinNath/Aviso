import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { EventType } from "@prisma/client";
import { describe, expect, it } from "vitest";

import { WbjeeParser } from "./wbjee.parser.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixturePath = join(__dirname, "fixtures", "wbjee-homepage.html");
const fixtureHtml = readFileSync(fixturePath, "utf-8");

describe("WbjeeParser", () => {
  it("parses 2026 announcements from gen-list sections", () => {
    const parser = new WbjeeParser();
    const events = parser.parse(fixtureHtml);
    const titles = events.map((event) => event.title);

    expect(titles.some((title) => title.includes("Information Bulletin"))).toBe(
      true,
    );
    expect(titles.some((title) => title.includes("Counselling"))).toBe(true);
    expect(events.every((event) => event.title.includes("2026"))).toBe(true);
  });

  it("deduplicates repeated PDF links across sections", () => {
    const parser = new WbjeeParser();
    const events = parser.parse(fixtureHtml);
    const counsellingNotice = events.filter((event) =>
      event.title.includes("Counselling Notification of WBJEE 2026"),
    );

    expect(counsellingNotice).toHaveLength(1);
  });

  it("classifies information bulletin as exam-related notice", () => {
    const parser = new WbjeeParser();
    const events = parser.parse(fixtureHtml);
    const bulletin = events.find((event) =>
      event.title.includes("Information Bulletin"),
    );

    expect(bulletin?.type).toBe(EventType.EXAM_DATE);
  });
});
