/**
 * Pure price-estimate function. hours * hourly_rate scaled by size/style/
 * color multipliers, floored at min_price. Kept side-effect free so it
 * can run identically client-side (live preview) and inside the
 * saveCalculation server action (snapshot at save time).
 */
export function computeEstimate(params: {
  hourlyRate: number;
  minPrice: number;
  hours: number;
  sizeMultiplier: number;
  styleMultiplier: number;
  colorMultiplier: number;
}): number {
  const { hourlyRate, minPrice, hours, sizeMultiplier, styleMultiplier, colorMultiplier } = params;
  const raw = hourlyRate * hours * sizeMultiplier * styleMultiplier * colorMultiplier;
  return Math.max(minPrice, Math.round(raw * 100) / 100);
}
