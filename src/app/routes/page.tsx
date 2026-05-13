'use client';
import { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { showToast } from '@/components/ui/Toast';
import Modal from '@/components/ui/Modal';
import { Lead, RoutePlan, RouteStop } from '@/lib/types';
import { LEAD_STATUSES, PRIORITIES, INDUSTRIES, SERVICE_OPPORTUNITIES } from '@/lib/utils';
import {
  MapPin, Navigation, Sparkles, Route, Clock, Filter, Search,
  CheckSquare, Square, RefreshCw, Phone, Globe, AlertTriangle,
  ChevronDown, ChevronUp, Copy, Download, ExternalLink, Map,
  CheckCircle2, XCircle, Play, Save, Trash2, SkipForward,
  AlertCircle, Plus, Calendar, Star, Flame, Zap, RotateCcw,
  ArrowUpDown, List, Eye
} from 'lucide-react';
import Link from 'next/link';

// ── Constants ──────────────────────────────────────────────────────────────────

const TRAVEL_MODES = ['Driving', 'Walking', 'Bicycling'];
const VISIT_INTEREST_LEVELS = ['Not interested', 'Low', 'Medium', 'High', 'Very hot'];
const VISIT_NEXT_ACTIONS = ['Call back', 'Email', 'Send demo', 'Build demo website', 'Send proposal', 'Schedule meeting', 'No action'];
const IN_PERSON_STATUSES = ['Not visited', 'Planned', 'Visited', 'No one available', 'Spoke with owner', 'Spoke with employee', 'Left card', 'Asked to follow up', 'Not interested', 'Follow up scheduled', 'Converted'];

const inp = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white';
const label = 'text-xs text-gray-500 mb-1 block font-medium';

// ── Priority badge colors ──────────────────────────────────────────────────────
function PriorityDot({ priority }: { priority: string }) {
  const colors: Record<string, string> = {
    'Hot': 'bg-orange-500', 'Urgent': 'bg-red-600', 'Warm': 'bg-yellow-400', 'Cold': 'bg-blue-400',
  };
  return <span className={`inline-block w-2 h-2 rounded-full shrink-0 ${colors[priority] || 'bg-gray-300'}`} />;
}

function StatusDot({ status }: { status: string }) {
  const won = status === 'Won';
  const lost = status === 'Lost' || status === 'Not a fit';
  const hot = ['Interested', 'Meeting scheduled', 'Proposal sent'].includes(status);
  const cls = won ? 'bg-green-500' : lost ? 'bg-gray-400' : hot ? 'bg-teal-500' : 'bg-blue-400';
  return <span className={`inline-block w-2 h-2 rounded-full shrink-0 ${cls}`} />;
}

// ── Visit Outcome Modal ────────────────────────────────────────────────────────
interface VisitModalProps {
  stop: RouteStop;
  routeId: number;
  onClose: () => void;
  onSaved: (stopId: number) => void;
}
function VisitOutcomeModal({ stop, routeId, onClose, onSaved }: VisitModalProps) {
  const [spokeTo, setSpokeTo] = useState('');
  const [outcome, setOutcome] = useState('');
  const [interest, setInterest] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [notes, setNotes] = useState('');
  const [nextAction, setNextAction] = useState('');
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    const res = await fetch(`/api/routes/${routeId}/complete-stop`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stopId: stop.id, spokeTo, visitOutcome: outcome, interestLevel: interest, followUpDate, notes, nextAction }),
    });
    if (res.ok) {
      showToast('Visit saved!', 'success');
      onSaved(stop.id);
      onClose();
    } else {
      const d = await res.json();
      showToast(d.error || 'Failed to save visit', 'error');
    }
    setSaving(false);
  }

  return (
    <Modal open={true} title={`Visit Outcome — ${stop.businessName}`} onClose={onClose}>
      <div className="space-y-4 p-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={label}>Who did you talk to?</label>
            <input className={inp} value={spokeTo} onChange={e => setSpokeTo(e.target.value)} placeholder="Owner name, employee, etc." />
          </div>
          <div>
            <label className={label}>Interest Level</label>
            <select className={inp} value={interest} onChange={e => setInterest(e.target.value)}>
              <option value="">Select...</option>
              {VISIT_INTEREST_LEVELS.map(l => <option key={l}>{l}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={label}>What happened?</label>
            <textarea className={`${inp} resize-none`} rows={3} value={outcome} onChange={e => setOutcome(e.target.value)} placeholder="Brief description of the visit..." />
          </div>
          <div>
            <label className={label}>Follow-up Date</label>
            <input type="date" className={inp} value={followUpDate} onChange={e => setFollowUpDate(e.target.value)} />
          </div>
          <div>
            <label className={label}>Next Action</label>
            <select className={inp} value={nextAction} onChange={e => setNextAction(e.target.value)}>
              <option value="">Select...</option>
              {VISIT_NEXT_ACTIONS.map(a => <option key={a}>{a}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={label}>Notes</label>
            <textarea className={`${inp} resize-none`} rows={2} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any extra notes..." />
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <button onClick={save} disabled={saving} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-60">
            {saving ? <><span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> Saving...</> : <><CheckCircle2 size={15} /> Save Visit</>}
          </button>
          <button onClick={onClose} className="px-4 py-2.5 border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
        </div>
      </div>
    </Modal>
  );
}

// ── Stop Card ──────────────────────────────────────────────────────────────────
interface StopCardProps {
  stop: RouteStop;
  index: number;
  routeId: number | null;
  onRemove: (id: number) => void;
  onSkip: (id: number, skipped: boolean) => void;
  onMarkVisited: (stop: RouteStop) => void;
  onMoveUp: (id: number) => void;
  onMoveDown: (id: number) => void;
  isFirst: boolean;
  isLast: boolean;
}
function StopCard({ stop, index, routeId, onRemove, onSkip, onMarkVisited, onMoveUp, onMoveDown, isFirst, isLast }: StopCardProps) {
  const [expanded, setExpanded] = useState(false);
  const address = [stop.address, stop.city, stop.state].filter(Boolean).join(', ');
  const mapsQuery = encodeURIComponent(address);

  return (
    <div className={`bg-white rounded-xl border shadow-sm transition-all ${stop.skipped ? 'opacity-50 border-gray-200' : stop.visitCompleted ? 'border-green-200 bg-green-50/30' : 'border-gray-100'}`}>
      <div className="px-4 py-3 flex items-start gap-3">
        {/* Stop number */}
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 mt-0.5 ${stop.visitCompleted ? 'bg-green-500 text-white' : stop.skipped ? 'bg-gray-300 text-gray-600' : 'bg-blue-600 text-white'}`}>
          {stop.visitCompleted ? <CheckCircle2 size={16} /> : stop.skipped ? <XCircle size={14} /> : index + 1}
        </div>

        {/* Main info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div>
              <p className="font-semibold text-gray-800 text-sm">{stop.businessName}</p>
              {address && <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5"><MapPin size={11} />{address}</p>}
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <PriorityDot priority={stop.priority} />
              <span className="text-xs text-gray-500">{stop.priority}</span>
              <StatusDot status={stop.leadStatus} />
              <span className="text-xs text-gray-400">{stop.leadStatus}</span>
            </div>
          </div>

          {/* Quick info row */}
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            {stop.phone && (
              <a href={`tel:${stop.phone}`} className="flex items-center gap-1 text-xs text-blue-600 hover:underline">
                <Phone size={11} />{stop.phone}
              </a>
            )}
            {stop.website && (
              <a href={stop.website.startsWith('http') ? stop.website : `https://${stop.website}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-blue-600 hover:underline">
                <Globe size={11} />Website
              </a>
            )}
            {stop.industry && <span className="text-xs text-gray-400">{stop.industry}</span>}
            {stop.estimatedVisitMinutes && (
              <span className="flex items-center gap-1 text-xs text-gray-400"><Clock size={11} />{stop.estimatedVisitMinutes}m</span>
            )}
          </div>

          {/* Suggested offer pill */}
          {stop.suggestedOffer && (
            <div className="mt-2">
              <span className="inline-flex items-center gap-1 text-xs bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded-full">
                <Zap size={10} />{stop.suggestedOffer}
              </span>
            </div>
          )}

          {/* Visit outcome badge */}
          {stop.visitCompleted && stop.interestLevel && (
            <div className="mt-2">
              <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${stop.interestLevel === 'Very hot' || stop.interestLevel === 'High' ? 'bg-green-100 text-green-700' : stop.interestLevel === 'Not interested' ? 'bg-gray-100 text-gray-600' : 'bg-amber-100 text-amber-700'}`}>
                <Star size={10} />Interest: {stop.interestLevel}
              </span>
            </div>
          )}
        </div>

        {/* Expand toggle */}
        <button onClick={() => setExpanded(e => !e)} className="text-gray-400 hover:text-gray-600 p-1 shrink-0">
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-gray-50 pt-3 space-y-3">
          {stop.visitReason && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Why Visit</p>
              <p className="text-sm text-gray-700">{stop.visitReason}</p>
            </div>
          )}
          {stop.recommendedPitch && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Pitch</p>
              <p className="text-sm text-gray-700">{stop.recommendedPitch}</p>
            </div>
          )}
          {Array.isArray(stop.talkingPoints) && stop.talkingPoints.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Talking Points</p>
              <ul className="space-y-1">
                {stop.talkingPoints.map((tp, i) => (
                  <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                    <span className="text-blue-400 mt-1">&#8226;</span>{tp}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {stop.leaveBehindSuggestion && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Leave Behind</p>
              <p className="text-sm text-gray-700">{stop.leaveBehindSuggestion}</p>
            </div>
          )}
          {stop.followUpAction && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Follow-up Action</p>
              <p className="text-sm text-gray-700">{stop.followUpAction}</p>
            </div>
          )}
          {stop.visitCompleted && stop.visitOutcome && (
            <div className="bg-green-50 rounded-lg p-3">
              <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-1">Visit Outcome</p>
              {stop.spokeTo && <p className="text-sm text-gray-700">Spoke with: <strong>{stop.spokeTo}</strong></p>}
              <p className="text-sm text-gray-700 mt-1">{stop.visitOutcome}</p>
              {stop.nextAction && <p className="text-xs text-green-700 mt-1">Next: {stop.nextAction} {stop.followUpDate ? `by ${stop.followUpDate}` : ''}</p>}
            </div>
          )}
          {stop.skipped && stop.skipReason && (
            <p className="text-sm text-gray-500 italic">Skipped: {stop.skipReason}</p>
          )}
        </div>
      )}

      {/* Action bar */}
      <div className="px-4 py-2.5 border-t border-gray-50 flex items-center gap-2 flex-wrap">
        {/* Maps */}
        <a href={`https://www.google.com/maps/dir/?api=1&destination=${mapsQuery}&travelmode=driving`} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs px-2.5 py-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 font-medium">
          <Map size={12} />Google Maps
        </a>
        <a href={`https://maps.apple.com/?q=${mapsQuery}`} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs px-2.5 py-1.5 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 font-medium">
          <Navigation size={12} />Apple Maps
        </a>
        {stop.leadId && (
          <Link href={`/leads/${stop.leadId}`}
            className="flex items-center gap-1 text-xs px-2.5 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 font-medium">
            <Eye size={12} />Lead
          </Link>
        )}

        <div className="flex-1" />

        {/* Reorder */}
        {!isFirst && (
          <button onClick={() => onMoveUp(stop.id)} className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-50 rounded" title="Move up">
            <ChevronUp size={14} />
          </button>
        )}
        {!isLast && (
          <button onClick={() => onMoveDown(stop.id)} className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-50 rounded" title="Move down">
            <ChevronDown size={14} />
          </button>
        )}

        {/* Skip / Unskip */}
        {!stop.visitCompleted && (
          <button onClick={() => onSkip(stop.id, !stop.skipped)}
            className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg font-medium ${stop.skipped ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>
            {stop.skipped ? <><RotateCcw size={11} />Unskip</> : <><SkipForward size={11} />Skip</>}
          </button>
        )}

        {/* Mark visited */}
        {!stop.skipped && (
          <button onClick={() => onMarkVisited(stop)}
            className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg font-medium ${stop.visitCompleted ? 'bg-green-50 text-green-700 hover:bg-green-100' : 'bg-green-600 text-white hover:bg-green-700'}`}>
            <CheckCircle2 size={11} />{stop.visitCompleted ? 'Edit Visit' : 'Mark Visited'}
          </button>
        )}

        {/* Remove */}
        <button onClick={() => onRemove(stop.id)} className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded">
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
function RouteBuilderContent() {
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<'build' | 'route' | 'history'>('build');

  // Config state
  const [config, setConfig] = useState({
    startAddress: '', endAddress: '', routeDate: new Date().toISOString().split('T')[0],
    startTime: '09:00', endTime: '17:00', maxStops: 10,
    travelMode: 'Driving', avoidTolls: false, avoidHighways: false,
    includeLunchBreak: false, routeGoal: '', notes: '',
  });

  // Filter state
  const [filters, setFilters] = useState({
    city: 'Joplin', state: 'MO', status: '', priority: '', industry: '',
    serviceOpportunity: '', hotOnly: false, followUpDue: false,
    noWebsite: false, badWebsite: false, customersOnly: false,
  });

  // Lead selection
  const [matchingLeads, setMatchingLeads] = useState<Lead[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(() => {
    // Pre-select leads passed via ?leads=1,2,3
    return new Set();
  });
  const [leadsLoading, setLeadsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const [leadSearch, setLeadSearch] = useState('');

  // Pre-select leads from URL params
  useEffect(() => {
    const leadsParam = searchParams.get('leads');
    if (leadsParam) {
      const ids = leadsParam.split(',').map(Number).filter(Boolean);
      if (ids.length > 0) setSelectedIds(new Set(ids));
    }
  }, [searchParams]);

  // Route plan state
  const [stops, setStops] = useState<RouteStop[]>([]);
  const [aiPlan, setAiPlan] = useState<{ summary: string; routeName: string; routeGoal: string; routeStrategy: string; followUpPlan: string; skippedLeads: { leadId: string; businessName: string; reason: string }[] } | null>(null);
  const [leadsWithoutAddress, setLeadsWithoutAddress] = useState<{ id: number; businessName: string; city: string }[]>([]);

  // Loading states
  const [buildLoading, setBuildLoading] = useState(false);
  const [optimizeLoading, setOptimizeLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  // Saved route
  const [savedRouteId, setSavedRouteId] = useState<number | null>(null);
  const [savedRoutes, setSavedRoutes] = useState<(RoutePlan & { stopCount?: number })[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Visit modal
  const [visitModalStop, setVisitModalStop] = useState<RouteStop | null>(null);

  // Maps result
  const [mapsUrls, setMapsUrls] = useState<string[]>([]);
  const [routeStats, setRouteStats] = useState({ driveTime: '', distance: '' });

  // ── Load matching leads ──────────────────────────────────────────────────────
  const fetchLeads = useCallback(async () => {
    setLeadsLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.city) params.set('city', filters.city);
      if (filters.status) params.set('status', filters.status);
      if (filters.priority) params.set('priority', filters.priority);
      if (filters.industry) params.set('industry', filters.industry);
      params.set('sort', 'priority');
      params.set('dir', 'desc');
      const res = await fetch(`/api/leads?${params}`);
      let data: Lead[] = await res.json();
      // Apply client-side filters
      if (filters.hotOnly) data = data.filter(l => l.priority === 'Hot' || l.priority === 'Urgent');
      if (filters.noWebsite) data = data.filter(l => l.hasWebsite === 'No' || !l.website);
      if (filters.badWebsite) data = data.filter(l => ['Outdated', 'Poor', 'Bad'].includes(l.currentWebsiteQuality));
      if (filters.customersOnly) data = data.filter(l => l.leadStatus === 'Won');
      if (filters.followUpDue) {
        const today = new Date().toISOString().split('T')[0];
        data = data.filter(l => l.nextFollowUpDate && l.nextFollowUpDate <= today && !['Won', 'Lost', 'Not a fit'].includes(l.leadStatus));
      }
      setMatchingLeads(data);
    } catch {
      setMatchingLeads([]);
    }
    setLeadsLoading(false);
  }, [filters]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  // Load history tab
  useEffect(() => {
    if (tab === 'history') {
      setHistoryLoading(true);
      fetch('/api/routes').then(r => r.json()).then(data => { setSavedRoutes(Array.isArray(data) ? data : []); setHistoryLoading(false); }).catch(() => setHistoryLoading(false));
    }
  }, [tab]);

  const filteredLeads = matchingLeads.filter(l =>
    !leadSearch || l.businessName.toLowerCase().includes(leadSearch.toLowerCase()) || l.city?.toLowerCase().includes(leadSearch.toLowerCase())
  );

  const toggleSelect = (id: number) => setSelectedIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const selectAll = () => setSelectedIds(new Set(filteredLeads.map(l => l.id)));
  const clearSelection = () => setSelectedIds(new Set());

  // ── Build route with AI ──────────────────────────────────────────────────────
  async function buildRoute() {
    if (selectedIds.size === 0 && Object.values(filters).every(v => !v || v === 'Joplin' || v === 'MO' || v === 'Driving')) {
      showToast('Select leads or set filters first.', 'error');
      return;
    }
    setBuildLoading(true);
    try {
      const res = await fetch('/api/routes/build', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          config: { ...config, maxStops: Number(config.maxStops) },
          filters,
          selectedLeadIds: selectedIds.size > 0 ? Array.from(selectedIds) : [],
        }),
      });
      const data = await res.json();
      if (!res.ok) { showToast(data.error || 'Build failed', 'error'); return; }
      setStops(data.stops || []);
      setAiPlan(data.aiPlan);
      setLeadsWithoutAddress(data.leadsWithoutAddress || []);
      setSavedRouteId(null);
      setMapsUrls([]);
      setRouteStats({ driveTime: '', distance: '' });
      setTab('route');
      showToast(`Route built with ${data.stops?.length || 0} stops!`, 'success');
    } catch {
      showToast('Route build failed. Check your connection.', 'error');
    }
    setBuildLoading(false);
  }

  // ── Optimize with Google Maps ────────────────────────────────────────────────
  async function optimizeRoute() {
    if (stops.length === 0) return;
    setOptimizeLoading(true);
    try {
      const payload = savedRouteId
        ? { routePlanId: savedRouteId }
        : { stops, startAddress: config.startAddress, endAddress: config.endAddress, travelMode: config.travelMode, avoidTolls: config.avoidTolls, avoidHighways: config.avoidHighways };
      const res = await fetch('/api/routes/optimize', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) { showToast(data.error || 'Optimization failed', 'error'); return; }
      setStops(data.optimizedStops || stops);
      setMapsUrls(data.googleMapsUrls || []);
      setRouteStats({ driveTime: data.estimatedDriveTime || '', distance: data.estimatedRouteDistance || '' });
      showToast('Route optimized!', 'success');
    } catch {
      showToast('Optimization failed. Is GOOGLE_MAPS_API_KEY set?', 'error');
    }
    setOptimizeLoading(false);
  }

  // ── Save route ────────────────────────────────────────────────────────────────
  async function saveRoute() {
    if (stops.length === 0) return;
    setSaveLoading(true);
    try {
      const body = {
        name: aiPlan?.routeName || `Route - ${new Date().toLocaleDateString()}`,
        routeDate: config.routeDate, startAddress: config.startAddress, endAddress: config.endAddress,
        city: filters.city, state: filters.state, startTime: config.startTime, endTime: config.endTime,
        status: 'Generated', notes: config.notes, aiSummary: aiPlan?.summary || '',
        routeGoal: config.routeGoal || aiPlan?.routeGoal || '',
        estimatedDriveTime: routeStats.driveTime, estimatedRouteDistance: routeStats.distance,
        googleMapsUrl: mapsUrls[0] || '', stops,
      };
      const res = await fetch('/api/routes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) { showToast(data.error || 'Save failed', 'error'); return; }
      setSavedRouteId(data.id);
      showToast('Route saved!', 'success');
    } catch {
      showToast('Failed to save route', 'error');
    }
    setSaveLoading(false);
  }

  // ── Generate Google Maps URL ──────────────────────────────────────────────────
  async function generateMapsUrl() {
    if (savedRouteId) {
      const res = await fetch(`/api/routes/${savedRouteId}/google-maps-url`);
      const data = await res.json();
      if (res.ok) { setMapsUrls(data.urls || []); if (data.primary) window.open(data.primary, '_blank'); }
      else showToast(data.error || 'Failed', 'error');
    } else {
      // Build URL from current stops without saving
      const active = stops.filter(s => !s.skipped);
      if (active.length === 0) { showToast('No active stops', 'error'); return; }
      const encode = (s: string) => encodeURIComponent(s);
      const addresses = active.map(s => [s.address, s.city, s.state].filter(Boolean).join(', '));
      const origin = config.startAddress || addresses[0];
      const dest = config.endAddress || addresses[addresses.length - 1];
      const wps = addresses.slice(0, -1);
      const url = `https://www.google.com/maps/dir/?api=1&origin=${encode(origin)}&destination=${encode(dest)}${wps.length > 0 ? `&waypoints=${wps.map(encode).join('|')}` : ''}&travelmode=driving`;
      setMapsUrls([url]);
      window.open(url, '_blank');
    }
  }

  async function generateAppleMapsUrl() {
    const active = stops.filter(s => !s.skipped);
    if (active.length === 0) { showToast('No active stops', 'error'); return; }
    const encode = (s: string) => encodeURIComponent(s);
    const addresses = active.map(s => [s.address, s.city, s.state].filter(Boolean).join(', '));
    const origin = config.startAddress || addresses[0];
    let url = `https://maps.apple.com/?saddr=${encode(origin)}`;
    for (const addr of addresses.slice(0, 4)) url += `&daddr=${encode(addr)}`;
    url += `&dirflg=d`;
    window.open(url, '_blank');
  }

  // ── Stop management ───────────────────────────────────────────────────────────
  function removeStop(id: number) {
    setStops(prev => {
      const next = prev.filter(s => s.id !== id);
      if (savedRouteId) fetch(`/api/routes/${savedRouteId}/stops/${id}`, { method: 'DELETE' }).catch(() => {});
      return next.map((s, i) => ({ ...s, stopOrder: i + 1 }));
    });
  }

  async function toggleSkip(id: number, skipped: boolean) {
    setStops(prev => prev.map(s => s.id === id ? { ...s, skipped } : s));
    if (savedRouteId) {
      await fetch(`/api/routes/${savedRouteId}/stops/${id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skipped }),
      }).catch(() => {});
    }
  }

  function moveStop(id: number, dir: 'up' | 'down') {
    setStops(prev => {
      const idx = prev.findIndex(s => s.id === id);
      if (idx < 0) return prev;
      const next = [...prev];
      const swapIdx = dir === 'up' ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= next.length) return prev;
      [next[idx], next[swapIdx]] = [next[swapIdx], next[idx]];
      return next.map((s, i) => ({ ...s, stopOrder: i + 1 }));
    });
  }

  function onVisitSaved(stopId: number) {
    setStops(prev => prev.map(s => s.id === stopId ? { ...s, visitCompleted: true } : s));
  }

  // ── Copy / Export ─────────────────────────────────────────────────────────────
  function copyRouteSummary() {
    const active = stops.filter(s => !s.skipped);
    const lines = [
      `Route: ${aiPlan?.routeName || 'Route'}`,
      aiPlan?.routeGoal ? `Goal: ${aiPlan.routeGoal}` : '',
      `Date: ${config.routeDate}  |  ${config.startTime} - ${config.endTime}`,
      routeStats.driveTime ? `Drive time: ${routeStats.driveTime}  |  Distance: ${routeStats.distance}` : '',
      '',
      ...active.map((s, i) => [
        `Stop ${i + 1}: ${s.businessName}`,
        `  Address: ${[s.address, s.city, s.state].filter(Boolean).join(', ')}`,
        s.phone ? `  Phone: ${s.phone}` : '',
        s.suggestedOffer ? `  Offer: ${s.suggestedOffer}` : '',
        s.recommendedPitch ? `  Pitch: ${s.recommendedPitch}` : '',
      ].filter(Boolean).join('\n')),
    ].filter(Boolean).join('\n');
    navigator.clipboard.writeText(lines).then(() => showToast('Copied to clipboard!', 'success'));
  }

  function exportCsv() {
    const headers = 'Stop,Business Name,Address,City,Phone,Website,Priority,Status,Industry,Suggested Offer,Pitch,Visit Reason,Est. Minutes';
    const rows = stops.filter(s => !s.skipped).map((s, i) =>
      [i + 1, s.businessName, s.address, s.city, s.phone, s.website, s.priority, s.leadStatus, s.industry, s.suggestedOffer, s.recommendedPitch, s.visitReason, s.estimatedVisitMinutes]
        .map(v => `"${String(v || '').replace(/"/g, '""')}"`).join(',')
    );
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `route-${config.routeDate}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  async function generateFollowUps() {
    if (!savedRouteId) { showToast('Save the route first', 'error'); return; }
    const res = await fetch(`/api/routes/${savedRouteId}/generate-followups`, { method: 'POST' });
    const data = await res.json();
    if (res.ok) showToast(`${data.created} follow-up task${data.created !== 1 ? 's' : ''} created!`, 'success');
    else showToast(data.error || 'Failed', 'error');
  }

  // ── Render ────────────────────────────────────────────────────────────────────
  const activeStops = stops.filter(s => !s.skipped);
  const completedStops = stops.filter(s => s.visitCompleted).length;

  return (
    <AppLayout title="Route Builder">
      <div className="space-y-4">

        {/* Tabs */}
        <div className="flex rounded-xl border border-gray-200 overflow-hidden w-fit">
          {([['build', 'Build Route', Route], ['route', `Route Plan${stops.length > 0 ? ` (${stops.length})` : ''}`, Navigation], ['history', 'Saved Routes', List]] as const).map(([t, l, Icon]) => (
            <button key={t} onClick={() => setTab(t as 'build' | 'route' | 'history')}
              className={`flex items-center gap-2 px-5 py-2.5 text-sm font-medium transition-colors ${tab === t ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
              <Icon size={15} />{l}
            </button>
          ))}
        </div>

        {/* ── BUILD TAB ────────────────────────────────────────────────────── */}
        {tab === 'build' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

            {/* Left: Filters + Config */}
            <div className="lg:col-span-1 space-y-4">

              {/* Route Config */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-3">
                <h3 className="font-semibold text-gray-800 text-sm flex items-center gap-2"><Navigation size={15} className="text-blue-500" />Route Configuration</h3>
                <div>
                  <label className={label}>Start Address</label>
                  <input className={inp} value={config.startAddress} onChange={e => setConfig(p => ({ ...p, startAddress: e.target.value }))} placeholder="123 Main St, Joplin, MO" />
                </div>
                <div>
                  <label className={label}>End Address (optional)</label>
                  <input className={inp} value={config.endAddress} onChange={e => setConfig(p => ({ ...p, endAddress: e.target.value }))} placeholder="Same as start if blank" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className={label}>Route Date</label>
                    <input type="date" className={inp} value={config.routeDate} onChange={e => setConfig(p => ({ ...p, routeDate: e.target.value }))} />
                  </div>
                  <div>
                    <label className={label}>Max Stops</label>
                    <select className={inp} value={config.maxStops} onChange={e => setConfig(p => ({ ...p, maxStops: Number(e.target.value) }))}>
                      {[5, 8, 10, 12, 15, 20].map(n => <option key={n} value={n}>{n} stops</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={label}>Start Time</label>
                    <input type="time" className={inp} value={config.startTime} onChange={e => setConfig(p => ({ ...p, startTime: e.target.value }))} />
                  </div>
                  <div>
                    <label className={label}>End Time</label>
                    <input type="time" className={inp} value={config.endTime} onChange={e => setConfig(p => ({ ...p, endTime: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <label className={label}>Travel Mode</label>
                  <select className={inp} value={config.travelMode} onChange={e => setConfig(p => ({ ...p, travelMode: e.target.value }))}>
                    {TRAVEL_MODES.map(m => <option key={m}>{m}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  {[['avoidTolls', 'Avoid tolls'], ['avoidHighways', 'Avoid highways'], ['includeLunchBreak', 'Include lunch break']] .map(([k, l2]) => (
                    <label key={k} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                      <input type="checkbox" checked={(config as Record<string, unknown>)[k] as boolean} onChange={e => setConfig(p => ({ ...p, [k]: e.target.checked }))} className="rounded" />
                      {l2}
                    </label>
                  ))}
                </div>
                <div>
                  <label className={label}>Route Goal</label>
                  <input className={inp} value={config.routeGoal} onChange={e => setConfig(p => ({ ...p, routeGoal: e.target.value }))} placeholder="e.g. Sign 2 new clients this week" />
                </div>
                <div>
                  <label className={label}>Notes</label>
                  <textarea className={`${inp} resize-none`} rows={2} value={config.notes} onChange={e => setConfig(p => ({ ...p, notes: e.target.value }))} placeholder="Any notes for this route..." />
                </div>
              </div>

              {/* Lead Filters */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-3">
                <button className="w-full flex items-center justify-between" onClick={() => setShowFilters(f => !f)}>
                  <h3 className="font-semibold text-gray-800 text-sm flex items-center gap-2"><Filter size={15} className="text-blue-500" />Lead Filters</h3>
                  {showFilters ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                </button>

                {showFilters && (
                  <div className="space-y-3">
                    {/* Quick filter buttons */}
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        ['hotOnly', 'Hot leads', 'bg-orange-100 text-orange-700'],
                        ['followUpDue', 'Follow-up due', 'bg-amber-100 text-amber-700'],
                        ['noWebsite', 'No website', 'bg-red-100 text-red-700'],
                        ['badWebsite', 'Bad website', 'bg-rose-100 text-rose-700'],
                        ['customersOnly', 'Customers', 'bg-green-100 text-green-700'],
                      ].map(([k, l2, cls]) => (
                        <button key={k} onClick={() => setFilters(p => ({ ...p, [k]: !(p as Record<string, unknown>)[k] }))}
                          className={`text-xs px-2.5 py-1 rounded-full font-medium border transition-colors ${(filters as Record<string, unknown>)[k] ? cls : 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                          {l2}
                        </button>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className={label}>City</label>
                        <input className={inp} value={filters.city} onChange={e => setFilters(p => ({ ...p, city: e.target.value }))} placeholder="Joplin" />
                      </div>
                      <div>
                        <label className={label}>State</label>
                        <input className={inp} value={filters.state} onChange={e => setFilters(p => ({ ...p, state: e.target.value }))} placeholder="MO" maxLength={2} />
                      </div>
                    </div>
                    <div>
                      <label className={label}>Lead Status</label>
                      <select className={inp} value={filters.status} onChange={e => setFilters(p => ({ ...p, status: e.target.value }))}>
                        <option value="">Any status</option>
                        {LEAD_STATUSES.map(s => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={label}>Priority</label>
                      <select className={inp} value={filters.priority} onChange={e => setFilters(p => ({ ...p, priority: e.target.value }))}>
                        <option value="">Any priority</option>
                        {PRIORITIES.map(p => <option key={p}>{p}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={label}>Industry</label>
                      <select className={inp} value={filters.industry} onChange={e => setFilters(p => ({ ...p, industry: e.target.value }))}>
                        <option value="">Any industry</option>
                        {INDUSTRIES.map(i => <option key={i}>{i}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={label}>Service Opportunity</label>
                      <select className={inp} value={filters.serviceOpportunity} onChange={e => setFilters(p => ({ ...p, serviceOpportunity: e.target.value }))}>
                        <option value="">Any</option>
                        {(SERVICE_OPPORTUNITIES || []).map((s: string) => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Lead Selection */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
                <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-800 text-sm">
                      Matching Leads
                      <span className="ml-2 text-xs text-gray-400 font-normal">{filteredLeads.length} leads</span>
                    </h3>
                    {selectedIds.size > 0 && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                        {selectedIds.size} selected
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        className="pl-7 pr-3 py-1.5 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-40"
                        placeholder="Search leads..."
                        value={leadSearch}
                        onChange={e => setLeadSearch(e.target.value)}
                      />
                    </div>
                    <button onClick={selectAll} className="text-xs text-blue-600 hover:underline">All</button>
                    <button onClick={clearSelection} className="text-xs text-gray-500 hover:underline">Clear</button>
                    <button onClick={fetchLeads} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded">
                      <RefreshCw size={14} />
                    </button>
                  </div>
                </div>

                {leadsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full" />
                  </div>
                ) : filteredLeads.length === 0 ? (
                  <p className="text-center text-gray-400 py-12 text-sm">No leads match your filters.</p>
                ) : (
                  <div className="divide-y divide-gray-50 max-h-[500px] overflow-y-auto">
                    {filteredLeads.map(lead => {
                      const hasAddress = !!(lead.address || lead.city);
                      const selected = selectedIds.has(lead.id);
                      return (
                        <div
                          key={lead.id}
                          onClick={() => toggleSelect(lead.id)}
                          className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-gray-50 transition-colors ${selected ? 'bg-blue-50' : ''}`}
                        >
                          <div className="shrink-0 text-blue-500">
                            {selected ? <CheckSquare size={16} /> : <Square size={16} className="text-gray-300" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-gray-800 truncate">{lead.businessName}</p>
                              <PriorityDot priority={lead.priority} />
                            </div>
                            <p className="text-xs text-gray-400 truncate">{lead.city}{lead.industry ? ` · ${lead.industry}` : ''} · {lead.leadStatus}</p>
                          </div>
                          {!hasAddress && (
                            <span title="No address" className="shrink-0 text-amber-400">
                              <AlertTriangle size={13} />
                            </span>
                          )}
                          {lead.priority === 'Hot' || lead.priority === 'Urgent' ? <Flame size={13} className="text-orange-500 shrink-0" /> : null}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Generate button */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-white text-sm">
                    {selectedIds.size > 0 ? `${selectedIds.size} leads selected` : `${filteredLeads.length} leads in filter`}
                  </p>
                  <p className="text-blue-200 text-xs mt-0.5">AI will score, prioritize, and build your visit plan</p>
                </div>
                <button onClick={buildRoute} disabled={buildLoading}
                  className="flex items-center gap-2 px-5 py-2.5 bg-white text-blue-700 rounded-lg text-sm font-semibold hover:bg-blue-50 disabled:opacity-60 whitespace-nowrap shrink-0">
                  {buildLoading
                    ? <><span className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full" />Building...</>
                    : <><Sparkles size={15} />Generate AI Route Plan</>}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── ROUTE TAB ────────────────────────────────────────────────────── */}
        {tab === 'route' && (
          <div className="space-y-4">
            {stops.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
                <Route size={40} className="text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No route generated yet.</p>
                <button onClick={() => setTab('build')} className="mt-3 text-sm text-blue-600 hover:underline">Go to Build tab</button>
              </div>
            ) : (
              <>
                {/* AI Summary card */}
                {aiPlan && (
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <Sparkles size={18} className="text-indigo-600 mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-indigo-800">{aiPlan.routeName}</p>
                        <p className="text-sm text-indigo-700 mt-1">{aiPlan.summary}</p>
                        {aiPlan.routeStrategy && <p className="text-xs text-indigo-600 mt-1.5 italic">{aiPlan.routeStrategy}</p>}
                      </div>
                    </div>
                  </div>
                )}

                {/* Route stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 text-center">
                    <p className="text-2xl font-bold text-gray-800">{activeStops.length}</p>
                    <p className="text-xs text-gray-500">Stops</p>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 text-center">
                    <p className="text-2xl font-bold text-gray-800">{completedStops}</p>
                    <p className="text-xs text-gray-500">Completed</p>
                  </div>
                  {routeStats.driveTime && (
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 text-center">
                      <p className="text-lg font-bold text-gray-800">{routeStats.driveTime}</p>
                      <p className="text-xs text-gray-500">Drive time</p>
                    </div>
                  )}
                  {routeStats.distance && (
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 text-center">
                      <p className="text-lg font-bold text-gray-800">{routeStats.distance}</p>
                      <p className="text-xs text-gray-500">Distance</p>
                    </div>
                  )}
                </div>

                {/* Warnings */}
                {leadsWithoutAddress.length > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-3">
                    <AlertTriangle size={16} className="text-amber-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-amber-800">Leads skipped — no address</p>
                      <p className="text-xs text-amber-700 mt-0.5">{leadsWithoutAddress.map(l => l.businessName).join(', ')}</p>
                    </div>
                  </div>
                )}

                {/* Action bar */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 flex flex-wrap gap-2">
                  <button onClick={optimizeRoute} disabled={optimizeLoading}
                    className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 disabled:opacity-60">
                    {optimizeLoading ? <span className="animate-spin w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full" /> : <ArrowUpDown size={13} />}
                    Optimize with Maps
                  </button>
                  <button onClick={generateMapsUrl}
                    className="flex items-center gap-1.5 px-3 py-2 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700">
                    <Map size={13} />Open Google Maps
                  </button>
                  <button onClick={generateAppleMapsUrl}
                    className="flex items-center gap-1.5 px-3 py-2 bg-gray-800 text-white rounded-lg text-xs font-medium hover:bg-gray-900">
                    <Navigation size={13} />Apple Maps
                  </button>
                  {mapsUrls.length > 1 && mapsUrls.slice(1).map((url, i) => (
                    <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-100">
                      <Map size={13} />Route Part {i + 2}
                    </a>
                  ))}
                  <div className="flex-1" />
                  <button onClick={copyRouteSummary}
                    className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-50">
                    <Copy size={13} />Copy Summary
                  </button>
                  <button onClick={exportCsv}
                    className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-50">
                    <Download size={13} />Export CSV
                  </button>
                  {savedRouteId && (
                    <button onClick={generateFollowUps}
                      className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-50">
                      <Plus size={13} />Generate Follow-ups
                    </button>
                  )}
                  <button onClick={saveRoute} disabled={saveLoading}
                    className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700 disabled:opacity-60">
                    {saveLoading ? <span className="animate-spin w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full" /> : <Save size={13} />}
                    {savedRouteId ? 'Saved' : 'Save Route'}
                  </button>
                </div>

                {/* Stop list */}
                <div className="space-y-3">
                  {stops.map((stop, i) => (
                    <StopCard
                      key={stop.id}
                      stop={stop}
                      index={i}
                      routeId={savedRouteId}
                      onRemove={removeStop}
                      onSkip={toggleSkip}
                      onMarkVisited={setVisitModalStop}
                      onMoveUp={(id) => moveStop(id, 'up')}
                      onMoveDown={(id) => moveStop(id, 'down')}
                      isFirst={i === 0}
                      isLast={i === stops.length - 1}
                    />
                  ))}
                </div>

                {/* Skipped leads section */}
                {aiPlan?.skippedLeads && aiPlan.skippedLeads.length > 0 && (
                  <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">AI Skipped These Leads</p>
                    <div className="space-y-1">
                      {aiPlan.skippedLeads.map((sl, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm">
                          <XCircle size={13} className="text-gray-400 mt-0.5 shrink-0" />
                          <span className="text-gray-700 font-medium">{sl.businessName}</span>
                          <span className="text-gray-400">— {sl.reason}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Follow-up plan */}
                {aiPlan?.followUpPlan && (
                  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">AI Follow-up Plan</p>
                    <p className="text-sm text-gray-700">{aiPlan.followUpPlan}</p>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ── HISTORY TAB ──────────────────────────────────────────────────── */}
        {tab === 'history' && (
          <div className="space-y-3">
            {historyLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full" />
              </div>
            ) : savedRoutes.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
                <Calendar size={40} className="text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No saved routes yet.</p>
                <button onClick={() => setTab('build')} className="mt-2 text-sm text-blue-600 hover:underline">Build your first route</button>
              </div>
            ) : (
              savedRoutes.map(r => {
                const statusColors: Record<string, string> = {
                  'Draft': 'bg-gray-100 text-gray-600',
                  'Generated': 'bg-blue-100 text-blue-700',
                  'Optimized': 'bg-indigo-100 text-indigo-700',
                  'In progress': 'bg-amber-100 text-amber-700',
                  'Completed': 'bg-green-100 text-green-700',
                  'Archived': 'bg-gray-100 text-gray-500',
                };
                return (
                  <div key={r.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-gray-800 text-sm">{r.name || `Route #${r.id}`}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[r.status] || 'bg-gray-100 text-gray-600'}`}>{r.status}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-400 flex-wrap">
                        {r.routeDate && <span className="flex items-center gap-1"><Calendar size={11} />{r.routeDate}</span>}
                        <span className="flex items-center gap-1"><MapPin size={11} />{r.totalStops} stops</span>
                        {r.city && <span>{r.city}, {r.state}</span>}
                        {r.estimatedDriveTime && <span className="flex items-center gap-1"><Clock size={11} />{r.estimatedDriveTime}</span>}
                      </div>
                      {r.aiSummary && <p className="text-xs text-gray-500 mt-1.5 line-clamp-2">{r.aiSummary}</p>}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {r.googleMapsUrl && (
                        <a href={r.googleMapsUrl} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs px-2.5 py-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 font-medium">
                          <Map size={12} />Maps
                        </a>
                      )}
                      <button onClick={async () => {
                        const res = await fetch(`/api/routes/${r.id}`);
                        const data = await res.json();
                        if (res.ok) {
                          setStops(data.stops || []);
                          setAiPlan({ summary: data.aiSummary, routeName: data.name, routeGoal: data.routeGoal, routeStrategy: '', followUpPlan: '', skippedLeads: [] });
                          setSavedRouteId(r.id);
                          setRouteStats({ driveTime: data.estimatedDriveTime, distance: data.estimatedRouteDistance });
                          setTab('route');
                        }
                      }} className="flex items-center gap-1 text-xs px-2.5 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 font-medium">
                        <Eye size={12} />View
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Visit Outcome Modal */}
      {visitModalStop && (
        <VisitOutcomeModal
          stop={visitModalStop}
          routeId={savedRouteId!}
          onClose={() => setVisitModalStop(null)}
          onSaved={onVisitSaved}
        />
      )}
    </AppLayout>
  );
}

export default function RouteBuilderPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-12"><div className="animate-spin w-7 h-7 border-2 border-blue-500 border-t-transparent rounded-full" /></div>}>
      <RouteBuilderContent />
    </Suspense>
  );
}
