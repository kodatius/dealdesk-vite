import type { Comp, ArvResult, ArvConfidence } from './types';

/**
 * RJ Bates comping methodology for ARV calculation.
 * Weights comps by recency and distance.
 */
export function calculateARV(comps: Comp[], subjectSqft: number): ArvResult {
  if (comps.length === 0 || subjectSqft <= 0) {
    return { arv: 0, confidence: 'none', compCount: 0, weightedPricePerSqft: 0 };
  }

  const now = new Date();

  // Score each comp
  const scored = comps
    .filter(c => c.sqft > 0 && c.sale_price > 0)
    .map(c => {
      const ppsf = c.sale_price / c.sqft;

      // Recency weight: 6mo=3, 12mo=2, older=1
      const soldDate = new Date(c.date_sold);
      const monthsAgo = (now.getTime() - soldDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
      const recencyWeight = monthsAgo <= 6 ? 3 : monthsAgo <= 12 ? 2 : 1;

      // Distance weight: <0.25mi=2, 0.25-0.5mi=1.5, >0.5mi=1, unknown=1.5
      const dist = c.distance_miles;
      const distanceWeight = dist == null ? 1.5 : dist < 0.25 ? 2 : dist <= 0.5 ? 1.5 : 1;

      // Sqft similarity — soft filter: exclude if >30% diff from subject
      const sqftRatio = c.sqft / subjectSqft;
      if (sqftRatio < 0.7 || sqftRatio > 1.3) return null;

      const weight = recencyWeight * distanceWeight;
      return { ppsf, weight };
    })
    .filter((x): x is { ppsf: number; weight: number } => x !== null);

  if (scored.length === 0) {
    return { arv: 0, confidence: 'none', compCount: 0, weightedPricePerSqft: 0 };
  }

  const totalWeight = scored.reduce((sum, c) => sum + c.weight, 0);
  const weightedPpsf = scored.reduce((sum, c) => sum + c.ppsf * c.weight, 0) / totalWeight;
  const arv = Math.round(weightedPpsf * subjectSqft);

  const confidence: ArvConfidence =
    scored.length >= 3 ? 'high' : scored.length === 2 ? 'medium' : 'low';

  return {
    arv,
    confidence,
    compCount: scored.length,
    weightedPricePerSqft: Math.round(weightedPpsf),
  };
}
