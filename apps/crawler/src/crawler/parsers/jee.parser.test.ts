import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { EventType } from "@prisma/client";
import { describe, expect, it } from "vitest";

import { JeeParser } from "./jee.parser.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixturePath = join(__dirname, "fixtures", "jee-main-homepage.html");
const fixtureHtml = readFileSync(fixturePath, "utf-8");

describe("JeeParser", () => {
  it("parses announcements from ticker and notices", () => {
    const parser = new JeeParser();
    const events = parser.parse(fixtureHtml);

    expect(events).toHaveLength(2);
    expect(events.map((event) => event.title)).toContain(
      "JEE Main Session 2 Result Declared",
    );
    expect(events.map((event) => event.title)).toContain(
      "Release of Admit Card for JEE Main",
    );
  });

  it("deduplicates by source URL", () => {
    const parser = new JeeParser();
    const events = parser.parse(fixtureHtml);

    const urls = events.map((event) => event.sourceUrl);
    expect(new Set(urls).size).toBe(urls.length);
  });

  it("skips View All links", () => {
    const parser = new JeeParser();
    const events = parser.parse(fixtureHtml);

    expect(events.some((event) => event.title.toLowerCase() === "view all")).toBe(
      false,
    );
  });

  it("assigns event types via shared classifier", () => {
    const parser = new JeeParser();
    const events = parser.parse(fixtureHtml);

    const resultEvent = events.find(
      (event) => event.title === "JEE Main Session 2 Result Declared",
    );
    const admitEvent = events.find(
      (event) => event.title === "Release of Admit Card for JEE Main",
    );

    expect(resultEvent?.type).toBe(EventType.RESULT);
    expect(admitEvent?.type).toBe(EventType.ADMIT_CARD_RELEASED);
  });
});
