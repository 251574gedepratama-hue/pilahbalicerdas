/** Mass-balance illustration, not a measurement of actual collection or emissions. */
export function calculateImpact(dailyKg: number, diversionPercent: number, days: number) {
  const totalKg = Math.max(0, dailyKg) * Math.max(0, days);
  const divertedKg = totalKg * Math.min(100, Math.max(0, diversionPercent)) / 100;
  return { totalKg, divertedKg, remainingKg: totalKg - divertedKg };
}

export type WasteType = "organik" | "anorganik" | "b3" | "residu";
/** Illustrative household composition (percent), user-adjustable in the simulator. */
export const DEFAULT_COMPOSITION: Record<WasteType, number> = { organik: 60, anorganik: 25, b3: 2, residu: 13 };
export const PERIODS = [
  { days: 1, label: "1 hari" },
  { days: 7, label: "7 hari" },
  { days: 30, label: "30 hari" },
  { days: 180, label: "6 bulan" },
  { days: 365, label: "1 tahun" },
] as const;

/** Splits total waste over `days` by composition; percents are normalised to sum to 100. */
export function splitByType(dailyKg: number, days: number, composition: Record<WasteType, number>) {
  const total = Math.max(0, dailyKg) * Math.max(0, days);
  const sum = Object.values(composition).reduce((a, b) => a + Math.max(0, b), 0) || 1;
  const out = {} as Record<WasteType, number>;
  (Object.keys(composition) as WasteType[]).forEach((k) => { out[k] = total * Math.max(0, composition[k]) / sum; });
  return out;
}
