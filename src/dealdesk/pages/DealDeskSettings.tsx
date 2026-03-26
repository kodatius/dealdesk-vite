import React, { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import DealDeskLayout from '../components/DealDeskLayout';

function inputClass() {
  return 'w-full bg-white/[0.05] border border-white/10 text-white px-3 py-2 text-sm focus:outline-none focus:border-nova-gold/50 transition-colors placeholder:text-nova-stone/40';
}

function labelClass() {
  return 'block text-[10px] uppercase tracking-wider text-nova-stone mb-1';
}

function GhlSettings() {
  const apiKey = useQuery(api.integrations.get, { key: 'ghl_api_key' });
  const locationId = useQuery(api.integrations.get, { key: 'ghl_location_id' });
  const setIntegration = useMutation(api.integrations.set);

  const [apiKeyInput, setApiKeyInput] = useState('');
  const [locationIdInput, setLocationIdInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      if (apiKeyInput) await setIntegration({ key: 'ghl_api_key', value: apiKeyInput });
      if (locationIdInput) await setIntegration({ key: 'ghl_location_id', value: locationIdInput });
      setApiKeyInput('');
      setLocationIdInput('');
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="border border-white/10 bg-white/[0.02] p-6 max-w-lg">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl">🔗</span>
        <div>
          <h3 className="text-sm text-white font-medium">GoHighLevel</h3>
          <p className="text-[10px] text-nova-stone mt-0.5">Connect GHL to sync deals as contacts and opportunities.</p>
        </div>
      </div>

      {/* Current status */}
      <div className="mb-6 space-y-2">
        <div className="flex items-center gap-2 text-xs">
          <span className={apiKey ? 'text-green-400' : 'text-nova-stone/50'}>
            {apiKey ? '✓' : '○'}
          </span>
          <span className="text-nova-stone">API Key: {apiKey ? '••••••••' + apiKey.slice(-4) : 'Not set'}</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className={locationId ? 'text-green-400' : 'text-nova-stone/50'}>
            {locationId ? '✓' : '○'}
          </span>
          <span className="text-nova-stone">Location ID: {locationId ? locationId : 'Not set'}</span>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className={labelClass()}>API Key {apiKey ? '(leave blank to keep current)' : ''}</label>
          <input
            type="password"
            className={inputClass()}
            value={apiKeyInput}
            onChange={(e) => setApiKeyInput(e.target.value)}
            placeholder={apiKey ? '••••••••••••' : 'Enter GHL API key'}
            autoComplete="off"
          />
        </div>
        <div>
          <label className={labelClass()}>Location ID {locationId ? '(leave blank to keep current)' : ''}</label>
          <input
            type="text"
            className={inputClass()}
            value={locationIdInput}
            onChange={(e) => setLocationIdInput(e.target.value)}
            placeholder={locationId ? locationId : 'Enter GHL Location ID'}
          />
        </div>
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving || (!apiKeyInput && !locationIdInput)}
            className="px-5 py-2 bg-nova-gold text-nova-black text-xs uppercase tracking-widest hover:bg-nova-gold/80 transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
          {saved && <span className="text-green-400 text-xs">✓ Saved</span>}
        </div>
      </form>
    </div>
  );
}

export default function DealDeskSettings() {
  return (
    <DealDeskLayout>
      <div className="p-8">
        <div className="mb-8">
          <p className="text-[10px] uppercase tracking-[0.25em] text-nova-gold mb-1">DealDesk</p>
          <h2 className="font-serif text-3xl text-white">Settings</h2>
        </div>
        <div className="space-y-8">
          <section>
            <h3 className="text-xs uppercase tracking-widest text-nova-stone mb-4">Integrations</h3>
            <GhlSettings />
          </section>
        </div>
      </div>
    </DealDeskLayout>
  );
}
