
import { Link } from 'react-router-dom';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import DealDeskLayout from '../components/DealDeskLayout';
import { formatCurrency, formatRelative } from '../lib/format';

const STAGE_ORDER = ['Lead', 'Offer Sent', 'Under Contract', 'Closed', 'Dead'] as const;

const STAGE_COLORS: Record<string, string> = {
  Lead: 'text-blue-400',
  'Offer Sent': 'text-yellow-400',
  'Under Contract': 'text-orange-400',
  Closed: 'text-green-400',
  Dead: 'text-nova-stone',
};

export default function DealDeskDashboard() {
  const metrics = useQuery(api.dashboard.metrics);

  return (
    <DealDeskLayout>
      <div className="p-8">
        <div className="mb-8">
          <p className="text-[10px] uppercase tracking-[0.25em] text-nova-gold mb-1">DealDesk</p>
          <h2 className="font-serif text-3xl text-white">Dashboard</h2>
        </div>

        {metrics === undefined ? (
          <div className="text-nova-stone text-sm">Loading...</div>
        ) : (
          <div className="space-y-8">
            {/* Pipeline stats */}
            <section>
              <h3 className="text-xs uppercase tracking-widest text-nova-stone mb-4">Pipeline</h3>
              <div className="grid grid-cols-5 gap-4">
                {STAGE_ORDER.map((stage) => (
                  <div key={stage} className="border border-white/10 bg-white/[0.02] p-4">
                    <div className={`text-2xl font-serif mb-1 ${STAGE_COLORS[stage]}`}>
                      {metrics.dealCounts[stage] ?? 0}
                    </div>
                    <div className="text-[10px] uppercase tracking-wider text-nova-stone">{stage}</div>
                  </div>
                ))}
              </div>
            </section>

            {/* Summary stats */}
            <section className="grid grid-cols-2 gap-6 max-w-xl">
              <div className="border border-white/10 bg-white/[0.02] p-4">
                <div className="text-[10px] uppercase tracking-wider text-nova-stone mb-1">Total Deals</div>
                <div className="text-2xl font-serif text-white">{metrics.totalDeals}</div>
              </div>
              <div className="border border-white/10 bg-white/[0.02] p-4">
                <div className="text-[10px] uppercase tracking-wider text-nova-stone mb-1">Avg Spread (Active)</div>
                <div className={`text-2xl font-serif ${metrics.avgSpread != null && metrics.avgSpread > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatCurrency(metrics.avgSpread)}
                </div>
              </div>
            </section>

            {/* Quick actions */}
            <section>
              <Link
                to="/deals/new"
                className="inline-block px-6 py-3 bg-nova-gold text-nova-black text-xs uppercase tracking-widest hover:bg-nova-gold/80 transition-colors"
              >
                + New Deal
              </Link>
            </section>

            {/* Recent activity */}
            <section>
              <h3 className="text-xs uppercase tracking-widest text-nova-stone mb-4">Recent Activity</h3>
              {metrics.recentActivity.length === 0 ? (
                <p className="text-nova-stone/60 text-sm">No activity yet.</p>
              ) : (
                <div className="space-y-2">
                  {metrics.recentActivity.map((item) => (
                    <div key={item.id} className="flex items-start justify-between gap-4 text-sm py-2 border-b border-white/5">
                      <span className="text-nova-stone flex-1">{item.action}</span>
                      <span className="text-nova-stone/50 text-xs shrink-0">{formatRelative(item.created_at)}</span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </DealDeskLayout>
  );
}
