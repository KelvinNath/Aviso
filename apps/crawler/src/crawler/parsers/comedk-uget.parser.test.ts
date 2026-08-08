import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { EventType } from "@prisma/client";
import { describe, expect, it } from "vitest";

import { ComedkUgetParser } from "./comedk-uget.parser.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixturePath = join(__dirname, "fixtures", "comedk-uget-notification.html");
const fixtureHtml = readFileSync(fixturePath, "utf-8");

describe("ComedkUgetParser", () => {
  it("parses brochures, notifications, and calendar rows for 2026", () => {
    const parser = new ComedkUgetParser();
    const events = parser.parse(fixtureHtml);
    const titles = events.map((event) => event.title);

    expect(titles).toContain("COMEDK UGET Exam Brochure-2026");
    expect(titles).toContain(
      "COMEDK 2026 exam date announcement notified on 08.01.2026",
    );
    expect(titles.some((title) => title.includes("COMEDK UGET"))).toBe(true);
    expect(titles.some((title) => title.includes("09-May-2026"))).toBe(true);
  });

  it("classifies key announcements", () => {
    const parser = new ComedkUgetParser();
    const events = parser.parse(fixtureHtml);
    const byTitle = new Map(events.map((event) => [event.title, event.type]));

    expect(byTitle.get("COMEDK UGET Exam Brochure-2026")).toBe(
      EventType.APPLICATION_OPEN,
    );

    const examRow = events.find((event) => event.title.includes("09-May-2026"));
    expect(examRow?.type).toBe(EventType.EXAM_DATE);
  });

  it("deduplicates by sourceUrl", () => {
    const parser = new ComedkUgetParser();
    const events = parser.parse(fixtureHtml);
    const urls = events.map((event) => event.sourceUrl);

    expect(new Set(urls).size).toBe(urls.length);
  });
});
