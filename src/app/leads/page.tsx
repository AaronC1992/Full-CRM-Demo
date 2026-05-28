'use client';
import { useEffect, useState, useCallback, useRef } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { StatusBadge, PriorityBadge } from '@/components/ui/Badge';
import { AppUser, Lead } from '@/lib/types';
import { LEAD_CATEGORY_OPTIONS, getLeadCategory } from '@/lib/lead-category';
import { formatDate, formatCurrency, LEAD_STATUSES, PRIORITIES, INDUSTRIES } from '@/lib/utils';
import { showToast } from '@/components/ui/Toast';
import ServicePricingModal from '@/components/ui/ServicePricingModal';
import {
  buildSeedServices,
  getServiceItems,
  getServiceSummary,
  loadServicePricingMap,
  saveServicePricingMap,
  ServiceLineItem,
  ServicePricingMap,
  setServiceItems,
} from '@/lib/service-pricing';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { Suspense } from 'react';
import ColumnEditor, { ColDef, ColState, mergeColState } from '@/components/ui/ColumnEditor';
import {
  Search, Plus, ExternalLink, ChevronUp, ChevronDown,
  Phone, Globe, SlidersHorizontal, X, UserX, Navigation, CheckSquare, Square, UserCheck, Columns2, Wrench, List, LayoutGrid
} from 'lucide-react';

const LEADS_CACHE_KEY = 'fullcrmdemo_leads_cache';
const LEADS_COLS_KEY = 'fullcrmdemo_leads_cols';
const LEADS_SIMPLE_VIEW_KEY = 'fullcrmdemo_leads_simple_view';

const ALL_LEADS_COLS: ColDef[] = [
  { key: 'contact', label: 'Contact' },
  { key: 'owner', label: 'Owner' },
  { key: 'address', label: 'Address', sortKey: 'address' },
  { key: 'city', label: 'City', sortKey: 'city' },
  { key: 'state', label: 'State', sortKey: 'state' },
  { key: 'industry', label: 'Industry' },
  { key: 'services', label: 'Services' },
  { key: 'status', label: 'Status', sortKey: 'leadStatus' },
  { key: 'priority', label: 'Priority', sortKey: 'priority' },
  { key: 'value', label: 'Value', sortKey: 'estimatedDealValue' },
  { key: 'followUp', label: 'Follow Up', sortKey: 'nextFollowUpDate' },
];

const DEFAULT_LEADS_COLS: ColState[] = [
  { key: 'contact', visible: true },
  { key: 'owner', visible: true },
  { key: 'address', visible: false },
  { key: 'city', visible: true },
  { key: 'state', visible: false },
  { key: 'industry', visible: true },
  { key: 'services', visible: true },
  { key: 'status', visible: true },
  { key: 'priority', visible: true },
  { key: 'value', visible: true },
  { key: 'followUp', visible: true },
];

function getInitialLeads(): Lead[] {
  if (typeof window === 'undefined') return [];
  try {
    const c = sessionStorage.getItem(LEADS_CACHE_KEY);
    return c ? JSON.parse(c) : [];
  } catch { return []; }
}

function getInitialLeadsCols(): ColState[] {
  if (typeof window === 'undefined') return DEFAULT_LEADS_COLS;
  try {
    const saved = localStorage.getItem(LEADS_COLS_KEY);
    return saved ? mergeColState(JSON.parse(saved), DEFAULT_LEADS_COLS) : DEFAULT_LEADS_COLS;
  } catch { return DEFAULT_LEADS_COLS; }
}

function getInitialSimpleView(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(LEADS_SIMPLE_VIEW_KEY) === '1';
  } catch {
    return false;
  }
}

function LeadsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>(getInitialLeads);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [colState, setColState] = useState<ColState[]>(getInitialLeadsCols);
  const [showColEditor, setShowColEditor] = useState(false);
  const [simpleView, setSimpleView] = useState(getInitialSimpleView);
  const [serviceMap, setServiceMap] = useState<ServicePricingMap>({});
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const leadsRef = useRef<Lead[]>([]);
  leadsRef.current = leads;
  const [filterStatus, setFilterStatus] = useState(searchParams.get('status') || '');
  const [filterPriority, setFilterPriority] = useState(searchParams.get('priority') || '');
  const [filterIndustry, setFilterIndustry] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [sort, setSort] = useState('createdDate');
  const [dir, setDir] = useState<'asc' | 'desc'>('desc');
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [users, setUsers] = useState<AppUser[]>([]);

  // Keep local filter state in sync with URL query params.
  useEffect(() => {
    const statusParam = searchParams.get('status') || '';
    const priorityParam = searchParams.get('priority') || '';
    const industryParam = searchParams.get('industry') || '';
    const searchParam = searchParams.get('search') || '';

    setFilterStatus(statusParam);
    setFilterPriority(priorityParam);
    setFilterIndustry(industryParam);
    setSearchInput(searchParam);
    setSearch(searchParam);
  }, [searchParams]);

  // Save column state to localStorage
  useEffect(() => {
    try { localStorage.setItem(LEADS_COLS_KEY, JSON.stringify(colState)); } catch { /* ignore */ }
  }, [colState]);

  // Debounce search input → fetch
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  const displayedLeads = filterCategory ? leads.filter((lead) => getLeadCategory(lead) === filterCategory) : leads;

  const toggleSelect = (id: number) => setSelectedIds(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const toggleSelectAll = () => setSelectedIds(prev => prev.size === displayedLeads.length ? new Set() : new Set(displayedLeads.map(l => l.id)));
  const buildRouteUrl = `/routes?leads=${Array.from(selectedIds).join(',')}`;  

  const fetchLeads = useCallback(async () => {
    if (leadsRef.current.length === 0) setLoading(true);
    else setRefreshing(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (filterStatus) params.set('status', filterStatus);
    if (filterPriority) params.set('priority', filterPriority);
    if (filterIndustry) params.set('industry', filterIndustry);
    params.set('sort', sort);
    params.set('dir', dir);
    params.set('_ts', Date.now().toString());
    try {
      const res = await fetch(`/api/leads?${params}`, { cache: 'no-store' });
      const data = await res.json();
      const arr = Array.isArray(data) ? data : [];
      setLeads(arr);
      if (!search && !filterStatus && !filterPriority && !filterIndustry) {
        try { sessionStorage.setItem(LEADS_CACHE_KEY, JSON.stringify(arr)); } catch { /* ignore */ }
      }
    } catch {
      setLeads([]);
    }
    setLoading(false);
    setRefreshing(false);
  }, [search, filterStatus, filterPriority, filterIndustry, sort, dir]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  useEffect(() => {
    fetch('/api/users')
      .then((response) => response.ok ? response.json() : [])
      .then((data) => setUsers(Array.isArray(data) ? data : []))
      .catch(() => setUsers([]));
  }, []);

  useEffect(() => {
    setServiceMap(loadServicePricingMap());
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(LEADS_SIMPLE_VIEW_KEY, simpleView ? '1' : '0');
    } catch {
      // Ignore preference storage issues.
    }
  }, [simpleView]);

  const updateLeadServices = (leadId: number, items: ServiceLineItem[]) => {
    setServiceMap((current) => {
      const next = setServiceItems(current, leadId, items);
      saveServicePricingMap(next);
      return next;
    });
  };

  const getLeadServices = (lead: Lead): ServiceLineItem[] => getServiceItems(serviceMap, lead.id);

  const assignLead = async (leadId: number, assignedUserId: number | null) => {
    try {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignedUserId }),
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Failed to assign lead.', 'error');
        return;
      }

      setLeads((current) => current.map((lead) => (
        lead.id === leadId
          ? { ...lead, assignedUserId: assignedUserId ?? null }
          : lead
      )));
    } catch {
      showToast('Failed to assign lead.', 'error');
    }
  };

  const handleSort = (col: string) => {
    if (sort === col) setDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSort(col); setDir('asc'); }
  };

  const SortIcon = ({ col }: { col: string }) => {
    if (sort !== col) return null;
    return dir === 'asc' ? <ChevronUp size={13} /> : <ChevronDown size={13} />;
  };

  const clearFilters = () => {
    setSearchInput('');
    setSearch('');
    setFilterStatus('');
    setFilterPriority('');
    setFilterIndustry('');
    setFilterCategory('');
    router.replace('/leads');
  };

  const activeFilters = [search.trim(), filterStatus, filterPriority, filterIndustry, filterCategory].filter(Boolean).length;

  return (
    <AppLayout title="Leads">
      <div className="space-y-4">

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search leads..."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(s => !s)}
              className={`flex items-center gap-2 px-3 py-2.5 border rounded-lg text-sm font-medium transition-colors ${showFilters || activeFilters > 0 ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >
              <SlidersHorizontal size={16} />
              Filters
              {activeFilters > 0 && (
                <span className="bg-blue-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">{activeFilters}</span>
              )}
            </button>
            <button
              onClick={() => setShowColEditor(true)}
              className="flex items-center gap-2 px-3 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 bg-white hover:bg-gray-50 transition-colors"
            >
              <Columns2 size={16} />
              Columns
            </button>
            <button
              onClick={() => setSimpleView((current) => !current)}
              className="flex items-center gap-2 px-3 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 bg-white hover:bg-gray-50 transition-colors"
            >
              {simpleView ? <List size={16} /> : <LayoutGrid size={16} />}
              {simpleView ? 'Table view' : 'Simple view'}
            </button>
            <Link
              href="/leads/add"
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              <Plus size={16} />
              Add Lead
            </Link>
          </div>
        </div>

        {showColEditor && (
          <ColumnEditor
            allCols={ALL_LEADS_COLS}
            colState={colState}
            onChange={setColState}
            onClose={() => setShowColEditor(false)}
          />
        )}

        {/* Filters panel */}
        {showFilters && (
          <div className="bg-white border border-gray-200 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Status</label>
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Statuses</option>
                {LEAD_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Priority</label>
              <select
                value={filterPriority}
                onChange={e => setFilterPriority(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Priorities</option>
                {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Industry</label>
              <select
                value={filterIndustry}
                onChange={e => setFilterIndustry(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Industries</option>
                {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Category</label>
              <select
                value={filterCategory}
                onChange={e => setFilterCategory(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Categories</option>
                {LEAD_CATEGORY_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
            </div>
            {activeFilters > 0 && (
              <button onClick={clearFilters} className="text-xs text-red-500 flex items-center gap-1 hover:underline">
                <X size={12} /> Clear filters
              </button>
            )}
          </div>
        )}

        {/* Count + Route Builder */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <p className="text-sm text-gray-500 flex items-center gap-2">
            {loading ? 'Loading...' : (
              <>
                {refreshing && <span className="w-3 h-3 border border-blue-400 border-t-transparent rounded-full animate-spin inline-block" />}
                {`${displayedLeads.length} lead${displayedLeads.length !== 1 ? 's' : ''}`}
                {selectedIds.size > 0 && <span className="ml-2 text-blue-600 font-medium">{selectedIds.size} selected</span>}
              </>
            )}
          </p>
          <div className="flex items-center gap-2">
            {selectedIds.size > 0 && (
              <Link href={buildRouteUrl}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700">
                <Navigation size={13} />Build Route from Selected ({selectedIds.size})
              </Link>
            )}
            <Link href="/api/export/leads" className="text-xs text-blue-600 hover:underline font-medium">
              Export CSV
            </Link>
          </div>
        </div>

        {activeFilters > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center justify-between gap-3">
            <p className="text-sm text-amber-900">
              You are viewing filtered leads
              {filterStatus ? ` • Status: ${filterStatus}` : ''}
              {filterPriority ? ` • Priority: ${filterPriority}` : ''}
              {filterIndustry ? ` • Industry: ${filterIndustry}` : ''}
              {filterCategory ? ` • Category: ${filterCategory}` : ''}
              {search.trim() ? ` • Search: "${search.trim()}"` : ''}
            </p>
            <button
              onClick={clearFilters}
              className="text-xs font-semibold text-amber-900 underline whitespace-nowrap"
            >
              Show all leads
            </button>
          </div>
        )}

        {simpleView ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {displayedLeads.length === 0 && (
              <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm py-10 text-center text-gray-500 text-sm">
                No leads found. Add a lead to get started.
              </div>
            )}
            {displayedLeads.map((lead) => {
              const services = getLeadServices(lead);
              const summary = getServiceSummary(services);
              const category = getLeadCategory(lead);
              return (
                <div key={lead.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Link href={`/leads/${lead.id}`} className="font-semibold text-gray-800 hover:text-blue-600">
                        {lead.businessName}
                      </Link>
                      <p className="text-xs text-gray-500 mt-1">{lead.contactName || 'No contact'}{lead.phone ? ` • ${lead.phone}` : ''}</p>
                    </div>
                    <StatusBadge status={lead.leadStatus} size="sm" />
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                    <PriorityBadge priority={lead.priority} size="sm" />
                    {category && (
                      <span className="rounded-full border border-gray-200 bg-gray-50 px-2 py-1 text-gray-600">
                        {category}
                      </span>
                    )}
                    <span className="rounded-full border border-gray-200 bg-gray-50 px-2 py-1 text-gray-600">
                      Value {formatCurrency(lead.estimatedDealValue || 0)}
                    </span>
                    <span className="rounded-full border border-gray-200 bg-gray-50 px-2 py-1 text-gray-600">
                      Services {summary.count} {summary.count > 0 ? `• ${formatCurrency(summary.total)}` : ''}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <button
                      onClick={() => setEditingLead(lead)}
                      className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                    >
                      <Wrench size={12} /> Services
                    </button>
                    <Link
                      href={`/leads/${lead.id}`}
                      className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
                    >
                      Open lead <ExternalLink size={11} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              {(() => {
                const visibleCols = ALL_LEADS_COLS.filter(c => colState.find(s => s.key === c.key)?.visible);
                const colSpan = visibleCols.length + 4; // checkbox + business + 2 actions
                return (
                  <>
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100">
                        <th className="px-4 py-3 w-8">
                          <button onClick={toggleSelectAll} className="text-gray-400 hover:text-blue-600">
                            {selectedIds.size === leads.length && leads.length > 0 ? <CheckSquare size={15} className="text-blue-600" /> : <Square size={15} />}
                          </button>
                        </th>
                        <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide cursor-pointer hover:text-gray-800" onClick={() => handleSort('businessName')}>
                          <span className="flex items-center gap-1">Business <SortIcon col="businessName" /></span>
                        </th>
                        {visibleCols.map(col => (
                          <th
                            key={col.key}
                            className={`text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide whitespace-nowrap ${col.sortKey ? 'cursor-pointer hover:text-gray-800' : ''}`}
                            onClick={col.sortKey ? () => handleSort(col.sortKey!) : undefined}
                          >
                            {col.sortKey ? (
                              <span className="flex items-center gap-1">{col.label} <SortIcon col={col.sortKey} /></span>
                            ) : col.label}
                          </th>
                        ))}
                        <th className="px-4 py-3"></th>
                        <th className="px-4 py-3"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {loading && (
                        <tr>
                          <td colSpan={colSpan} className="text-center py-10 text-gray-400">
                            <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto" />
                          </td>
                        </tr>
                      )}
                      {!loading && displayedLeads.length === 0 && (
                        <tr>
                          <td colSpan={colSpan} className="text-center py-12 text-gray-400">
                            <UserX size={32} className="mx-auto mb-2 opacity-30" />
                            <p>No leads found.</p>
                            <Link href="/leads/add" className="text-blue-500 text-sm hover:underline mt-1 inline-block">
                              Add your first lead →
                            </Link>
                          </td>
                        </tr>
                      )}
                      {displayedLeads.map(lead => (
                        <tr key={lead.id} className={`hover:bg-gray-50 transition-colors group ${selectedIds.has(lead.id) ? 'bg-blue-50/50' : ''}`}>
                          <td className="px-4 py-3">
                            <button onClick={() => toggleSelect(lead.id)} className="text-gray-400 hover:text-blue-600">
                              {selectedIds.has(lead.id) ? <CheckSquare size={15} className="text-blue-600" /> : <Square size={15} />}
                            </button>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                                <span className="text-blue-700 text-xs font-bold">{lead.businessName?.[0]?.toUpperCase()}</span>
                              </div>
                              <div>
                                <Link href={`/leads/${lead.id}`} className="font-medium text-gray-800 hover:text-blue-600 block leading-tight">
                                  {lead.businessName}
                                </Link>
                                {lead.website && (
                                  <a href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`} target="_blank" rel="noopener noreferrer" className="text-xs text-gray-400 hover:text-blue-500 flex items-center gap-0.5">
                                    <Globe size={10} /> site
                                  </a>
                                )}
                                {lead.notes && (
                                  <p className="text-xs text-gray-400 mt-0.5 max-w-[180px] truncate" title={lead.notes}>
                                    {lead.notes.length > 60 ? lead.notes.slice(0, 60) + '\u2026' : lead.notes}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>
                          {visibleCols.map(col => {
                            let cell: React.ReactNode = '—';
                            if (col.key === 'contact') {
                              cell = (
                                <>
                                  <p className="text-gray-700 text-xs">{lead.contactName || '—'}</p>
                                  {lead.phone && (
                                    <a href={`tel:${lead.phone}`} className="text-xs text-gray-400 hover:text-blue-500 flex items-center gap-0.5">
                                      <Phone size={10} /> {lead.phone}
                                    </a>
                                  )}
                                </>
                              );
                            } else if (col.key === 'address') {
                              cell = <span className="text-gray-600 text-xs">{lead.address || '—'}</span>;
                            } else if (col.key === 'owner') {
                              cell = (
                                <select
                                  value={lead.assignedUserId ?? ''}
                                  onChange={(event) => {
                                    const value = event.target.value;
                                    assignLead(lead.id, value ? Number(value) : null);
                                  }}
                                  className="border border-gray-200 rounded-md px-2 py-1 text-xs bg-white"
                                >
                                  <option value="">Unassigned</option>
                                  {users.filter((user) => user.active).map((user) => (
                                    <option key={user.id} value={user.id}>{user.fullName}</option>
                                  ))}
                                </select>
                              );
                            } else if (col.key === 'city') {
                              cell = <span className="text-gray-600 text-xs">{lead.city || '—'}</span>;
                            } else if (col.key === 'state') {
                              cell = <span className="text-gray-600 text-xs">{lead.state || '—'}</span>;
                            } else if (col.key === 'industry') {
                              cell = <div className="space-y-1"><span className="text-gray-600 text-xs block">{lead.industry || '—'}</span>{getLeadCategory(lead) ? <span className="text-xs text-gray-400">{getLeadCategory(lead)}</span> : null}</div>;
                            } else if (col.key === 'services') {
                              const services = getLeadServices(lead);
                              const summary = getServiceSummary(services);
                              cell = (
                                <div className="space-y-1">
                                  <p className="text-xs text-gray-600">{summary.count} service{summary.count === 1 ? '' : 's'}</p>
                                  <p className="text-xs font-medium text-gray-800">{summary.count > 0 ? formatCurrency(summary.total) : '—'}</p>
                                  <button
                                    onClick={() => setEditingLead(lead)}
                                    className="text-xs text-blue-600 hover:underline"
                                  >
                                    Manage services
                                  </button>
                                </div>
                              );
                            } else if (col.key === 'status') {
                              cell = (
                                <>
                                  <StatusBadge status={lead.leadStatus} size="sm" />
                                  {lead.leadStatus === 'Won' && (
                                    <Link href="/customers" className="flex items-center gap-0.5 mt-1 text-xs text-green-600 hover:text-green-700 font-medium">
                                      <UserCheck size={10} /> Customer
                                    </Link>
                                  )}
                                </>
                              );
                            } else if (col.key === 'priority') {
                              cell = <PriorityBadge priority={lead.priority} size="sm" />;
                            } else if (col.key === 'value') {
                              cell = <span className="text-gray-600 text-xs font-medium">{lead.estimatedDealValue ? formatCurrency(lead.estimatedDealValue) : '—'}</span>;
                            } else if (col.key === 'followUp') {
                              cell = lead.nextFollowUpDate ? (
                                <span className={`text-xs ${new Date(lead.nextFollowUpDate) < new Date() ? 'text-red-500 font-medium' : 'text-gray-500'}`}>
                                  {formatDate(lead.nextFollowUpDate)}
                                </span>
                              ) : '—';
                            }
                            return <td key={col.key} className="px-4 py-3">{cell}</td>;
                          })}
                          <td className="px-4 py-3">
                            <Link
                              href={`/leads/${lead.id}`}
                              className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-blue-600 font-medium hover:underline flex items-center gap-1 whitespace-nowrap"
                            >
                              View <ExternalLink size={11} />
                            </Link>
                          </td>
                          <td className="px-4 py-3">
                            <Link
                              href={`/routes?leads=${lead.id}`}
                              className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-gray-500 hover:text-blue-600 flex items-center gap-0.5 whitespace-nowrap"
                              title="Add to route"
                            >
                              <Navigation size={11} />
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </>
                );
              })()}
            </table>
          </div>
        </div>
        )}

        <ServicePricingModal
          open={Boolean(editingLead)}
          onClose={() => setEditingLead(null)}
          title={editingLead ? `Service pricing for ${editingLead.businessName}` : 'Service pricing'}
          initialItems={editingLead ? (() => {
            const saved = getLeadServices(editingLead);
            if (saved.length > 0) return saved;
            return buildSeedServices({
              serviceOpportunity: editingLead.serviceOpportunity,
              suggestedOffer: editingLead.suggestedOffer,
            });
          })() : []}
          onSave={(items) => {
            if (!editingLead) return;
            updateLeadServices(editingLead.id, items);
          }}
        />

      </div>
    </AppLayout>
  );
}

export default function LeadsPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-12"><div className="animate-spin w-7 h-7 border-2 border-blue-500 border-t-transparent rounded-full" /></div>}>
      <LeadsContent />
    </Suspense>
  );
}
