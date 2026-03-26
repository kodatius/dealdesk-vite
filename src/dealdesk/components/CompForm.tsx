import React, { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import type { Id } from '../../../convex/_generated/dataModel';

interface CompFormProps {
  dealId: Id<'deals'>;
  onSave: () => void;
  onCancel: () => void;
}

function inputClass() {
  return 'w-full bg-white/[0.05] border border-white/10 text-white px-3 py-2 text-sm focus:outline-none focus:border-nova-gold/50 transition-colors placeholder:text-nova-stone/40';
}

function labelClass() {
  return 'block text-[10px] uppercase tracking-wider text-nova-stone mb-1';
}

export default function CompForm({ dealId, onSave, onCancel }: CompFormProps) {
  const addComp = useMutation(api.comps.create);
  const [address, setAddress] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [sqft, setSqft] = useState('');
  const [dateSold, setDateSold] = useState('');
  const [distanceMiles, setDistanceMiles] = useState('');
  const [yearBuilt, setYearBuilt] = useState('');
  const [beds, setBeds] = useState('');
  const [baths, setBaths] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!address.trim() || !salePrice || !sqft || !dateSold) {
      setError('Address, sale price, sqft, and date sold are required');
      return;
    }
    setSaving(true);
    try {
      await addComp({
        dealId,
        address: address.trim(),
        sale_price: parseFloat(salePrice),
        sqft: parseFloat(sqft),
        date_sold: dateSold,
        distance_miles: distanceMiles ? parseFloat(distanceMiles) : undefined,
        year_built: yearBuilt ? parseInt(yearBuilt) : undefined,
        beds: beds ? parseFloat(beds) : undefined,
        baths: baths ? parseFloat(baths) : undefined,
      });
      onSave();
    } catch (err: any) {
      setError(err.message ?? 'Failed to add comp');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 px-4 py-3">
          {error}
        </div>
      )}
      <div>
        <label className={labelClass()}>Address *</label>
        <input type="text" className={inputClass()} value={address} onChange={(e) => setAddress(e.target.value)} placeholder="456 Comp St, City, State" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass()}>Sale Price *</label>
          <input type="number" className={inputClass()} value={salePrice} onChange={(e) => setSalePrice(e.target.value)} min="0" />
        </div>
        <div>
          <label className={labelClass()}>Sqft *</label>
          <input type="number" className={inputClass()} value={sqft} onChange={(e) => setSqft(e.target.value)} min="0" />
        </div>
        <div>
          <label className={labelClass()}>Date Sold *</label>
          <input type="date" className={inputClass()} value={dateSold} onChange={(e) => setDateSold(e.target.value)} />
        </div>
        <div>
          <label className={labelClass()}>Distance (miles)</label>
          <input type="number" className={inputClass()} value={distanceMiles} onChange={(e) => setDistanceMiles(e.target.value)} min="0" step="0.01" />
        </div>
        <div>
          <label className={labelClass()}>Year Built</label>
          <input type="number" className={inputClass()} value={yearBuilt} onChange={(e) => setYearBuilt(e.target.value)} min="1800" max="2030" />
        </div>
        <div>
          <label className={labelClass()}>Beds</label>
          <input type="number" className={inputClass()} value={beds} onChange={(e) => setBeds(e.target.value)} min="0" />
        </div>
        <div>
          <label className={labelClass()}>Baths</label>
          <input type="number" className={inputClass()} value={baths} onChange={(e) => setBaths(e.target.value)} min="0" step="0.5" />
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="px-5 py-2 bg-nova-gold text-nova-black text-xs uppercase tracking-widest hover:bg-nova-gold/80 transition-colors disabled:opacity-50"
        >
          {saving ? 'Adding...' : 'Add Comp'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2 border border-white/10 text-nova-stone text-xs uppercase tracking-widest hover:text-white hover:border-white/30 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
