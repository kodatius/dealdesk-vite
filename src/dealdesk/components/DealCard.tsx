
import { Link } from 'react-router-dom';
import { formatCurrency } from '../lib/format';

interface DealCardProps {
  deal: {
    id: string;
    address: string;
    asking_price: number;
    arv: number | null;
    mao: number;
    spread: number;
    score: string;
    stage: string;
    beds: number;
    baths: number;
    sqft: number;
    repair_estimate: number;
  };
}

const STAGE_COLORS: Record<string, string> = {
  Lead: 'text-blue-400 bg-blue-400/10',
  'Offer Sent': 'text-yellow-400 bg-yellow-400/10',
  'Under Contract': 'text-orange-400 bg-orange-400/10',
  Closed: 'text-green-400 bg-green-400/10',
  Dead: 'text-nova-stone bg-white/5',
};

const SCORE_COLORS: Record<string, string> = {
  green: 'text-green-400',
  yellow: 'text-yellow-400',
  red: 'text-red-400',
};

export default function DealCard({ deal }: DealCardProps) {
  const stageClass = STAGE_COLORS[deal.stage] ?? 'text-nova-stone bg-white/5';
  const spreadColor = SCORE_COLORS[deal.score] ?? 'text-nova-stone';

  return (
    <Link
      to={`/deals/${deal.id}`}
      className="block border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-nova-gold/30 transition-all duration-200 p-5"
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <h3 className="font-serif text-white text-base leading-tight">{deal.address}</h3>
        <span className={`text-[10px] uppercase tracking-widest px-2 py-1 shrink-0 ${stageClass}`}>
          {deal.stage}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-nova-stone mb-3">
        <div>
          <span className="text-[10px] uppercase tracking-wider block mb-0.5">Ask</span>
          <span className="text-white">{formatCurrency(deal.asking_price)}</span>
        </div>
        <div>
          <span className="text-[10px] uppercase tracking-wider block mb-0.5">ARV</span>
          <span className="text-white">{formatCurrency(deal.arv)}</span>
        </div>
        <div>
          <span className="text-[10px] uppercase tracking-wider block mb-0.5">MAO</span>
          <span className="text-nova-gold font-medium">{formatCurrency(deal.mao)}</span>
        </div>
        <div>
          <span className="text-[10px] uppercase tracking-wider block mb-0.5">Spread</span>
          <span className={`font-medium ${spreadColor}`}>{formatCurrency(deal.spread)}</span>
        </div>
      </div>

      <div className="text-[10px] text-nova-stone/60 uppercase tracking-wider">
        {deal.beds}bd · {deal.baths}ba · {deal.sqft.toLocaleString()} sqft · {formatCurrency(deal.repair_estimate)} repairs
      </div>
    </Link>
  );
}
