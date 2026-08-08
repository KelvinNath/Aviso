import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { EventType } from "@prisma/client";
import { describe, expect, it } from "vitest";

import { BitsatParser } from "./bitsat.parser.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixturePath = join(__dirname, "fixtures", "bitsat-lp.html");
const fixtureHtml = readFileSync(fixturePath, "utf-8");

describe("BitsatParser", () => {
  it("parses fraud notice and timeline cards for 2026", () => {
    const parser = new BitsatParser();
    const events = parser.parse(fixtureHtml);
    const titles = events.map((event) => event.title);

    expect(titles.some((title) => title.includes("fraudulent"))).toBe(true);
    expect(titles.some((title) => title.includes("Submission"))).toBe(true);
    expect(titles.some((title) => title.includes("Session 1"))).toBe(true);
    expect(events.filter((event) => event.title.includes("BITSAT 2026"))).toHaveLength(
      6,
    );
  });

  it("classifies submission deadline and exam sessions", () => {
    const parser = new BitsatParser();
    const events = parser.parse(fixtureHtml);

    const deadline = events.find((event) => event.title.includes("Submission"));
    expect(deadline?.type).toBe(EventType.APPLICATION_CLOSE);

    const session1 = events.find((event) => event.title.includes("Session 1"));
    expect(session1?.type).toBe(EventType.EXAM_DATE);
  });

  it("deduplicates repeated fraud notice in marquee", () => {
    const parser = new BitsatParser();
    const events = parser.parse(fixtureHtml);
    const fraudNotices = events.filter((event) =>
      event.title.toLowerCase().includes("fraudulent"),
    );

    expect(fraudNotices).toHaveLength(1);
  });
});
