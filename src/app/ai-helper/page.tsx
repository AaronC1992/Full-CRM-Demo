'use client';
import { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { showToast } from '@/components/ui/Toast';
import { Sparkles, RefreshCw, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';

interface LeadSnapshot {
  businessName: string;
  city: string;
  industry: string;
  hasWebsite: string;
  websiteQuality: string;
  hasFacebook: string;
  currentProblem: string;
  services: string;
  estimatedBudget: string;
}

interface ResearchedLead {
  businessName: string;
  city: string;
  industry: string;
  hasWebsite: string;
  website: string;
  serviceOpportunity: string;
  estimatedDealValue: number;
  priority: string;
}

const EMPTY: LeadSnapshot = {
  businessName: '',
  city: 'Joplin',
  industry: '',
  hasWebsite: 'Yes',
  websiteQuality: 'Outdated',
  hasFacebook: 'Yes',
  currentProblem: '',
  services: '',
  estimatedBudget: '$1,000–$2,500',
};

const SERVICES_OPTIONS = [
  'Website redesign',
  'New website',
  'Local SEO',
  'Social media management',
  'Facebook Ads',
  'Google Ads',
  'Custom CRM',
  'Lead generation',
  'Full bundle',
];

function buildLeadProfilePrompt(_s: LeadSnapshot): string { return ''; }
function buildResearchPrompt(_city: string, _industry: string, _count: number): string { return ''; }

export default function AIHelperPage() {
  const [mode, setMode] = useState<'pitch' | 'research'>('pitch');

  /* Pitch state */
  const [lead, setLead] = useState<LeadSnapshot>(EMPTY);
  const [pitchResult, setPitchResult] = useState('');
  const [pitchLoading, setPitchLoading] = useState(false);
  const [pitchError, setPitchError] = useState('');

  /* Research state */
  const [researchCity, setResearchCity] = useState('Joplin');
  const [researchIndustry, setResearchIndustry] = useState('');
  const [researchCount, setResearchCount] = useState(10);
  const [researchLoading, setResearchLoading] = useState(false);
  const [researchError, setResearchError] = useState('');
  const [researchResult, setResearchResult] = useState<{ count: number; leads: ResearchedLead[] } | null>(null);

  const inp = 'w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white';

  /* ── Pitch ── */
  async function handleGeneratePitch() {
    setPitchError('');
    setPitchResult('');
    setPitchLoading(true);
    try {
      const res = await fetch('/api/ai/pitch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lead),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed');
      setPitchResult(data.result);
    } catch (e: unknown) {
      setPitchError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setPitchLoading(false);
    }
  }

  /* ── Research ── */
  async function handleResearch() {
    if (!researchCity || !researchIndustry) {
      showToast('Enter city and industry first.', 'error');
      return;
    }
    setResearchError('');
    setResearchResult(null);
    setResearchLoading(true);
    try {
      const res = await fetch('/api/ai/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ city: researchCity, industry: researchIndustry, count: researchCount }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed');
      setResearchResult(data);
      showToast(`${data.count} leads added to your CRM!`, 'success');
    } catch (e: unknown) {
      setResearchError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setResearchLoading(false);
    }
  }

  return (
    <AppLayout title="AI Helper">
      <div className="max-w-4xl space-y-6">

        {/* Banner */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-4 flex items-start gap-3">
          <Sparkles size={20} className="text-indigo-600 mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold text-indigo-800 text-sm">AI-powered — no copy/paste needed</p>
            <p className="text-sm text-indigo-700 mt-1">
              <strong>Pitch Helper</strong> generates a personalized sales pitch instantly.&nbsp;
              <strong>Lead Research</strong> finds local businesses and saves them directly to your CRM.
            </p>
          </div>
        </div>

        {/* Mode toggle */}
        <div className="flex rounded-xl border border-gray-200 overflow-hidden w-fit">
          {(['pitch', 'research'] as const).map(m => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-5 py-2.5 text-sm font-medium transition-colors ${mode === m ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
            >
              {m === 'pitch' ? 'Pitch Helper' : 'Lead Research'}
            </button>
          ))}
        </div>

        {/* ── PITCH MODE ── */}
        {mode === 'pitch' && (
          <>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h2 className="font-semibold text-gray-800 mb-4">Lead Pitch Generator</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Business Name</label>
                  <input className={inp} value={lead.businessName} onChange={e => setLead(p => ({ ...p, businessName: e.target.value }))} placeholder="Joplin Auto Repair" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">City</label>
                  <input className={inp} value={lead.city} onChange={e => setLead(p => ({ ...p, city: e.target.value }))} placeholder="Joplin" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Industry</label>
                  <input className={inp} value={lead.industry} onChange={e => setLead(p => ({ ...p, industry: e.target.value }))} placeholder="Automotive" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Has Website?</label>
                  <select className={inp} value={lead.hasWebsite} onChange={e => setLead(p => ({ ...p, hasWebsite: e.target.value }))}>
                    <option>Yes</option><option>No</option><option>Unknown</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Website Quality</label>
                  <select className={inp} value={lead.websiteQuality} onChange={e => setLead(p => ({ ...p, websiteQuality: e.target.value }))}>
                    <option value="">Unknown</option>
                    <option>No website</option><option>Outdated</option>
                    <option>Decent but not great</option><option>Good</option><option>Modern</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Has Facebook?</label>
                  <select className={inp} value={lead.hasFacebook} onChange={e => setLead(p => ({ ...p, hasFacebook: e.target.value }))}>
                    <option>Yes</option><option>No</option><option>Unknown</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Estimated Budget</label>
                  <select className={inp} value={lead.estimatedBudget} onChange={e => setLead(p => ({ ...p, estimatedBudget: e.target.value }))}>
                    <option>$997–$1,500</option><option>$1,000–$2,500</option>
                    <option>$2,000–$5,000</option><option>$5,000+</option><option>Unknown</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Services of Interest</label>
                  <select className={inp} value={lead.services} onChange={e => setLead(p => ({ ...p, services: e.target.value }))}>
                    <option value="">Select...</option>
                    {SERVICES_OPTIONS.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs text-gray-500 mb-1 block">Current Problems / Pain Points</label>
                  <textarea
                    className={inp + ' resize-none'}
                    rows={2}
                    value={lead.currentProblem}
                    onChange={e => setLead(p => ({ ...p, currentProblem: e.target.value }))}
                    placeholder="Outdated website, no mobile version, bad Google reviews..."
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <button
                  onClick={handleGeneratePitch}
                  disabled={pitchLoading}
                  className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60"
                >
                  {pitchLoading
                    ? <><span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> Generating…</>
                    : <><Sparkles size={15} /> Generate Pitch</>}
                </button>
                <button onClick={() => { setLead(EMPTY); setPitchResult(''); setPitchError(''); }} className="flex items-center gap-2 px-3 py-2.5 border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50">
                  <RefreshCw size={13} /> Reset
                </button>
              </div>
            </div>

            {pitchError && (
              <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
                <AlertCircle size={16} className="mt-0.5 shrink-0" /> {pitchError}
              </div>
            )}

            {pitchResult && (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 size={16} className="text-green-500" />
                  <h3 className="font-semibold text-gray-800">AI Pitch</h3>
                </div>
                <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed bg-gray-50 border border-gray-200 rounded-lg p-4">
                  {pitchResult}
                </div>
              </div>
            )}
          </>
        )}

        {/* ── RESEARCH MODE ── */}
        {mode === 'research' && (
          <>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h2 className="font-semibold text-gray-800 mb-1">Lead Research</h2>
              <p className="text-sm text-gray-500 mb-4">AI finds local businesses and saves them directly to your leads list — no copy/paste.</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">City</label>
                  <input className={inp} value={researchCity} onChange={e => setResearchCity(e.target.value)} placeholder="Joplin" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Industry</label>
                  <input className={inp} value={researchIndustry} onChange={e => setResearchIndustry(e.target.value)} placeholder="Automotive, Dental, Roofing…" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Number of Leads</label>
                  <select className={inp} value={researchCount} onChange={e => setResearchCount(Number(e.target.value))}>
                    <option value={5}>5 leads</option>
                    <option value={10}>10 leads</option>
                    <option value={15}>15 leads</option>
                    <option value={20}>20 leads</option>
                  </select>
                </div>
              </div>
              <button
                onClick={handleResearch}
                disabled={researchLoading}
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60 mt-4"
              >
                {researchLoading
                  ? <><span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> Researching…</>
                  : <><Sparkles size={15} /> Find &amp; Add Leads</>}
              </button>
            </div>

            {researchError && (
              <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
                <AlertCircle size={16} className="mt-0.5 shrink-0" /> {researchError}
              </div>
            )}

            {researchResult && (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-green-500" />
                    <h3 className="font-semibold text-gray-800">{researchResult.count} leads added to your CRM</h3>
                  </div>
                  <a href="/leads" className="flex items-center gap-1.5 text-sm text-blue-600 hover:underline font-medium">
                    View Leads <ExternalLink size={13} />
                  </a>
                </div>
                <div className="space-y-2">
                  {researchResult.leads.map((l, i) => (
                    <div key={i} className="flex items-start justify-between py-2 border-b border-gray-100 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-gray-800">{l.businessName}</p>
                        <p className="text-xs text-gray-500">{l.city} · {l.industry} · {l.hasWebsite === 'No' ? 'No website' : l.website || 'Has website'}</p>
                        {l.serviceOpportunity && <p className="text-xs text-indigo-600 mt-0.5">{l.serviceOpportunity}</p>}
                      </div>
                      <div className="text-right shrink-0 ml-4">
                        {l.estimatedDealValue > 0 && (
                          <p className="text-sm font-semibold text-green-600">${l.estimatedDealValue.toLocaleString()}</p>
                        )}
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          l.priority === 'Hot' ? 'bg-red-100 text-red-700' :
                          l.priority === 'Warm' ? 'bg-amber-100 text-amber-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>{l.priority}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

      </div>
    </AppLayout>
  );
}


Business: ${s.businessName || '[Business Name]'}
City: ${s.city}
Industry: ${s.industry || '[Industry]'}
Has website: ${s.hasWebsite}${s.websiteQuality ? ` (Quality: ${s.websiteQuality})` : ''}
Has Facebook page: ${s.hasFacebook}
Current problems/pain points: ${s.currentProblem || '[Not specified]'}
Services of interest: ${s.services || '[Not specified]'}
Estimated budget: ${s.estimatedBudget}

Please provide:
1. **Lead Score** (Hot/Warm/Cold) with brief reasoning
2. **Personalized Pitch** (2-3 sentences, conversational, for a cold call or Facebook message)
3. **Best Opening Line** for a cold call
4. **Pain Point Summary** (what problems they likely have)
5. **Recommended Service Package** with pricing from Cue Marketing's offerings
6. **Follow-Up Strategy** (timeline and approach)

Keep it practical and concise. Aaron (918 808 0074) will use this directly in his sales process.`;
}

function buildResearchPrompt(city: string, industry: string, count: number): string {
  return `You are a marketing research assistant for Cue Marketing Solutions, a digital marketing agency in Joplin, MO (service area: Joplin, Webb City, Carthage, Neosho, Carl Junction, Pittsburg MO).

Research ${count} local businesses in ${city}, MO in the ${industry} industry that would benefit from digital marketing services.

For each business, return a JSON array ONLY (no other text) in this exact format:

[{
  "businessName": "",
  "contactName": "",
  "phone": "",
  "email": "",
  "website": "",
  "facebookPage": "",
  "address": "",
  "city": "${city}",
  "state": "MO",
  "industry": "${industry}",
  "currentWebsiteQuality": "",
  "hasWebsite": "",
  "hasFacebookPage": "",
  "googleBusinessProfile": "",
  "serviceOpportunity": "",
  "suggestedOffer": "",
  "estimatedDealValue": 0,
  "leadSource": "ChatGPT research",
  "leadStatus": "New",
  "priority": "Warm",
  "notes": "",
  "painPoints": "",
  "personalizedPitch": "",
  "demoWebsiteUrl": "",
  "crmDemoUrl": "",
  "tags": []
}]

Focus on businesses with:
- Outdated website or no website
- Low online presence
- Would benefit from local SEO, website redesign, or social media
- Estimated deal value $997–$5000

Return ONLY the JSON array, no explanation.`;
}

export default function AIHelperPage() {
  const [mode, setMode] = useState<'pitch' | 'research'>('pitch');
  const [lead, setLead] = useState<LeadSnapshot>(EMPTY);
  const [researchCity, setResearchCity] = useState('Joplin');
  const [researchIndustry, setResearchIndustry] = useState('');
  const [researchCount, setResearchCount] = useState(10);
  const [prompt, setPrompt] = useState('');

  const inp = "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white";

  const generatePitchPrompt = () => {
    setPrompt(buildLeadProfilePrompt(lead));
  };

  const generateResearchPrompt = () => {
    if (!researchCity || !researchIndustry) {
      showToast('Enter city and industry first.', 'error'); return;
    }
    setPrompt(buildResearchPrompt(researchCity, researchIndustry, researchCount));
  };

  const copy = () => {
    if (!prompt) { showToast('Generate a prompt first.', 'error'); return; }
    navigator.clipboard.writeText(prompt).then(() => showToast('Prompt copied! Paste into ChatGPT.'));
  };

  return (
    <AppLayout title="AI Helper">
      <div className="max-w-4xl space-y-6">

        {/* Info banner */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Sparkles size={20} className="text-indigo-600 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-indigo-800 text-sm">How to use</p>
              <p className="text-sm text-indigo-700 mt-1">
                Fill out the form below, generate a ChatGPT prompt, then copy and paste it into ChatGPT.
                For <strong>research mode</strong>, ChatGPT returns JSON you can paste directly into <a href="/import-export" className="underline">Import/Export</a>.
              </p>
            </div>
          </div>
        </div>

        {/* Mode toggle */}
        <div className="flex rounded-xl border border-gray-200 overflow-hidden w-fit">
          <button
            onClick={() => setMode('pitch')}
            className={`px-5 py-2.5 text-sm font-medium transition-colors ${mode === 'pitch' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
          >
            Pitch Helper
          </button>
          <button
            onClick={() => setMode('research')}
            className={`px-5 py-2.5 text-sm font-medium transition-colors ${mode === 'research' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
          >
            Lead Research
          </button>
        </div>

        {/* Pitch mode */}
        {mode === 'pitch' && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-semibold text-gray-800 mb-4">Lead Pitch Generator</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Business Name</label>
                <input className={inp} value={lead.businessName} onChange={e => setLead(p => ({ ...p, businessName: e.target.value }))} placeholder="Joplin Auto Repair" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">City</label>
                <input className={inp} value={lead.city} onChange={e => setLead(p => ({ ...p, city: e.target.value }))} placeholder="Joplin" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Industry</label>
                <input className={inp} value={lead.industry} onChange={e => setLead(p => ({ ...p, industry: e.target.value }))} placeholder="Automotive" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Has Website?</label>
                <select className={inp} value={lead.hasWebsite} onChange={e => setLead(p => ({ ...p, hasWebsite: e.target.value }))}>
                  <option>Yes</option><option>No</option><option>Unknown</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Website Quality</label>
                <select className={inp} value={lead.websiteQuality} onChange={e => setLead(p => ({ ...p, websiteQuality: e.target.value }))}>
                  <option value="">Unknown</option>
                  <option>No website</option>
                  <option>Outdated</option>
                  <option>Decent but not great</option>
                  <option>Good</option>
                  <option>Modern</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Has Facebook?</label>
                <select className={inp} value={lead.hasFacebook} onChange={e => setLead(p => ({ ...p, hasFacebook: e.target.value }))}>
                  <option>Yes</option><option>No</option><option>Unknown</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Estimated Budget</label>
                <select className={inp} value={lead.estimatedBudget} onChange={e => setLead(p => ({ ...p, estimatedBudget: e.target.value }))}>
                  <option>$997–$1,500</option>
                  <option>$1,000–$2,500</option>
                  <option>$2,000–$5,000</option>
                  <option>$5,000+</option>
                  <option>Unknown</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Services of Interest</label>
                <select className={inp} value={lead.services} onChange={e => setLead(p => ({ ...p, services: e.target.value }))}>
                  <option value="">Select...</option>
                  {SERVICES_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs text-gray-500 mb-1 block">Current Problems / Pain Points</label>
                <textarea
                  className={inp + ' resize-none'}
                  rows={2}
                  value={lead.currentProblem}
                  onChange={e => setLead(p => ({ ...p, currentProblem: e.target.value }))}
                  placeholder="Outdated website, no mobile version, bad Google reviews, no social media..."
                />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={generatePitchPrompt} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
                <Sparkles size={15} /> Generate Prompt
              </button>
              <button onClick={() => setLead(EMPTY)} className="flex items-center gap-2 px-3 py-2.5 border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50">
                <RefreshCw size={13} /> Reset
              </button>
            </div>
          </div>
        )}

        {/* Research mode */}
        {mode === 'research' && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-semibold text-gray-800 mb-1">Lead Research Generator</h2>
            <p className="text-sm text-gray-500 mb-4">Generate a prompt for ChatGPT to find local businesses. Results paste directly into Import/Export.</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">City</label>
                <input className={inp} value={researchCity} onChange={e => setResearchCity(e.target.value)} placeholder="Joplin" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Industry</label>
                <input className={inp} value={researchIndustry} onChange={e => setResearchIndustry(e.target.value)} placeholder="Automotive, Dental, Roofing..." />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Number of Leads</label>
                <select className={inp} value={researchCount} onChange={e => setResearchCount(Number(e.target.value))}>
                  <option value={5}>5 leads</option>
                  <option value={10}>10 leads</option>
                  <option value={15}>15 leads</option>
                  <option value={20}>20 leads</option>
                </select>
              </div>
            </div>
            <button onClick={generateResearchPrompt} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 mt-4">
              <Sparkles size={15} /> Generate Research Prompt
            </button>
          </div>
        )}

        {/* Generated prompt output */}
        {prompt && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-800">Generated Prompt</h3>
              <button onClick={copy} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
                <Copy size={14} /> Copy to Clipboard
              </button>
            </div>
            <pre className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-96 overflow-y-auto font-sans leading-relaxed">
              {prompt}
            </pre>
            <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
              <Sparkles size={12} />
              Paste this into ChatGPT, then{mode === 'research' ? ' paste the JSON result into Import/Export' : ' use the response to craft your pitch'}.
            </div>
          </div>
        )}

      </div>
    </AppLayout>
  );
}
