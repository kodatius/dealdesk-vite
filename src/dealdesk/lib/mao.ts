// MAO Reverse Calculator — ported from UnderWriter
// Works backwards from ARV to compute the Maximum Allowable Offer

export interface MaoInputs {
  arv: number | null;
  buyerProfitPct: number | null;  // % buyer needs to profit off ARV
  repairs: number | null;
  closingCostPct: number | null;
  holdingCostPct: number | null;
  wholesaleFee: number | null;
}

export interface MaoOutputs {
  mao: number | null;
  buyerPrice: number | null;       // MAO + wholesale fee
  buyerAllIn: number | null;
  buyerProfit: number | null;
  buyerProfitPct: number | null;
  closingCosts: number | null;
  holdingCosts: number | null;
  offerLow: number | null;         // negotiation floor (MAO - 10%)
  offerHigh: number | null;        // walk-away ceiling (MAO)
  seventyPctRule: number | null;
  seventyPctDiff: number | null;   // MAO vs 70% rule delta
  feeAsPercent: number | null;
}

export const MAO_DEFAULTS: MaoInputs = {
  arv: null,
  buyerProfitPct: 15,
  repairs: null,
  closingCostPct: 7,
  holdingCostPct: 5,
  wholesaleFee: 10000,
};

export function calculateMao(inputs: MaoInputs): MaoOutputs {
  const { arv, buyerProfitPct, repairs, closingCostPct, holdingCostPct, wholesaleFee } = inputs;

  const empty: MaoOutputs = {
    mao: null, buyerPrice: null, buyerAllIn: null,
    buyerProfit: null, buyerProfitPct: null,
    closingCosts: null, holdingCosts: null,
    offerLow: null, offerHigh: null,
    seventyPctRule: null, seventyPctDiff: null,
    feeAsPercent: null,
  };

  if (arv == null) return empty;

  const profitPct  = buyerProfitPct  ?? 15;
  const repairsCost = repairs        ?? 0;
  const closingPct  = closingCostPct ?? 7;
  const holdingPct  = holdingCostPct ?? 5;
  const wsFee       = wholesaleFee   ?? 0;

  const closingCosts  = (arv * closingPct)  / 100;
  const holdingCosts  = (arv * holdingPct)  / 100;
  const buyerProfit   = (arv * profitPct)   / 100;

  // MAO = ARV − closing − holding − repairs − buyer profit − your fee
  const mao        = arv - closingCosts - holdingCosts - repairsCost - buyerProfit - wsFee;
  const buyerPrice = mao + wsFee;
  const buyerAllIn = buyerPrice + repairsCost + closingCosts + holdingCosts;

  const offerLow   = mao * 0.9;
  const offerHigh  = mao;

  const seventyPctRule = arv * 0.7 - repairsCost;
  const seventyPctDiff = mao - seventyPctRule;

  const feeAsPercent = arv > 0 ? (wsFee / arv) * 100 : null;

  return {
    mao, buyerPrice, buyerAllIn,
    buyerProfit, buyerProfitPct: profitPct,
    closingCosts, holdingCosts,
    offerLow, offerHigh,
    seventyPctRule, seventyPctDiff,
    feeAsPercent,
  };
}
