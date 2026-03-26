
import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import type { Id } from '../../../convex/_generated/dataModel';
import { formatCurrency, formatDate } from '../lib/format';

interface Comp {
  id: Id<'comps'>;
  address: string;
  sale_price: number;
  sqft: number;
  date_sold: string;
  distance_miles: number | null;
  year_built: number | null;
  beds: number | null;
  baths: number | null;
}

interface CompTableProps {
  comps: Comp[];
}

export default function CompTable({ comps }: CompTableProps) {
  const removeComp = useMutation(api.comps.remove);

  if (comps.length === 0) {
    return (
      <p className="text-nova-stone text-sm py-4">No comps yet. Add comps to calculate ARV.</p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/10">
            {['Address', 'Sale Price', 'Sqft', '$/sqft', 'Sold', 'Distance', ''].map((h) => (
              <th key={h} className="text-left text-[10px] uppercase tracking-wider text-nova-stone pb-3 pr-4 font-normal">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {comps.map((comp) => (
            <tr key={comp.id} className="border-b border-white/5 hover:bg-white/[0.02]">
              <td className="py-3 pr-4 text-white max-w-[180px] truncate">{comp.address}</td>
              <td className="py-3 pr-4 text-white">{formatCurrency(comp.sale_price)}</td>
              <td className="py-3 pr-4 text-nova-stone">{comp.sqft.toLocaleString()}</td>
              <td className="py-3 pr-4 text-nova-gold">{formatCurrency(Math.round(comp.sale_price / comp.sqft))}</td>
              <td className="py-3 pr-4 text-nova-stone">{formatDate(comp.date_sold)}</td>
              <td className="py-3 pr-4 text-nova-stone">{comp.distance_miles != null ? `${comp.distance_miles} mi` : '—'}</td>
              <td className="py-3">
                <button
                  onClick={() => removeComp({ id: comp.id })}
                  className="text-nova-stone/50 hover:text-red-400 transition-colors text-xs"
                  title="Remove comp"
                >
                  ✕
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
