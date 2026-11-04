import { describe, expect, it } from "vitest";
import { calculateImpact, splitByType, DEFAULT_COMPOSITION, PERIODS } from "@/lib/impact";

describe("Waste diversion simulation", () => {
  it("calculates 30 days of 1 kg with 60 percent actually processed", () => {
    expect(calculateImpact(1, 60, 30)).toEqual({ totalKg: 30, divertedKg: 18, remainingKg: 12 });
  });
  it("does not treat sorting without processing as diversion", () => {
    expect(calculateImpact(2, 0, 7)).toEqual({ totalKg: 14, divertedKg: 0, remainingKg: 14 });
  });
  it("cannot divert more than the waste generated", () => {
    expect(calculateImpact(1, 110, 30)).toEqual({ totalKg: 30, divertedKg: 30, remainingKg: 0 });
  });
  it("offers 1, 7, 30, 180 and 365 day periods", () => {
    expect(PERIODS.map((p) => p.days)).toEqual([1, 7, 30, 180, 365]);
  });
  it("splits 1 kg/day over 1 year by waste type", () => {
    const s = splitByType(1, 365, DEFAULT_COMPOSITION);
    expect(s.organik).toBeCloseTo(219);
    expect(s.anorganik).toBeCloseTo(91.25);
  });
});
