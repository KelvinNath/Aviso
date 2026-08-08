import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { shouldIncludeMhtCetAnnouncement } from "./mht-cet/scope-filter.js";
import { MhtCetParser } from "./mht-cet.parser.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixturePath = join(__dirname, "fixtures", "mht-cet-homepage.html");
const fixtureHtml = readFileSync(fixturePath, "utf-8");

describe("shouldIncludeMhtCetAnnouncement", () => {
  it("includes MHT-CET PCM and technical education notices", () => {
    expect(
      shouldIncludeMhtCetAnnouncement(
        "MHT-CET 2026: Document on Normalization",
      ),
    ).toBe(true);
    expect(
      shouldIncludeMhtCetAnnouncement(
        "Important Notice: Candidates who have appeared for MHT-CET 2026 (PCM or PCB)",
      ),
    ).toBe(true);
  });

  it("excludes MBA and LLB notices", () => {
    expect(
      shouldIncludeMhtCetAnnouncement("MBA/MMS CET: Document on Normalization"),
    ).toBe(false);
    expect(
      shouldIncludeMhtCetAnnouncement(
        "Centralized Admission Process (CAP) Tentative Schedule for LLB 5 Yrs",
      ),
    ).toBe(false);
  });
});

describe("MhtCetParser", () => {
  it("parses engineering-scoped marquee items only", () => {
    const parser = new MhtCetParser();
    const events = parser.parse(fixtureHtml);
    const titles = events.map((event) => event.title);

    expect(titles.some((title) => title.includes("MHT-CET 2026"))).toBe(true);
    expect(titles.some((title) => title.includes("MBA"))).toBe(false);
    expect(titles.some((title) => title.includes("LLB"))).toBe(false);
  });

  it("deduplicates marquee clones by sourceUrl", () => {
    const parser = new MhtCetParser();
    const events = parser.parse(fixtureHtml);
    const mhtEvents = events.filter((event) => event.title.includes("MHT-CET"));

    expect(mhtEvents.length).toBeGreaterThanOrEqual(1);
    expect(new Set(events.map((event) => event.sourceUrl)).size).toBe(
      events.length,
    );
  });
});
