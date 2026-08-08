import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { KiiteeParser } from "./kiitee.parser.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixturePath = join(__dirname, "fixtures", "kiitee-homepage.html");
const fixtureHtml = readFileSync(fixturePath, "utf-8");

describe("KiiteeParser", () => {
  it("parses 2026 notice links from notice board", () => {
    const parser = new KiiteeParser();
    const events = parser.parse(fixtureHtml);
    const titles = events.map((event) => event.title);

    expect(titles).toContain("Information Brochure KIITEE 2026");
    expect(titles).toContain("Apply Now – KIITEE 2026");
    expect(events.every((event) => event.title.includes("2026"))).toBe(true);
  });
});
