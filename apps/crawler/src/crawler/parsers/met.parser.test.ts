import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { MetParser } from "./met.parser.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixturePath = join(__dirname, "fixtures", "met-overview.html");
const fixtureHtml = readFileSync(fixturePath, "utf-8");

describe("MetParser", () => {
  it("parses MET 2026 leftnav links and apply URL", () => {
    const parser = new MetParser();
    const events = parser.parse(fixtureHtml);
    const titles = events.map((event) => event.title);

    expect(titles.some((title) => title.includes("MET 2026 Schedule"))).toBe(
      true,
    );
    expect(titles.some((title) => title.includes("MET 2026 Syllabus"))).toBe(
      true,
    );
    expect(titles.some((title) => title.includes("Apply Online"))).toBe(true);
    expect(titles.some((title) => title.includes("Tele MANAS"))).toBe(false);
  });

  it("deduplicates apply links", () => {
    const parser = new MetParser();
    const events = parser.parse(fixtureHtml);
    const applyEvents = events.filter((event) =>
      event.sourceUrl.includes("apply.manipal.edu"),
    );

    expect(applyEvents).toHaveLength(1);
  });
});
