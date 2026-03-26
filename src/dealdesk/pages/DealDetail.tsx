import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import type { Id } from '../../../convex/_generated/dataModel';
import DealDeskLayout from '../components/DealDeskLayout';
import DealForm from '../components/DealForm';
import CompForm from '../components/CompForm';
import CompTable from '../components/CompTable';
import ArvAnalysis from '../components/ArvAnalysis';
import { formatCurrency, formatDate } from '../lib/format';
import { calculateMao, MAO_DEFAULTS } from '../lib/mao';
import type { DealStage } from '../lib/types';

interface DealDetailProps {
  isNew?: boolean;
}

const STAGE_COLORS: Record<string, string> = {
  Lead: 'text-blue-400 bg-blue-400/10',
  'Offer Sent': 'text-yellow-400 bg-yellow-400/10',
  'Under Contract': 'text-orange-400 bg-orange-400/10',
  Closed: 'text-green-400 bg-green-400/10',
  Dead: 'text-nova-stone bg-white/5',
};

export default function DealDetail({ isNew }: DealDetailProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const removeDeal = useMutation(api.deals.remove);
  const updateStage = useMutation(api.deals.updateStage);

  const [editing, setEditing] = useState(!!isNew);
  const [showCompForm, setShowCompForm] = useState(false);
  const [showMao, setShowMao] = useState(false);

  // Only query if we have an id (not a new deal)
  const dealData = useQuery(
    api.deals.getById,
    id ? { id: id as Id<'deals'> } : 'skip'
  );

  if (isNew) {
    return (
      <DealDeskLayout>
        <div className="p-8 max-w-2xl">
          <div className="mb-8">
            <button onClick={() => navigate('/deals')} className="text-[10px] uppercase tracking-wider text-nova-stone hover:text-white transition-colors mb-3 block">
              ← Back to Deals
            </button>
            <p className="text-[10px] uppercase tracking-[0.25em] text-nova-gold mb-1">DealDesk</p>
            <h2 className="font-serif text-3xl text-white">New Deal</h2>
          </div>
          <DealForm
            onSave={() => navigate('/deals')}
            onCancel={() => navigate('/deals')}
          />
        </div>
      </DealDeskLayout>
    );
  }

  if (!id) return null;
  if (dealData === undefined) {
    return (
      <DealDeskLayout>
        <div className="p-8 text-nova-stone text-sm">Loading...</div>
      </DealDeskLayout>
    );
  }
  if (dealData === null) {
    return (
      <DealDeskLayout>
        <div className="p-8">
          <p className="text-red-400">Deal not found.</p>
          <button onClick={() => navigate('/deals')} className="text-nova-gold mt-2 text-sm">← Back</button>
        </div>
      </DealDeskLayout>
    );
  }

  const deal = dealData;
  const comps = deal.comps ?? [];
  const stageClass = STAGE_COLORS[deal.stage] ?? 'text-nova-stone bg-white/5';

  const maoResult = calculateMao({
    ...MAO_DEFAULTS,
    arv: deal.arv,
    repairs: deal.repair_estimate,
  });

  const STAGE_TRANSITIONS: Record<DealStage, DealStage[]> = {
    Lead: ['Offer Sent', 'Dead'],
    'Offer Sent': ['Under Contract', 'Dead'],
    'Under Contract': ['Closed', 'Dead'],
    Closed: [],
    Dead: [],
  };
  const nextStages = STAGE_TRANSITIONS[deal.stage as DealStage] ?? [];

  async function handleDelete() {
    if (!confirm('Delete this deal? This cannot be undone.')) return;
    await removeDeal({ id: id as Id<'deals'> });
    navigate('/deals');
  }

  return (
    <DealDeskLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <button onClick={() => navigate('/deals')} className="text-[10px] uppercase tracking-wider text-nova-stone hover:text-white transition-colors mb-3 block">
            ← Back to Deals
          </button>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h2 className="font-serif text-3xl text-white mb-2">{deal.address}</h2>
              <span className={`text-[10px] uppercase tracking-widest px-3 py-1 ${stageClass}`}>
                {deal.stage}
              </span>
            </div>
            <div className="flex gap-2">
              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="px-4 py-2 border border-white/10 text-nova-stone text-xs uppercase tracking-widest hover:text-white hover:border-white/30 transition-colors"
                >
                  Edit
                </button>
              )}
              <button
                onClick={handleDelete}
                className="px-4 py-2 border border-red-400/30 text-red-400/70 text-xs uppercase tracking-widest hover:text-red-400 hover:border-red-400/60 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>

        {editing ? (
          <div className="max-w-2xl mb-8">
            <DealForm
              dealId={id as Id<'deals'>}
              initialValues={{
                address: deal.address,
                asking_price: String(deal.asking_price),
                beds: String(deal.beds),
                baths: String(deal.baths),
                sqft: String(deal.sqft),
                repair_estimate: String(deal.repair_estimate),
                arv: deal.arv != null ? String(deal.arv) : '',
                stage: deal.stage as DealStage,
                notes: deal.notes ?? '',
                seller_first_name: deal.seller_first_name ?? '',
                seller_last_name: deal.seller_last_name ?? '',
                seller_phone: deal.seller_phone ?? '',
                seller_email: deal.seller_email ?? '',
              }}
              onSave={() => setEditing(false)}
              onCancel={() => setEditing(false)}
            />
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Left column */}
            <div className="space-y-6">
              {/* Key financials */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Asking Price', value: formatCurrency(deal.asking_price) },
                  { label: 'ARV', value: formatCurrency(deal.arv) },
                  { label: 'MAO (70% Rule)', value: formatCurrency(deal.mao), highlight: true },
                  { label: 'Spread', value: formatCurrency(deal.spread), good: deal.spread > 5000, bad: deal.spread < 0 },
                  { label: 'Repair Estimate', value: formatCurrency(deal.repair_estimate) },
                  { label: 'Sqft', value: `${deal.sqft.toLocaleString()} sqft` },
                ].map(({ label, value, highlight, good, bad }) => (
                  <div key={label} className="border border-white/10 bg-white/[0.02] p-4">
                    <div className="text-[10px] uppercase tracking-wider text-nova-stone mb-1">{label}</div>
                    <div className={`text-lg font-serif ${highlight ? 'text-nova-gold' : good ? 'text-green-400' : bad ? 'text-red-400' : 'text-white'}`}>
                      {value}
                    </div>
                  </div>
                ))}
              </div>

              {/* Stage transitions */}
              {nextStages.length > 0 && (
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-nova-stone mb-2">Move Stage</div>
                  <div className="flex gap-2">
                    {nextStages.map((stage) => (
                      <button
                        key={stage}
                        onClick={() => updateStage({ id: id as Id<'deals'>, stage })}
                        className="px-3 py-1.5 border border-white/10 text-white text-xs hover:border-nova-gold/50 hover:text-nova-gold transition-colors"
                      >
                        → {stage}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Property details */}
              <div className="border border-white/10 bg-white/[0.02] p-4">
                <h3 className="text-xs uppercase tracking-widest text-nova-gold mb-3">Property</h3>
                <div className="grid grid-cols-3 gap-3 text-sm text-nova-stone">
                  <span>{deal.beds} beds</span>
                  <span>{deal.baths} baths</span>
                  <span>{deal.sqft.toLocaleString()} sqft</span>
                </div>
              </div>

              {/* Seller info */}
              {(deal.seller_first_name || deal.seller_email || deal.seller_phone) && (
                <div className="border border-white/10 bg-white/[0.02] p-4">
                  <h3 className="text-xs uppercase tracking-widest text-nova-gold mb-3">Seller</h3>
                  <div className="space-y-1 text-sm text-nova-stone">
                    {(deal.seller_first_name || deal.seller_last_name) && (
                      <div>{deal.seller_first_name} {deal.seller_last_name}</div>
                    )}
                    {deal.seller_phone && <div>{deal.seller_phone}</div>}
                    {deal.seller_email && <div>{deal.seller_email}</div>}
                  </div>
                </div>
              )}

              {/* Notes */}
              {deal.notes && (
                <div className="border border-white/10 bg-white/[0.02] p-4">
                  <h3 className="text-xs uppercase tracking-widest text-nova-gold mb-2">Notes</h3>
                  <p className="text-sm text-nova-stone whitespace-pre-wrap">{deal.notes}</p>
                </div>
              )}

              {/* GHL sync */}
              {deal.ghl_sync_status && (
                <div className="border border-white/10 bg-white/[0.02] p-4">
                  <h3 className="text-xs uppercase tracking-widest text-nova-gold mb-2">GHL Sync</h3>
                  <div className="text-sm text-nova-stone">
                    Status: <span className={deal.ghl_sync_status === 'synced' ? 'text-green-400' : 'text-red-400'}>{deal.ghl_sync_status}</span>
                    {deal.ghl_last_synced_at && <span className="ml-2 text-xs">· {formatDate(deal.ghl_last_synced_at)}</span>}
                  </div>
                </div>
              )}
            </div>

            {/* Right column — MAO, ARV, Comps */}
            <div className="space-y-6">
              {/* Advanced MAO Calculator */}
              <div className="border border-white/10 bg-white/[0.02] p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs uppercase tracking-widest text-nova-gold">MAO Calculator</h3>
                  <button
                    onClick={() => setShowMao(!showMao)}
                    className="text-[10px] uppercase tracking-wider text-nova-stone hover:text-white transition-colors"
                  >
                    {showMao ? 'Hide' : 'Show Details'}
                  </button>
                </div>
                {deal.arv == null ? (
                  <p className="text-nova-stone text-sm">Set ARV to calculate MAO.</p>
                ) : (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-nova-stone">MAO</span>
                      <span className="text-nova-gold font-medium">{formatCurrency(maoResult.mao)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-nova-stone">Buyer Price (+ fee)</span>
                      <span className="text-white">{formatCurrency(maoResult.buyerPrice)}</span>
                    </div>
                    {showMao && (
                      <>
                        <div className="flex justify-between text-sm">
                          <span className="text-nova-stone">Buyer All-In</span>
                          <span className="text-white">{formatCurrency(maoResult.buyerAllIn)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-nova-stone">Buyer Profit (15%)</span>
                          <span className="text-white">{formatCurrency(maoResult.buyerProfit)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-nova-stone">Closing Costs (7%)</span>
                          <span className="text-white">{formatCurrency(maoResult.closingCosts)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-nova-stone">Holding Costs (5%)</span>
                          <span className="text-white">{formatCurrency(maoResult.holdingCosts)}</span>
                        </div>
                        <div className="flex justify-between text-sm pt-2 border-t border-white/10">
                          <span className="text-nova-stone">Offer Low</span>
                          <span className="text-white">{formatCurrency(maoResult.offerLow)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-nova-stone">Offer High</span>
                          <span className="text-white">{formatCurrency(maoResult.offerHigh)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-nova-stone">70% Rule</span>
                          <span className="text-white">{formatCurrency(maoResult.seventyPctRule)}</span>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* ARV Analysis */}
              <ArvAnalysis
                dealId={id as Id<'deals'>}
                sqft={deal.sqft}
                arv={deal.arv}
                arvLocked={deal.arv_locked}
                comps={comps}
              />

              {/* Comps */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs uppercase tracking-widest text-nova-gold">Comps</h3>
                  <button
                    onClick={() => setShowCompForm(!showCompForm)}
                    className="text-[10px] uppercase tracking-wider text-nova-stone hover:text-nova-gold transition-colors"
                  >
                    {showCompForm ? 'Cancel' : '+ Add Comp'}
                  </button>
                </div>
                {showCompForm && (
                  <div className="mb-4 border border-white/10 bg-white/[0.02] p-4">
                    <CompForm
                      dealId={id as Id<'deals'>}
                      onSave={() => setShowCompForm(false)}
                      onCancel={() => setShowCompForm(false)}
                    />
                  </div>
                )}
                <CompTable comps={comps} />
              </div>
            </div>
          </div>
        )}
      </div>
    </DealDeskLayout>
  );
}
