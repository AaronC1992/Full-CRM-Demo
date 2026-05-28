'use client';
import { useState, useEffect, useCallback } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { showToast } from '@/components/ui/Toast';
import ServicePricingModal from '@/components/ui/ServicePricingModal';
import { Lead } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';
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
import ColumnEditor, { ColDef, ColState, mergeColState } from '@/components/ui/ColumnEditor';
import {
  UserCheck, Search, Phone, Mail, Globe, DollarSign,
  ExternalLink, Calendar, TrendingUp,
  ChevronUp, ChevronDown, Columns2, UserX, Wrench, LayoutGrid, List
} from 'lucide-react';

const CUSTOMERS_COLS_KEY = 'fullcrmdemo_customers_cols';
const CUSTOMERS_SIMPLE_VIEW_KEY = 'fullcrmdemo_customers_simple_view';

const ALL_CUSTOMERS_COLS: ColDef[] = [
  { key: 'contact', label: 'Contact' },
  { key: 'address', label: 'Address', sortKey: 'address' },
  { key: 'city', label: 'City', sortKey: 'city' },
  { key: 'state', label: 'State', sortKey: 'state' },
  { key: 'industry', label: 'Industry', sortKey: 'industry' },
  { key: 'services', label: 'Services' },
  { key: 'value', label: 'Value', sortKey: 'estimatedDealValue' },
  { key: 'wonDate', label: 'Won Date', sortKey: 'updatedDate' },
];

const DEFAULT_CUSTOMERS_COLS: ColState[] = [
  { key: 'contact', visible: true },
  { key: 'address', visible: false },
  { key: 'city', visible: true },
  { key: 'state', visible: false },
  { key: 'industry', visible: true },
  { key: 'services', visible: true },
  { key: 'value', visible: true },
  { key: 'wonDate', visible: true },
];

function getInitialCustomersCols(): ColState[] {
  if (typeof window === 'undefined') return DEFAULT_CUSTOMERS_COLS;
  try {
    const saved = localStorage.getItem(CUSTOMERS_COLS_KEY);
    return saved ? mergeColState(JSON.parse(saved), DEFAULT_CUSTOMERS_COLS) : DEFAULT_CUSTOMERS_COLS;
  } catch { return DEFAULT_CUSTOMERS_COLS; }
}

