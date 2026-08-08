import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { EventType } from "@prisma/client";
import { describe, expect, it } from "vitest";

import { shouldIncludeJeeAdvancedAnnouncement } from "./jee-advanced/cycle-filter.js";
import { JeeAdvancedParser } from "./jee-advanced.parser.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixturePath = join(
  __dirname,
  "fixtures",
  "jee-advanced-homepage.html",
);
const fixtureHtml = readFileSync(fixturePath, "utf-8");

describe("shouldIncludeJeeAdvancedAnnouncement", () => {
  it("includes titles from the current exam cycle year", () => {
    expect(
      shouldIncludeJeeAdvancedAnnouncement(
        "JEE (Advanced) 2026 Results",
        undefined,
        new Date("2026-08-02"),
      ),
    ).toBe(true);
  });

  it("excludes old-cycle titles with stale posted dates", () => {
    expect(
      shouldIncludeJeeAdvancedAnnouncement(
        "JEE (Advanced) 2024 Information Brochure",
        new Date("2024-12-05"),
        new Date("2026-08-02"),
      ),
    ).toBe(false);
  });
});

describe("JeeAdvancedParser", () => {
  it("parses result, admit card, answer key, and counselling blocks", () => {
    const parser = new JeeAdvancedParser();
    const events = parser.parse(fixtureHtml);

    const titles = events.map((event) => event.title);

    expect(titles).toContain("JEE (Advanced) 2026 Results");
    expect(titles).toContain("Admit Card for JEE(Advanced) 2026 Examination");
    expect(titles).toContain("JEE (Advanced) 2026 Final Answer Keys");
    expect(titles).toContain("Round 2 Allotment and Deadline for JoSAA 2026");
    expect(titles).not.toContain("JEE (Advanced) 2024 Information Brochure");
  });

  it("classifies announcements with shared keyword rules", () => {
    const parser = new JeeAdvancedParser();
    const events = parser.parse(fixtureHtml);

    const byTitle = new Map(events.map((event) => [event.title, event.type]));

    expect(byTitle.get("JEE (Advanced) 2026 Results")).toBe(EventType.RESULT);
    expect(byTitle.get("Admit Card for JEE(Advanced) 2026 Examination")).toBe(
      EventType.ADMIT_CARD_RELEASED,
    );
    expect(byTitle.get("JEE (Advanced) 2026 Final Answer Keys")).toBe(
      EventType.ANSWER_KEY,
    );
    expect(byTitle.get("Round 2 Allotment and Deadline for JoSAA 2026")).toBe(
      EventType.COUNSELLING_OPEN,
    );
  });

  it("deduplicates by sourceUrl within a crawl", () => {
    const parser = new JeeAdvancedParser();
    const events = parser.parse(fixtureHtml);

    const resultEvents = events.filter(
      (event) => event.title === "JEE (Advanced) 2026 Results",
    );

    expect(resultEvents).toHaveLength(1);
    expect(resultEvents[0]?.sourceUrl).toBe(
      "https://cdata.jeeadv.ac.in/result2026/",
    );
  });

  it("parses publishedAt from posted date text", () => {
    const parser = new JeeAdvancedParser();
    const events = parser.parse(fixtureHtml);

    const resultEvent = events.find(
      (event) => event.title === "JEE (Advanced) 2026 Results",
    );

    expect(resultEvent?.publishedAt).toBeDefined();
    expect(resultEvent?.publishedAt?.getFullYear()).toBe(2026);
    expect(resultEvent?.publishedAt?.getMonth()).toBe(5);
  });
});
