'use client';
import { useState, useRef } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { showToast } from '@/components/ui/Toast';
import { ImportResult } from '@/lib/types';
import { useDemoMode } from '@/components/demo/DemoModeProvider';
import { getIndustryServiceCatalog } from '@/lib/demo-mode';
import { Download, Upload, Copy, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function ImportExportPage() {
  const { industry, industryOption } = useDemoMode();
  const serviceCatalog = getIndustryServiceCatalog(industry);
  const [jsonText, setJsonText] = useState('');
    const jsonSample = JSON.stringify([{
      businessName: `Sample ${industryOption.shortLabel} Prospect`,
      contactName: 'Jordan Smith',
      phone: '417-555-0100',
      email: 'jordan@example.com',
      website: 'https://samplebusiness.com',
      facebookPage: 'https://facebook.com/samplebusiness',
      address: '123 Main St',
      city: 'Joplin',
      state: 'MO',
      industry: industryOption.shortLabel,
      currentWebsiteQuality: 'Outdated basic site',
      hasWebsite: 'Yes',
      hasFacebookPage: 'Yes',
      googleBusinessProfile: 'https://maps.google.com/?cid=...',
      serviceOpportunity: serviceCatalog.serviceOptions.slice(0, 2).join(', '),
      suggestedOffer: serviceCatalog.suggestedOfferPlaceholder,
      estimatedDealValue: 2497,
      leadSource: 'ChatGPT research',
      leadStatus: 'New',
      priority: 'Warm',
      notes: 'Online presence needs improvement and follow up is inconsistent.',
      painPoints: 'Old workflow, weak follow up, unclear service request path',
      personalizedPitch: `I noticed your ${industryOption.shortLabel.toLowerCase()} business could benefit from ${serviceCatalog.serviceOptions[0].toLowerCase()} and ${serviceCatalog.serviceOptions[1].toLowerCase()}.`,
      demoWebsiteUrl: '',
      crmDemoUrl: '',
      tags: ['demo', industry.replace(/-/g, ' '), 'joplin']
    }], null, 2);

    const chatGptPromptTemplate = `You are a research assistant for Full CRM Demo, a configurable CRM demo platform for local businesses.

  Use generic demo contact details and avoid real personal information.

  Services offered:
  ${serviceCatalog.serviceOptions.map((service) => `- ${service}`).join('\n')}

  I need you to research local businesses in [CITY, MO] in the [INDUSTRY] industry and find [NUMBER] leads that would benefit from these services.

  For each lead, return a JSON array in EXACTLY this format, no extra text, just the JSON array:

  ${jsonSample}

  Criteria for good leads:
  - Local business in the service area
  - Would benefit from the services listed above
  - Estimated deal value: $997 to $5000 depending on scope

  IMPORTANT: Return ONLY the JSON array, no other text. I will paste this directly into my CRM.`;

  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const importJson = async () => {
    if (!jsonText.trim()) { showToast('Paste JSON first.', 'error'); return; }
    setImporting(true);
    setResult(null);
    try {
      let parsed;
      try { parsed = JSON.parse(jsonText); } catch { showToast('Invalid JSON. Check format.', 'error'); setImporting(false); return; }
      if (!Array.isArray(parsed)) parsed = [parsed];

      const res = await fetch('/api/import/leads', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed),
      });
      const data = await res.json();
      setResult(data);
      if (data.imported > 0) showToast(`${data.imported} lead${data.imported !== 1 ? 's' : ''} imported!`);
      else showToast('No new leads imported.', 'info');
    } catch { showToast('Import failed.', 'error'); }
    setImporting(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setJsonText(ev.target?.result as string || '');
    reader.readAsText(file);
  };

  const exportCsv = () => {
    window.open('/api/export/leads', '_blank');
    showToast('CSV export started!');
  };

  const exportJson = async () => {
    const res = await fetch('/api/leads?limit=10000');
    if (!res.ok) return;
    const leads = await res.json();
    const blob = new Blob([JSON.stringify(leads, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `crm-leads-${new Date().toISOString().split('T')[0]}.json`;
    a.click(); URL.revokeObjectURL(url);
    showToast('JSON export downloaded!');
  };

  const copySample = () => {
    navigator.clipboard.writeText(jsonSample).then(() => showToast('Sample JSON format copied!'));
  };

  const copyChatGptPrompt = () => {
    navigator.clipboard.writeText(chatGptPromptTemplate).then(() => showToast('ChatGPT prompt copied!'));
  };

  return (
    <AppLayout title="Import / Export">
      <div className="max-w-4xl space-y-6">

        {/* Export section */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-semibold text-gray-800 mb-1">Export Leads</h2>
          <p className="text-sm text-gray-500 mb-4">Download all your leads as CSV or JSON.</p>
          <div className="flex flex-wrap gap-3">
            <button onClick={exportCsv} className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700">
              <Download size={16} /> Export CSV
            </button>
            <button onClick={exportJson} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
              <Download size={16} /> Export JSON
            </button>
          </div>
        </div>

        {/* ChatGPT prompt helper */}
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-200 p-5">
          <h2 className="font-semibold text-indigo-800 mb-1">ChatGPT Lead Research Prompt</h2>
          <p className="text-sm text-indigo-700 mb-4">
            Copy this prompt into ChatGPT to research leads. Edit [CITY], [INDUSTRY], and [NUMBER] before sending.
            ChatGPT will return JSON in the exact format your CRM accepts — paste it below to import!
          </p>
          <button onClick={copyChatGptPrompt} className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
            <Copy size={16} /> Copy ChatGPT Prompt
          </button>
          <div className="mt-3 bg-white/60 border border-indigo-200 rounded-lg p-3 text-xs text-indigo-800 font-mono whitespace-pre-wrap max-h-36 overflow-y-auto">
            {chatGptPromptTemplate.slice(0, 300)}...
          </div>
        </div>

        {/* JSON Import */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-start justify-between mb-1">
            <div>
              <h2 className="font-semibold text-gray-800">Import Leads (JSON)</h2>
              <p className="text-sm text-gray-500 mt-0.5">Paste JSON from ChatGPT or upload a .json file.</p>
            </div>
            <div className="flex gap-2">
              <button onClick={copySample} className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-50">
                <Copy size={12} /> Sample Format
              </button>
              <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-50">
                <FileText size={12} /> Load File
              </button>
              <input ref={fileInputRef} type="file" accept=".json,.txt" className="hidden" onChange={handleFileUpload} />
            </div>
          </div>
          <textarea
            className="w-full border border-gray-200 rounded-lg px-3 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none bg-gray-50 mt-3"
            rows={10}
            value={jsonText}
            onChange={e => setJsonText(e.target.value)}
            placeholder={`Paste JSON array here...\n\n${jsonSample.slice(0, 200)}...`}
          />
          <div className="flex items-center gap-3 mt-3">
            <button
              onClick={importJson}
              disabled={importing || !jsonText.trim()}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60"
            >
              <Upload size={16} /> {importing ? 'Importing...' : 'Import Leads'}
            </button>
            {jsonText && <button onClick={() => { setJsonText(''); setResult(null); }} className="text-sm text-gray-400 hover:text-gray-600">Clear</button>}
          </div>

          {/* Import result */}
          {result && (
            <div className={`mt-4 rounded-lg p-4 border ${result.imported > 0 ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
              <div className="flex items-center gap-2 mb-2">
                {result.imported > 0
                  ? <CheckCircle size={16} className="text-green-600" />
                  : <AlertCircle size={16} className="text-gray-500" />}
                <span className="font-semibold text-sm text-gray-800">Import Complete</span>
              </div>
              <div className="flex gap-6 text-sm">
                <span className="text-green-700"><strong>{result.imported}</strong> imported</span>
                {result.skipped > 0 && <span className="text-amber-700"><strong>{result.skipped}</strong> skipped (duplicates)</span>}
                {result.errors.length > 0 && <span className="text-red-700"><strong>{result.errors.length}</strong> errors</span>}
              </div>
              {result.imported > 0 && (
                <div className="mt-3">
                  <Link href="/leads?sort=createdDate&dir=desc" className="text-sm text-blue-600 hover:underline inline-flex items-center gap-1">
                    View {result.imported} newly imported lead{result.imported !== 1 ? 's' : ''} →
                  </Link>
                </div>
              )}
              {result.details && result.details.length > 0 && (
                <ul className="mt-2 text-xs text-gray-600 space-y-0.5 max-h-32 overflow-y-auto">
                  {result.details.map((d, i) => <li key={i}>• {d}</li>)}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* JSON Format Reference */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="font-semibold text-gray-800">JSON Format Reference</h2>
              <p className="text-sm text-gray-500 mt-0.5">The exact format your CRM accepts for JSON imports.</p>
            </div>
            <button onClick={copySample} className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200">
              <Copy size={14} /> Copy
            </button>
          </div>
          <pre className="text-xs text-gray-700 bg-gray-50 border border-gray-200 rounded-lg p-4 overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed">
            {jsonSample}
          </pre>
        </div>

      </div>
    </AppLayout>
  );
}
