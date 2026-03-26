import React, { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import type { Id } from '../../../convex/_generated/dataModel';
import type { DealStage } from '../lib/types';

const STAGES: DealStage[] = ['Lead', 'Offer Sent', 'Under Contract', 'Closed', 'Dead'];

interface DealFormProps {
  dealId?: Id<'deals'>;
  initialValues?: Partial<FormValues>;
  onSave: () => void;
  onCancel: () => void;
}

interface FormValues {
  address: string;
  asking_price: string;
  beds: string;
  baths: string;
  sqft: string;
  repair_estimate: string;
  arv: string;
  stage: DealStage;
  notes: string;
  seller_first_name: string;
  seller_last_name: string;
  seller_phone: string;
  seller_email: string;
}

const EMPTY: FormValues = {
  address: '',
  asking_price: '',
  beds: '',
  baths: '',
  sqft: '',
  repair_estimate: '',
  arv: '',
  stage: 'Lead',
  notes: '',
  seller_first_name: '',
  seller_last_name: '',
  seller_phone: '',
  seller_email: '',
};

function inputClass(error?: boolean) {
  return `w-full bg-white/[0.05] border ${error ? 'border-red-500' : 'border-white/10'} text-white px-3 py-2 text-sm focus:outline-none focus:border-nova-gold/50 transition-colors placeholder:text-nova-stone/40`;
}

function labelClass() {
  return 'block text-[10px] uppercase tracking-wider text-nova-stone mb-1';
}

export default function DealForm({ dealId, initialValues, onSave, onCancel }: DealFormProps) {
  const createDeal = useMutation(api.deals.create);
  const updateDeal = useMutation(api.deals.update);

  const [values, setValues] = useState<FormValues>({
    ...EMPTY,
    ...initialValues,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set(field: keyof FormValues, value: string) {
    setValues((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const payload = {
      address: values.address.trim(),
      asking_price: parseFloat(values.asking_price) || 0,
      beds: parseFloat(values.beds) || 0,
      baths: parseFloat(values.baths) || 0,
      sqft: parseFloat(values.sqft) || 0,
      repair_estimate: parseFloat(values.repair_estimate) || 0,
      arv: values.arv ? parseFloat(values.arv) : undefined,
      stage: values.stage,
      notes: values.notes || undefined,
      seller_first_name: values.seller_first_name || undefined,
      seller_last_name: values.seller_last_name || undefined,
      seller_phone: values.seller_phone || undefined,
      seller_email: values.seller_email || undefined,
    };

    if (!payload.address) {
      setError('Address is required');
      return;
    }

    setSaving(true);
    try {
      if (dealId) {
        await updateDeal({ id: dealId, ...payload });
      } else {
        await createDeal(payload);
      }
      onSave();
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 px-4 py-3">
          {error}
        </div>
      )}

      {/* Property */}
      <section>
        <h3 className="text-xs uppercase tracking-widest text-nova-gold mb-4">Property</h3>
        <div className="grid gap-4">
          <div>
            <label className={labelClass()}>Address *</label>
            <input
              type="text"
              className={inputClass(!values.address)}
              value={values.address}
              onChange={(e) => set('address', e.target.value)}
              placeholder="123 Main St, City, State"
              required
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={labelClass()}>Beds</label>
              <input type="number" className={inputClass()} value={values.beds} onChange={(e) => set('beds', e.target.value)} min="0" step="1" />
            </div>
            <div>
              <label className={labelClass()}>Baths</label>
              <input type="number" className={inputClass()} value={values.baths} onChange={(e) => set('baths', e.target.value)} min="0" step="0.5" />
            </div>
            <div>
              <label className={labelClass()}>Sqft</label>
              <input type="number" className={inputClass()} value={values.sqft} onChange={(e) => set('sqft', e.target.value)} min="0" />
            </div>
          </div>
        </div>
      </section>

      {/* Financials */}
      <section>
        <h3 className="text-xs uppercase tracking-widest text-nova-gold mb-4">Financials</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass()}>Asking Price</label>
            <input type="number" className={inputClass()} value={values.asking_price} onChange={(e) => set('asking_price', e.target.value)} min="0" />
          </div>
          <div>
            <label className={labelClass()}>Repair Estimate</label>
            <input type="number" className={inputClass()} value={values.repair_estimate} onChange={(e) => set('repair_estimate', e.target.value)} min="0" />
          </div>
          <div>
            <label className={labelClass()}>ARV (optional)</label>
            <input type="number" className={inputClass()} value={values.arv} onChange={(e) => set('arv', e.target.value)} min="0" placeholder="Leave blank to calculate from comps" />
          </div>
          <div>
            <label className={labelClass()}>Stage</label>
            <select className={inputClass()} value={values.stage} onChange={(e) => set('stage', e.target.value as DealStage)}>
              {STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </section>

      {/* Seller Info */}
      <section>
        <h3 className="text-xs uppercase tracking-widest text-nova-gold mb-4">Seller Info</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass()}>First Name</label>
            <input type="text" className={inputClass()} value={values.seller_first_name} onChange={(e) => set('seller_first_name', e.target.value)} />
          </div>
          <div>
            <label className={labelClass()}>Last Name</label>
            <input type="text" className={inputClass()} value={values.seller_last_name} onChange={(e) => set('seller_last_name', e.target.value)} />
          </div>
          <div>
            <label className={labelClass()}>Phone</label>
            <input type="tel" className={inputClass()} value={values.seller_phone} onChange={(e) => set('seller_phone', e.target.value)} />
          </div>
          <div>
            <label className={labelClass()}>Email</label>
            <input type="email" className={inputClass()} value={values.seller_email} onChange={(e) => set('seller_email', e.target.value)} />
          </div>
        </div>
      </section>

      {/* Notes */}
      <section>
        <label className={labelClass()}>Notes</label>
        <textarea
          className={`${inputClass()} resize-none`}
          rows={4}
          value={values.notes}
          onChange={(e) => set('notes', e.target.value)}
          placeholder="Any notes about this deal..."
        />
      </section>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2 bg-nova-gold text-nova-black text-xs uppercase tracking-widest hover:bg-nova-gold/80 transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving...' : dealId ? 'Update Deal' : 'Create Deal'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 border border-white/10 text-nova-stone text-xs uppercase tracking-widest hover:text-white hover:border-white/30 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
