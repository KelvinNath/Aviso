import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { EventType } from "@prisma/client";
import { describe, expect, it } from "vitest";

import { ViteeeParser } from "./viteee.parser.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixturePath = join(__dirname, "fixtures", "viteee-homepage.html");
const fixtureHtml = readFileSync(fixturePath, "utf-8");

describe("ViteeeParser", () => {
  it("parses marquee notices and important dates for 2026", () => {
    const parser = new ViteeeParser();
    const events = parser.parse(fixtureHtml);
    const titles = events.map((event) => event.title);

    expect(titles.some((title) => title.includes("Fake Admission Alert"))).toBe(
      true,
    );
    expect(titles.some((title) => title.includes("MOCK TEST"))).toBe(true);
    expect(titles.some((title) => title.includes("Last Date for Online Application"))).toBe(
      true,
    );
    expect(titles.some((title) => title.includes("VITEEE examination"))).toBe(
      true,
    );
  });

  it("classifies mock test and application deadline", () => {
    const parser = new ViteeeParser();
    const events = parser.parse(fixtureHtml);

    const mockTest = events.find((event) => event.title.includes("MOCK TEST"));
    expect(mockTest?.type).toBe(EventType.EXAM_DATE);

    const deadline = events.find((event) =>
      event.title.includes("Last Date for Online Application"),
    );
    expect(deadline?.type).toBe(EventType.APPLICATION_CLOSE);
  });

  it("deduplicates by sourceUrl", () => {
    const parser = new ViteeeParser();
    const events = parser.parse(fixtureHtml);

    expect(new Set(events.map((event) => event.sourceUrl)).size).toBe(
      events.length,
    );
  });
});
