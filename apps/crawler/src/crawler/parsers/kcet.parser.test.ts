import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { KcetParser } from "./kcet.parser.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixturePath = join(__dirname, "fixtures", "kcet-kea-homepage.html");
const fixtureHtml = readFileSync(fixturePath, "utf-8");

describe("KcetParser", () => {
  it("parses UGCET admission links and excludes DCET/PGCET", () => {
    const parser = new KcetParser();
    const events = parser.parse(fixtureHtml);
    const titles = events.map((event) => event.title);

    expect(titles.some((title) => title.includes("UGCET / UGNEET"))).toBe(true);
    expect(titles.some((title) => title.includes("UGCET - 2026"))).toBe(true);
    expect(titles.some((title) => title.includes("DCET"))).toBe(false);
    expect(titles.some((title) => title.includes("PGCET"))).toBe(false);
  });

  it("classifies application link as application open", () => {
    const parser = new KcetParser();
    const events = parser.parse(fixtureHtml);
    const application = events.find((event) =>
      event.title.includes("UGCET / UGNEET") && event.title.includes("Application"),
    );

    expect(application?.sourceUrl).toContain("onlineapp2026");
    expect(application?.title).toContain("Application");
  });
});
