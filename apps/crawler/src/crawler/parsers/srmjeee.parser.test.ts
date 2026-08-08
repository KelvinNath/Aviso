import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { EventType } from "@prisma/client";
import { describe, expect, it } from "vitest";

import { SrmjeeeParser } from "./srmjeee.parser.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixturePath = join(__dirname, "fixtures", "srmjeee-btech.html");
const fixtureHtml = readFileSync(fixturePath, "utf-8");

describe("SrmjeeeParser", () => {
  it("parses phase exam dates and application deadlines", () => {
    const parser = new SrmjeeeParser();
    const events = parser.parse(fixtureHtml);
    const titles = events.map((event) => event.title);

    expect(titles.some((title) => title.includes("Phase 1"))).toBe(true);
    expect(titles.some((title) => title.includes("24.04.2026"))).toBe(true);
    expect(titles.some((title) => title.includes("Application Deadline"))).toBe(
      true,
    );
    expect(events.filter((event) => event.title.includes("SRMJEEE 2026")).length).toBeGreaterThanOrEqual(
      9,
    );
  });

  it("classifies exam sessions and deadlines", () => {
    const parser = new SrmjeeeParser();
    const events = parser.parse(fixtureHtml);

    const phase1Exam = events.find(
      (event) =>
        event.title.includes("Phase 1") &&
        event.title.includes("Remote Proctored"),
    );
    expect(phase1Exam?.type).toBe(EventType.EXAM_DATE);

    const phase1Deadline = events.find(
      (event) =>
        event.title.includes("Phase 1") &&
        event.title.includes("Application Deadline"),
    );
    expect(phase1Deadline?.type).toBe(EventType.APPLICATION_CLOSE);
  });

  it("includes 2026 FAQ PDF", () => {
    const parser = new SrmjeeeParser();
    const events = parser.parse(fixtureHtml);
    const faq = events.find((event) => event.title.includes("FAQ"));

    expect(faq?.sourceUrl).toContain("SRMJEEE-2026-FAQs.pdf");
  });
});
