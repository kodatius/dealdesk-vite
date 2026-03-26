
import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import type { Id } from '../../../convex/_generated/dataModel';
import { calculateARV } from '../lib/arv';
import { formatCurrency } from '../lib/format';
import type { Comp } from '../lib/types';

interface ArvAnalysisProps {
  dealId: Id<'deals'>;
  sqft: number;
  arv: number | null;
  arvLocked: boolean;
  comps: Comp[];
}

const CONFIDENCE_COLORS: Record<string, string> = {
  high: 'text-green-400',
  medium: 'text-yellow-400',
  low: 'text-orange-400',
  none: 'text-nova-stone',
};

export default function ArvAnalysis({ dealId, sqft, arv, arvLocked, comps }: ArvAnalysisProps) {
  const setArvState = useMutation(api.deals.setArvState);
  const result = calculateARV(comps, sqft);

  const displayArv = arvLocked ? arv : (result.arv > 0 ? result.arv : arv);
  const confidenceColor = CONFIDENCE_COLORS[result.confidence] ?? 'text-nova-stone';

  async function handleAccept() {
    await setArvState({ id: dealId, arv: result.arv, arv_locked: true });
  }

  async function handleUnlock() {
    await setArvState({ id: dealId, arv_locked: false });
  }

  return (
    <div className="border border-white/10 bg-white/[0.02] p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs uppercase tracking-widest text-nova-gold">ARV Analysis</h3>
        {arvLocked && (
          <button
            onClick={handleUnlock}
            className="text-[10px] uppercase tracking-wider text-nova-stone hover:text-white transition-colors"
          >
            🔒 Locked — Unlock
          </button>
        )}
      </div>

      {result.compCount === 0 ? (
        <p className="text-nova-stone text-sm">Add comps below to calculate ARV automatically.</p>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-nova-stone mb-1">Calculated ARV</div>
              <div className="text-xl text-white font-serif">{formatCurrency(result.arv)}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-nova-stone mb-1">Confidence</div>
              <div className={`text-sm font-medium capitalize ${confidenceColor}`}>{result.confidence}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-nova-stone mb-1">Comps Used</div>
              <div className="text-sm text-white">{result.compCount}</div>
            </div>
          </div>

          <div>
            <div className="text-[10px] uppercase tracking-wider text-nova-stone mb-1">Weighted $/sqft</div>
            <div className="text-sm text-nova-gold">{formatCurrency(result.weightedPricePerSqft)}</div>
          </div>

          {!arvLocked && result.arv > 0 && (
            <button
              onClick={handleAccept}
              className="mt-2 px-4 py-2 bg-nova-gold/10 border border-nova-gold/30 text-nova-gold text-xs uppercase tracking-widest hover:bg-nova-gold/20 transition-colors"
            >
              Accept ARV: {formatCurrency(result.arv)}
            </button>
          )}
        </div>
      )}

      {arvLocked && displayArv != null && (
        <div className="mt-3 pt-3 border-t border-white/10">
          <div className="text-[10px] uppercase tracking-wider text-nova-stone mb-1">Locked ARV</div>
          <div className="text-lg text-nova-gold font-serif">{formatCurrency(displayArv)}</div>
        </div>
      )}
    </div>
  );
}
