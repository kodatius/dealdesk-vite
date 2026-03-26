import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import DealDeskLayout from '../components/DealDeskLayout';
import DealCard from '../components/DealCard';
import type { DealStage } from '../lib/types';

const STAGES: Array<DealStage | 'All'> = ['All', 'Lead', 'Offer Sent', 'Under Contract', 'Closed', 'Dead'];

export default function DealsList() {
  const [stageFilter, setStageFilter] = useState<DealStage | undefined>(undefined);
  const deals = useQuery(api.deals.getAll, stageFilter ? { stage: stageFilter } : {});

  return (
    <DealDeskLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-nova-gold mb-1">DealDesk</p>
            <h2 className="font-serif text-3xl text-white">Deals</h2>
          </div>
          <Link
            to="/deals/new"
            className="px-5 py-2 bg-nova-gold text-nova-black text-xs uppercase tracking-widest hover:bg-nova-gold/80 transition-colors"
          >
            + New Deal
          </Link>
        </div>

        {/* Stage filter */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {STAGES.map((stage) => {
            const active = stage === 'All' ? !stageFilter : stageFilter === stage;
            return (
              <button
                key={stage}
                onClick={() => setStageFilter(stage === 'All' ? undefined : (stage as DealStage))}
                className={`px-3 py-1 text-[10px] uppercase tracking-wider transition-colors border ${
                  active
                    ? 'border-nova-gold text-nova-gold bg-nova-gold/10'
                    : 'border-white/10 text-nova-stone hover:text-white hover:border-white/30'
                }`}
              >
                {stage}
              </button>
            );
          })}
        </div>

        {deals === undefined ? (
          <div className="text-nova-stone text-sm">Loading...</div>
        ) : deals.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🏠</div>
            <p className="text-nova-stone mb-4">No deals yet{stageFilter ? ` in ${stageFilter}` : ''}.</p>
            <Link to="/deals/new" className="text-nova-gold hover:text-white transition-colors text-sm">
              Create your first deal →
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {deals.map((deal) => (
              <DealCard key={deal.id} deal={deal} />
            ))}
          </div>
        )}
      </div>
    </DealDeskLayout>
  );
}
