'use client';
import { useState, useEffect, useCallback } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { showToast } from '@/components/ui/Toast';
import { Lead } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import Link from 'next/link';
import {
  UserCheck, Search, Phone, Mail, Globe, DollarSign,
  ExternalLink, Calendar, Package, StickyNote, TrendingUp
} from 'lucide-react';

function ServiceTag({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-full px-2.5 py-0.5 text-xs font-medium">
      <Package size={10} />
      {label}
    </span>
  );
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterIndustry, setFilterIndustry] = useState('');

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/leads?status=Won&dir=desc&sort=updatedDate');
    if (res.ok) setCustomers(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  const industries = [...new Set(customers.map(c => c.industry).filter(Boolean))].sort();

  const filtered = customers.filter(c => {
    const q = search.toLowerCase();
    const matchSearch = !q || c.businessName.toLowerCase().includes(q) ||
      c.contactName?.toLowerCase().includes(q) ||
      c.city?.toLowerCase().includes(q) ||
      c.industry?.toLowerCase().includes(q);
    const matchIndustry = !filterIndustry || c.industry === filterIndustry;
    return matchSearch && matchIndustry;
  });

  const totalValue = customers.reduce((sum, c) => sum + (c.estimatedDealValue || 0), 0);
  const thisMonth = new Date().toISOString().substring(0, 7);
  const wonThisMonth = customers.filter(c => c.updatedDate?.startsWith(thisMonth)).length;

  function getServices(c: Lead): string[] {
    const s: string[] = [];
    if (c.marketingPackageInterest) s.push(c.marketingPackageInterest);
    if (c.websitePackageInterest) s.push(c.websitePackageInterest);
    if (c.crmPackageInterest) s.push(c.crmPackageInterest);
    if (!s.length && c.serviceOpportunity) s.push(c.serviceOpportunity);
    return s;
  }

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
        </div>

        {loading && (
          <div className="flex justify-center py-16">
            <div className="animate-spin w-7 h-7 border-2 border-green-500 border-t-transparent rounded-full" />
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-20">
            <UserCheck size={40} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 font-medium">
              {customers.length === 0 ? 'No customers yet. Mark a lead as Won to see them here.' : 'No customers match your search.'}
            </p>
          </div>
        )}

        {/* Customer Cards */}
        {!loading && filtered.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map(c => {
              const services = getServices(c);
              return (
                <div key={c.id} className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col">
                  {/* Header */}
                  <div className="px-5 py-4 border-b border-gray-50">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-800 truncate">{c.businessName}</p>
                        <div className="flex items-center gap-2 flex-wrap mt-0.5">
                          {c.industry && (
                            <span className="text-xs text-gray-500">{c.industry}</span>
                          )}
                          {c.city && (
                            <span className="text-xs text-gray-400">{c.city}{c.state ? `, ${c.state}` : ''}</span>
                          )}
                        </div>
                      </div>
                      {c.estimatedDealValue ? (
                        <span className="shrink-0 text-green-700 font-bold text-sm bg-green-50 border border-green-100 rounded-lg px-2 py-1">
                          {formatCurrency(c.estimatedDealValue)}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  {/* Body */}
                  <div className="px-5 py-3 flex-1 space-y-2.5">
                    {/* Contact */}
                    {(c.contactName || c.phone || c.email) && (
                      <div className="space-y-1.5">
                        {c.contactName && (
                          <p className="text-sm font-medium text-gray-700">{c.contactName}</p>
                        )}
                        <div className="flex flex-wrap gap-2">
                          {c.phone && (
                            <button
                              onClick={() => copyPhone(c.phone)}
                              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-blue-600 transition-colors"
                            >
                              <Phone size={11} />
                              {c.phone}
                            </button>
                          )}
                          {c.email && (
                            <a
                              href={`mailto:${c.email}`}
                              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-blue-600 transition-colors"
                            >
                              <Mail size={11} />
                              {c.email}
                            </a>
                          )}
                          {c.website && (
                            <a
                              href={c.website.startsWith('http') ? c.website : `https://${c.website}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-blue-600 transition-colors"
                            >
                              <Globe size={11} />
                              Website
                            </a>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Services */}
                    {services.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {services.map(s => <ServiceTag key={s} label={s} />)}
                      </div>
                    )}

                    {/* Notes preview */}
                    {c.notes && (
                      <div className="flex items-start gap-1.5">
                        <StickyNote size={11} className="text-gray-300 mt-0.5 shrink-0" />
                        <p className="text-xs text-gray-400 line-clamp-2">{c.notes}</p>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="px-5 py-3 border-t border-gray-50 flex items-center justify-between">
                    {c.updatedDate && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-400">
                        <Calendar size={11} />
                        Won {formatDate(c.updatedDate.slice(0, 10))}
                      </div>
                    )}
                    <Link
                      href={`/leads/${c.id}`}
                      className="ml-auto flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      View details
                      <ExternalLink size={11} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </AppLayout>
  );
}