function getInitialSimpleView(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(CUSTOMERS_SIMPLE_VIEW_KEY) === '1';
  } catch {
    return false;
  }
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterIndustry, setFilterIndustry] = useState('');
  const [sort, setSort] = useState('updatedDate');
  const [dir, setDir] = useState<'asc' | 'desc'>('desc');
  const [colState, setColState] = useState<ColState[]>(getInitialCustomersCols);
  const [showColEditor, setShowColEditor] = useState(false);
  const [simpleView, setSimpleView] = useState(getInitialSimpleView);
  const [serviceMap, setServiceMap] = useState<ServicePricingMap>({});
  const [editingCustomer, setEditingCustomer] = useState<Lead | null>(null);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/leads?status=Won&dir=desc&sort=updatedDate');
    if (res.ok) setCustomers(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  useEffect(() => {
    try { localStorage.setItem(CUSTOMERS_COLS_KEY, JSON.stringify(colState)); } catch { /* ignore */ }
  }, [colState]);

  useEffect(() => {
    setServiceMap(loadServicePricingMap());
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(CUSTOMERS_SIMPLE_VIEW_KEY, simpleView ? '1' : '0');
    } catch {
      // Ignore preference storage issues.
    }
  }, [simpleView]);

  const updateCustomerServices = (leadId: number, items: ServiceLineItem[]) => {
    setServiceMap((current) => {
      const next = setServiceItems(current, leadId, items);
      saveServicePricingMap(next);
      return next;
    });
  };

  const getCustomerServices = (lead: Lead): ServiceLineItem[] => getServiceItems(serviceMap, lead.id);

  const industries = [...new Set(customers.map(c => c.industry).filter(Boolean))].sort();

  const filtered = customers.filter(c => {
    const q = search.toLowerCase();
    const matchSearch = !q || c.businessName.toLowerCase().includes(q) ||
      c.contactName?.toLowerCase().includes(q) ||
      c.city?.toLowerCase().includes(q) ||
      c.address?.toLowerCase().includes(q) ||
      c.state?.toLowerCase().includes(q) ||
      c.industry?.toLowerCase().includes(q);
    const matchIndustry = !filterIndustry || c.industry === filterIndustry;
    return matchSearch && matchIndustry;
  });

  const sorted = [...filtered].sort((a, b) => {
    let va: string | number = '';
    let vb: string | number = '';
    if (sort === 'estimatedDealValue') { va = a.estimatedDealValue || 0; vb = b.estimatedDealValue || 0; }
    else if (sort === 'updatedDate') { va = a.updatedDate || ''; vb = b.updatedDate || ''; }
    else if (sort === 'city') { va = a.city || ''; vb = b.city || ''; }
    else if (sort === 'state') { va = a.state || ''; vb = b.state || ''; }
    else if (sort === 'address') { va = a.address || ''; vb = b.address || ''; }
    else if (sort === 'industry') { va = a.industry || ''; vb = b.industry || ''; }
    else if (sort === 'businessName') { va = a.businessName || ''; vb = b.businessName || ''; }
    if (va < vb) return dir === 'asc' ? -1 : 1;
    if (va > vb) return dir === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (col: string) => {
    if (sort === col) setDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSort(col); setDir('asc'); }
  };

  const SortIcon = ({ col }: { col: string }) => {
    if (sort !== col) return null;
    return dir === 'asc' ? <ChevronUp size={13} /> : <ChevronDown size={13} />;
  };

  const totalValue = customers.reduce((sum, c) => sum + (c.estimatedDealValue || 0), 0);
  const thisMonth = new Date().toISOString().substring(0, 7);
  const wonThisMonth = customers.filter(c => c.updatedDate?.startsWith(thisMonth)).length;

  async function copyPhone(phone: string) {
    try { await navigator.clipboard.writeText(phone); showToast('Phone copied!', 'success'); }
    catch { showToast('Could not copy.', 'error'); }
  }

  return (
    <AppLayout title="Customers">
      <div className="space-y-5">

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500">
              <UserCheck size={18} className="text-white" />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-800">{customers.length}</p>
              <p className="text-xs text-gray-500">Total Customers</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500">
              <DollarSign size={18} className="text-white" />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-800">{formatCurrency(totalValue)}</p>
              <p className="text-xs text-gray-500">Total Revenue</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3 col-span-2 sm:col-span-1">
            <div className="p-2 rounded-lg bg-emerald-500">
              <TrendingUp size={18} className="text-white" />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-800">{wonThisMonth}</p>
              <p className="text-xs text-gray-500">Won this month</p>
            </div>
          </div>
        </div>

        {/* Search + Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-48">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Search customers..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          {industries.length > 0 && (
            <select
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filterIndustry}
              onChange={e => setFilterIndustry(e.target.value)}
            >
              <option value="">All Industries</option>
              {industries.map(i => <option key={i} value={i}>{i}</option>)}
            </select>
          )}
          <button
            onClick={() => setShowColEditor(true)}
            className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 bg-white hover:bg-gray-50 transition-colors"
          >
            <Columns2 size={15} />
            Columns
          </button>
          <button
            onClick={() => setSimpleView((current) => !current)}
            className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 bg-white hover:bg-gray-50 transition-colors"
          >
            {simpleView ? <List size={15} /> : <LayoutGrid size={15} />}
            {simpleView ? 'Table view' : 'Simple view'}
          </button>
        </div>

        {showColEditor && (
          <ColumnEditor
            allCols={ALL_CUSTOMERS_COLS}
            colState={colState}
            onChange={setColState}
            onClose={() => setShowColEditor(false)}
          />
        )}

        {loading && (
          <div className="flex justify-center py-16">
            <div className="animate-spin w-7 h-7 border-2 border-green-500 border-t-transparent rounded-full" />
          </div>
        )}

        {!loading && simpleView && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {sorted.length === 0 && (
              <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm py-10 text-center text-gray-500 text-sm">
                {customers.length === 0 ? 'No customers yet. Mark a lead as Won to see customers here.' : 'No customers match your search.'}
              </div>
            )}
            {sorted.map((customer) => {
              const services = getCustomerServices(customer);
              const summary = getServiceSummary(services);
              return (
                <div key={customer.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Link href={`/leads/${customer.id}`} className="font-semibold text-gray-800 hover:text-blue-600">
                        {customer.businessName}
                      </Link>
                      <p className="text-xs text-gray-500 mt-1">{customer.contactName || 'No contact'}{customer.phone ? ` • ${customer.phone}` : ''}</p>
                    </div>
                    <span className="rounded-full border border-green-200 bg-green-50 px-2 py-1 text-xs font-medium text-green-700">Won</span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-600">
                    <span className="rounded-full border border-gray-200 bg-gray-50 px-2 py-1">Value {formatCurrency(customer.estimatedDealValue || 0)}</span>
                    <span className="rounded-full border border-gray-200 bg-gray-50 px-2 py-1">Services {summary.count} {summary.count > 0 ? `• ${formatCurrency(summary.total)}` : ''}</span>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <button
                      onClick={() => setEditingCustomer(customer)}
                      className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                    >
                      <Wrench size={12} /> Services
                    </button>
                    <Link
                      href={`/leads/${customer.id}`}
                      className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
                    >
                      Open customer <ExternalLink size={11} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!loading && !simpleView && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                {(() => {
                  const visibleCols = ALL_CUSTOMERS_COLS.filter(c => colState.find(s => s.key === c.key)?.visible);
                  const colSpan = visibleCols.length + 2; // business + action
                  return (
                    <>
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                          <th
                            className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide cursor-pointer hover:text-gray-800"
                            onClick={() => handleSort('businessName')}
                          >
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
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {sorted.length === 0 && (
                          <tr>
                            <td colSpan={colSpan} className="text-center py-12 text-gray-400">
                              <UserX size={32} className="mx-auto mb-2 opacity-30" />
                              <p>{customers.length === 0 ? 'No customers yet. Mark a lead as Won to see them here.' : 'No customers match your search.'}</p>
                            </td>
                          </tr>
                        )}
                        {sorted.map(c => {
                          return (
                            <tr key={c.id} className="hover:bg-gray-50 transition-colors group">
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                                    <span className="text-green-700 text-xs font-bold">{c.businessName?.[0]?.toUpperCase()}</span>
                                  </div>
                                  <div>
                                    <Link href={`/leads/${c.id}`} className="font-medium text-gray-800 hover:text-blue-600 block leading-tight">
                                      {c.businessName}
                                    </Link>
                                    {c.website && (
                                      <a href={c.website.startsWith('http') ? c.website : `https://${c.website}`} target="_blank" rel="noopener noreferrer" className="text-xs text-gray-400 hover:text-blue-500 flex items-center gap-0.5">
                                        <Globe size={10} /> site
                                      </a>
                                    )}
                                  </div>
                                </div>
                              </td>
                              {visibleCols.map(col => {
                                let cell: React.ReactNode = '—';
                                if (col.key === 'contact') {
                                  cell = (
                                    <>
                                      <p className="text-gray-700 text-xs">{c.contactName || '—'}</p>
                                      <div className="flex flex-wrap gap-2 mt-0.5">
                                        {c.phone && (
                                          <button onClick={() => copyPhone(c.phone)} className="text-xs text-gray-400 hover:text-blue-500 flex items-center gap-0.5">
                                            <Phone size={10} /> {c.phone}
                                          </button>
                                        )}
                                        {c.email && (
                                          <a href={`mailto:${c.email}`} className="text-xs text-gray-400 hover:text-blue-500 flex items-center gap-0.5">
                                            <Mail size={10} /> email
                                          </a>
                                        )}
                                      </div>
                                    </>
                                  );
                                } else if (col.key === 'address') {
                                  cell = <span className="text-gray-600 text-xs">{c.address || '—'}</span>;
                                } else if (col.key === 'city') {
                                  cell = <span className="text-gray-600 text-xs">{c.city || '—'}</span>;
                                } else if (col.key === 'state') {
                                  cell = <span className="text-gray-600 text-xs">{c.state || '—'}</span>;
                                } else if (col.key === 'industry') {
                                  cell = <span className="text-gray-600 text-xs">{c.industry || '—'}</span>;
                                } else if (col.key === 'services') {
                                  const services = getCustomerServices(c);
                                  const summary = getServiceSummary(services);
                                  cell = (
                                    <div className="space-y-1">
                                      <p className="text-xs text-gray-600">{summary.count} service{summary.count === 1 ? '' : 's'}</p>
                                      <p className="text-xs font-medium text-gray-800">{summary.count > 0 ? formatCurrency(summary.total) : '—'}</p>
                                      <button
                                        onClick={() => setEditingCustomer(c)}
                                        className="text-xs text-blue-600 hover:underline"
                                      >
                                        Manage services
                                      </button>
                                    </div>
                                  );
                                } else if (col.key === 'value') {
                                  cell = <span className="text-gray-700 text-xs font-medium">{c.estimatedDealValue ? formatCurrency(c.estimatedDealValue) : '—'}</span>;
                                } else if (col.key === 'wonDate') {
                                  cell = c.updatedDate ? (
                                    <span className="flex items-center gap-1 text-xs text-gray-500">
                                      <Calendar size={11} />
                                      {formatDate(c.updatedDate.slice(0, 10))}
                                    </span>
                                  ) : '—';
                                }
                                return <td key={col.key} className="px-4 py-3">{cell}</td>;
                              })}
                              <td className="px-4 py-3">
                                <Link
                                  href={`/leads/${c.id}`}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-blue-600 font-medium hover:underline flex items-center gap-1 whitespace-nowrap"
                                >
                                  View <ExternalLink size={11} />
                                </Link>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </>
                  );
                })()}
              </table>
            </div>
          </div>
        )}

        <ServicePricingModal
          open={Boolean(editingCustomer)}
          onClose={() => setEditingCustomer(null)}
          title={editingCustomer ? `Service pricing for ${editingCustomer.businessName}` : 'Service pricing'}
          initialItems={editingCustomer ? (() => {
            const saved = getCustomerServices(editingCustomer);
            if (saved.length > 0) return saved;
            return buildSeedServices({
              serviceOpportunity: editingCustomer.serviceOpportunity,
              suggestedOffer: editingCustomer.suggestedOffer,
            });
          })() : []}
          onSave={(items) => {
            if (!editingCustomer) return;
            updateCustomerServices(editingCustomer.id, items);
          }}
        />

      </div>
    </AppLayout>
  );
}
