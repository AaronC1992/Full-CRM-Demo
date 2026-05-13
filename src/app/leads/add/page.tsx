'use client';
import { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { showToast } from '@/components/ui/Toast';
import { Lead, LeadStatus, Priority } from '@/lib/types';
import { LEAD_STATUSES, PRIORITIES, INDUSTRIES, LEAD_SOURCES, STATES, WEBSITE_QUALITY_OPTIONS, SERVICE_OPPORTUNITIES } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { ChevronDown, ChevronUp, Save, RotateCcw } from 'lucide-react';

const EMPTY: Partial<Lead> = {
  businessName: '', contactName: '', phone: '', email: '', website: '',
  facebookPage: '', address: '', city: 'Joplin', state: 'MO', industry: '',
  currentWebsiteQuality: '', hasWebsite: '', hasFacebookPage: '',
  googleBusinessProfile: '', serviceOpportunity: '', suggestedOffer: '',
  estimatedDealValue: undefined, leadSource: 'Manual research',
  leadStatus: 'New', priority: 'Warm', notes: '', painPoints: '',
  personalizedPitch: '', demoWebsiteUrl: '', crmDemoUrl: '',
  marketingPackageInterest: '', websitePackageInterest: '', crmPackageInterest: '',
  tags: [],
};

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls = "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-300";
const textareaCls = "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none placeholder:text-gray-300";

export default function AddLeadPage() {
  const router = useRouter();
  const [form, setForm] = useState<Partial<Lead>>(EMPTY);
  const [advanced, setAdvanced] = useState(false);
  const [saving, setSaving] = useState(false);
  const [tagInput, setTagInput] = useState('');

  const set = (field: keyof Lead, value: unknown) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (!t) return;
    const current = (form.tags || []) as string[];
    if (!current.includes(t)) set('tags', [...current, t]);
    setTagInput('');
  };

  const removeTag = (tag: string) => {
    set('tags', ((form.tags || []) as string[]).filter(t => t !== tag));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.businessName?.trim()) {
      showToast('Business name is required.', 'error');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      const lead = await res.json();
      showToast(`${lead.businessName} added successfully!`);
      router.push(`/leads/${lead.id}`);
    } catch {
      showToast('Failed to save lead. Try again.', 'error');
    }
    setSaving(false);
  };

  return (
    <AppLayout title="Add Lead">
      <form onSubmit={handleSubmit} className="max-w-4xl space-y-6">

        {/* Simple Mode */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
          <h2 className="font-semibold text-gray-800">Basic Info</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Business Name" required>
              <input className={inputCls} value={form.businessName || ''} onChange={e => set('businessName', e.target.value)} placeholder="Joplin Auto Repair" />
            </Field>
            <Field label="Phone">
              <input className={inputCls} value={form.phone || ''} onChange={e => set('phone', e.target.value)} placeholder="417-555-0100" type="tel" />
            </Field>
            <Field label="Website">
              <input className={inputCls} value={form.website || ''} onChange={e => set('website', e.target.value)} placeholder="https://example.com" />
            </Field>
            <Field label="Facebook Page">
              <input className={inputCls} value={form.facebookPage || ''} onChange={e => set('facebookPage', e.target.value)} placeholder="https://facebook.com/..." />
            </Field>
            <Field label="City">
              <input className={inputCls} value={form.city || ''} onChange={e => set('city', e.target.value)} placeholder="Joplin" />
            </Field>
            <Field label="Industry">
              <select className={inputCls} value={form.industry || ''} onChange={e => set('industry', e.target.value)}>
                <option value="">Select industry...</option>
                {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </Field>
            <Field label="Lead Status">
              <select className={inputCls} value={form.leadStatus || 'New'} onChange={e => set('leadStatus', e.target.value as LeadStatus)}>
                {LEAD_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Priority">
              <select className={inputCls} value={form.priority || 'Warm'} onChange={e => set('priority', e.target.value as Priority)}>
                {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Notes">
            <textarea className={textareaCls} rows={3} value={form.notes || ''} onChange={e => set('notes', e.target.value)} placeholder="Quick notes about this lead..." />
          </Field>
        </div>

        {/* Advanced toggle */}
        <button
          type="button"
          onClick={() => setAdvanced(a => !a)}
          className="flex items-center gap-2 text-sm text-blue-600 font-medium hover:underline"
        >
          {advanced ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          {advanced ? 'Hide' : 'Show'} advanced fields
        </button>

        {/* Advanced Mode */}
        {advanced && (
          <>
            {/* Contact Details */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
              <h2 className="font-semibold text-gray-800">Contact Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Contact Name">
                  <input className={inputCls} value={form.contactName || ''} onChange={e => set('contactName', e.target.value)} placeholder="John Smith" />
                </Field>
                <Field label="Email">
                  <input className={inputCls} type="email" value={form.email || ''} onChange={e => set('email', e.target.value)} placeholder="owner@business.com" />
                </Field>
                <Field label="Address">
                  <input className={inputCls} value={form.address || ''} onChange={e => set('address', e.target.value)} placeholder="123 Main St" />
                </Field>
                <Field label="State">
                  <select className={inputCls} value={form.state || 'MO'} onChange={e => set('state', e.target.value)}>
                    {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </Field>
                <Field label="Google Business Profile">
                  <input className={inputCls} value={form.googleBusinessProfile || ''} onChange={e => set('googleBusinessProfile', e.target.value)} placeholder="https://maps.google.com/..." />
                </Field>
              </div>
            </div>

            {/* Research */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
              <h2 className="font-semibold text-gray-800">Research & Opportunity</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Has Website?">
                  <select className={inputCls} value={form.hasWebsite || ''} onChange={e => set('hasWebsite', e.target.value)}>
                    <option value="">Unknown</option>
                    <option>Yes</option>
                    <option>No</option>
                  </select>
                </Field>
                <Field label="Has Facebook Page?">
                  <select className={inputCls} value={form.hasFacebookPage || ''} onChange={e => set('hasFacebookPage', e.target.value)}>
                    <option value="">Unknown</option>
                    <option>Yes</option>
                    <option>No</option>
                  </select>
                </Field>
                <Field label="Website Quality">
                  <select className={inputCls} value={form.currentWebsiteQuality || ''} onChange={e => set('currentWebsiteQuality', e.target.value)}>
                    <option value="">Select...</option>
                    {WEBSITE_QUALITY_OPTIONS.map(q => <option key={q} value={q}>{q}</option>)}
                  </select>
                </Field>
                <Field label="Lead Source">
                  <select className={inputCls} value={form.leadSource || ''} onChange={e => set('leadSource', e.target.value)}>
                    {LEAD_SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </Field>
                <Field label="Estimated Deal Value ($)">
                  <input className={inputCls} type="number" value={form.estimatedDealValue ?? ''} onChange={e => set('estimatedDealValue', e.target.value ? Number(e.target.value) : null)} placeholder="1500" />
                </Field>
                <Field label="Service Opportunity">
                  <select className={inputCls} value={form.serviceOpportunity || ''} onChange={e => set('serviceOpportunity', e.target.value)}>
                    <option value="">Select...</option>
                    {SERVICE_OPPORTUNITIES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Suggested Offer">
                    <input className={inputCls} value={form.suggestedOffer || ''} onChange={e => set('suggestedOffer', e.target.value)} placeholder="Starter Website + Local SEO" />
                  </Field>
                </div>
              </div>
            </div>

            {/* Pitch & Notes */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
              <h2 className="font-semibold text-gray-800">Pitch & Notes</h2>
              <div className="grid grid-cols-1 gap-4">
                <Field label="Pain Points">
                  <textarea className={textareaCls} rows={2} value={form.painPoints || ''} onChange={e => set('painPoints', e.target.value)} placeholder="What problems does this business have?" />
                </Field>
                <Field label="Personalized Pitch">
                  <textarea className={textareaCls} rows={3} value={form.personalizedPitch || ''} onChange={e => set('personalizedPitch', e.target.value)} placeholder="Custom pitch angle for this lead..." />
                </Field>
              </div>
            </div>

            {/* Follow-up & Demos */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
              <h2 className="font-semibold text-gray-800">Follow Up & Demos</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Last Contacted Date">
                  <input className={inputCls} type="date" value={form.lastContactedDate || ''} onChange={e => set('lastContactedDate', e.target.value)} />
                </Field>
                <Field label="Next Follow Up Date">
                  <input className={inputCls} type="date" value={form.nextFollowUpDate || ''} onChange={e => set('nextFollowUpDate', e.target.value)} />
                </Field>
                <Field label="Demo Website URL">
                  <input className={inputCls} value={form.demoWebsiteUrl || ''} onChange={e => set('demoWebsiteUrl', e.target.value)} placeholder="https://demo.yourdomain.com/..." />
                </Field>
                <Field label="CRM Demo URL">
                  <input className={inputCls} value={form.crmDemoUrl || ''} onChange={e => set('crmDemoUrl', e.target.value)} placeholder="https://..." />
                </Field>
              </div>
            </div>

            {/* Package Interest */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
              <h2 className="font-semibold text-gray-800">Package Interest</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Field label="Website Package">
                  <input className={inputCls} value={form.websitePackageInterest || ''} onChange={e => set('websitePackageInterest', e.target.value)} placeholder="Starter Website" />
                </Field>
                <Field label="CRM Package">
                  <input className={inputCls} value={form.crmPackageInterest || ''} onChange={e => set('crmPackageInterest', e.target.value)} placeholder="Custom CRM" />
                </Field>
                <Field label="Marketing Package">
                  <input className={inputCls} value={form.marketingPackageInterest || ''} onChange={e => set('marketingPackageInterest', e.target.value)} placeholder="Local SEO" />
                </Field>
              </div>
            </div>

            {/* Tags */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-3">
              <h2 className="font-semibold text-gray-800">Tags</h2>
              <div className="flex gap-2">
                <input
                  className={inputCls + ' flex-1'}
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                  placeholder="Add tag and press Enter..."
                />
                <button type="button" onClick={addTag} className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200">Add</button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {((form.tags || []) as string[]).map(tag => (
                  <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs border border-slate-200">
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)} className="text-slate-400 hover:text-red-500">×</button>
                  </span>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Submit */}
        <div className="flex items-center gap-3 pb-4">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 disabled:opacity-60 transition-colors"
          >
            <Save size={16} />
            {saving ? 'Saving...' : 'Save Lead'}
          </button>
          <button
            type="button"
            onClick={() => setForm(EMPTY)}
            className="flex items-center gap-2 px-4 py-3 border border-gray-200 text-gray-600 rounded-lg font-medium text-sm hover:bg-gray-50"
          >
            <RotateCcw size={14} />
            Reset
          </button>
        </div>

      </form>
    </AppLayout>
  );
}
