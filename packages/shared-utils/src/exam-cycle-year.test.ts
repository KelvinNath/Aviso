import { afterEach, describe, expect, it } from "vitest";

import { getExamCycleYear } from "./exam-cycle-year";

describe("getExamCycleYear", () => {
  afterEach(() => {
    delete process.env.EXAM_CYCLE_YEAR;
  });

  it("reads EXAM_CYCLE_YEAR from the environment", () => {
    process.env.EXAM_CYCLE_YEAR = "2027";
    expect(getExamCycleYear(new Date("2026-08-09"))).toBe(2027);
  });

  it("falls back to the calendar year when env is unset", () => {
    expect(getExamCycleYear(new Date("2026-08-09"))).toBe(2026);
  });

  it("ignores invalid env values", () => {
    process.env.EXAM_CYCLE_YEAR = "not-a-year";
    expect(getExamCycleYear(new Date("2027-01-01"))).toBe(2027);
  });
});
