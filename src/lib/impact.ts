/** Mass-balance illustration, not a measurement of actual collection or emissions. */
export function calculateImpact(dailyKg: number, diversionPercent: number, days: number) {
  const totalKg = Math.max(0, dailyKg) * Math.max(0, days);
  const divertedKg = totalKg * Math.min(100, Math.max(0, diversionPercent)) / 100;
  return { totalKg, divertedKg, remainingKg: totalKg - divertedKg };
}