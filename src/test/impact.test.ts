import { describe, expect, it } from "vitest";
import { calculateImpact } from "@/lib/impact";

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
});