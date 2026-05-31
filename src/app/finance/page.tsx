'use client';

import { useEffect, useMemo, useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import ModuleGate from '@/components/demo/ModuleGate';
import { useDemoMode } from '@/components/demo/DemoModeProvider';
import { Calculator, ClipboardCheck, Receipt, Wallet } from 'lucide-react';

type CostingRow = {
  id: string;
  job: string;
  labor: number;
  materials: number;
  overhead: number;
  revenue: number;
};

type ExpenseRow = {
  id: string;
  date: string;
  vendor: string;
  category: string;
  amount: number;
  jobRef: string;
  status: 'Submitted' | 'Approved' | 'Paid';
};

type ReconcileRow = {
  id: string;
  source: 'Payment gateway' | 'Bank feed' | 'Accounting ledger';
  reference: string;
  amount: number;
  status: 'Unmatched' | 'Matched' | 'Exception';
};

const STORAGE_KEY = 'fullcrmdemo_finance_ops_v1';

const DEFAULT_COSTING: CostingRow[] = [
  { id: 'C1001', job: 'Northside onboarding', labor: 2200, materials: 450, overhead: 600, revenue: 5200 },
  { id: 'C1002', job: 'Maple workflow rollout', labor: 2900, materials: 650, overhead: 900, revenue: 6900 },
  { id: 'C1003', job: 'Cedar reporting setup', labor: 1400, materials: 300, overhead: 420, revenue: 3500 },
];

const DEFAULT_EXPENSES: ExpenseRow[] = [
  { id: 'E1001', date: '2026-05-29', vendor: 'Velocity Print', category: 'Print', amount: 220, jobRef: 'Northside onboarding', status: 'Approved' },
  { id: 'E1002', date: '2026-05-30', vendor: 'Field Fuel', category: 'Travel', amount: 148, jobRef: 'Maple workflow rollout', status: 'Submitted' },
  { id: 'E1003', date: '2026-05-31', vendor: 'Ops Supply Co', category: 'Supplies', amount: 96, jobRef: 'Cedar reporting setup', status: 'Paid' },
];

const DEFAULT_RECON: ReconcileRow[] = [
  { id: 'R1001', source: 'Payment gateway', reference: 'pay_88210', amount: 1200, status: 'Matched' },
  { id: 'R1002', source: 'Bank feed', reference: 'dep_22019', amount: 1200, status: 'Matched' },
  { id: 'R1003', source: 'Accounting ledger', reference: 'inv_3308', amount: 1200, status: 'Unmatched' },
  { id: 'R1004', source: 'Payment gateway', reference: 'pay_88211', amount: 980, status: 'Exception' },
];

type FinanceState = {
  costing: CostingRow[];
  expenses: ExpenseRow[];
  recon: ReconcileRow[];
};

const DEFAULT_STATE: FinanceState = {
  costing: DEFAULT_COSTING,
  expenses: DEFAULT_EXPENSES,
  recon: DEFAULT_RECON,
};

function loadState() {
  if (typeof window === 'undefined') return DEFAULT_STATE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw) as FinanceState;
    if (!parsed || !Array.isArray(parsed.costing) || !Array.isArray(parsed.expenses) || !Array.isArray(parsed.recon)) return DEFAULT_STATE;
    return parsed;
  } catch {
    return DEFAULT_STATE;
  }
}

function formatMoney(value: number) {
  return `$${value.toLocaleString()}`;
}

export default function FinancePage() {
  const { enabledModules } = useDemoMode();
  const [state, setState] = useState<FinanceState>(DEFAULT_STATE);
  const [expenseForm, setExpenseForm] = useState({ date: '2026-06-01', vendor: '', category: 'Travel', amount: '0', jobRef: '' });

  useEffect(() => {
    setState(loadState());
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const totals = useMemo(() => {
    const revenue = state.costing.reduce((sum, row) => sum + row.revenue, 0);
    const cost = state.costing.reduce((sum, row) => sum + row.labor + row.materials + row.overhead, 0);
    const margin = revenue === 0 ? 0 : Math.round(((revenue - cost) / revenue) * 100);
    const expenses = state.expenses.reduce((sum, row) => sum + row.amount, 0);
    const unmatched = state.recon.filter((row) => row.status === 'Unmatched' || row.status === 'Exception').length;
    return { revenue, cost, margin, expenses, unmatched };
  }, [state]);

  if (!enabledModules['job-costing'] && !enabledModules['expense-tracking'] && !enabledModules['payments-reconciliation']) {
    return (
      <AppLayout title="Finance Ops">
        <ModuleGate title="Finance Ops" description="Enable Job costing in Feature Builder to show this module." />
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Finance Ops">
      <div className="space-y-5">
        <div className="grid sm:grid-cols-4 gap-3">
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-gray-500">Revenue</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{formatMoney(totals.revenue)}</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-gray-500">Total cost</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{formatMoney(totals.cost)}</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-gray-500">Margin</p>
            <p className="text-2xl font-bold text-green-600 mt-1">{totals.margin}%</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-gray-500">Unmatched entries</p>
            <p className="text-2xl font-bold text-red-600 mt-1">{totals.unmatched}</p>
          </div>
        </div>

        <section className="bg-white border border-gray-100 rounded-xl shadow-sm p-4">
          <div className="flex items-center gap-2">
            <Calculator size={16} className="text-blue-500" />
            <h2 className="font-semibold text-gray-800">Job costing and analysis</h2>
          </div>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-3 py-2 text-xs uppercase tracking-wide text-gray-500">Job</th>
                  <th className="text-left px-3 py-2 text-xs uppercase tracking-wide text-gray-500">Labor</th>
                  <th className="text-left px-3 py-2 text-xs uppercase tracking-wide text-gray-500">Materials</th>
                  <th className="text-left px-3 py-2 text-xs uppercase tracking-wide text-gray-500">Overhead</th>
                  <th className="text-left px-3 py-2 text-xs uppercase tracking-wide text-gray-500">Revenue</th>
                  <th className="text-left px-3 py-2 text-xs uppercase tracking-wide text-gray-500">Margin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {state.costing.map((row) => {
                  const cost = row.labor + row.materials + row.overhead;
                  const margin = row.revenue === 0 ? 0 : Math.round(((row.revenue - cost) / row.revenue) * 100);
                  return (
                    <tr key={row.id}>
                      <td className="px-3 py-3 text-gray-800 font-medium">{row.job}</td>
                      <td className="px-3 py-3 text-gray-700">{formatMoney(row.labor)}</td>
                      <td className="px-3 py-3 text-gray-700">{formatMoney(row.materials)}</td>
                      <td className="px-3 py-3 text-gray-700">{formatMoney(row.overhead)}</td>
                      <td className="px-3 py-3 text-gray-900 font-semibold">{formatMoney(row.revenue)}</td>
                      <td className="px-3 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full border ${margin >= 35 ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>{margin}%</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <div className="grid lg:grid-cols-2 gap-4">
          <section className="bg-white border border-gray-100 rounded-xl shadow-sm p-4">
            <div className="flex items-center gap-2">
              <Receipt size={16} className="text-indigo-500" />
              <h2 className="font-semibold text-gray-800">Expense tracking</h2>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
              <input className="border border-gray-200 rounded-lg px-3 py-2" type="date" value={expenseForm.date} onChange={(event) => setExpenseForm((current) => ({ ...current, date: event.target.value }))} />
              <input className="border border-gray-200 rounded-lg px-3 py-2" placeholder="Vendor" value={expenseForm.vendor} onChange={(event) => setExpenseForm((current) => ({ ...current, vendor: event.target.value }))} />
              <input className="border border-gray-200 rounded-lg px-3 py-2" placeholder="Category" value={expenseForm.category} onChange={(event) => setExpenseForm((current) => ({ ...current, category: event.target.value }))} />
              <input className="border border-gray-200 rounded-lg px-3 py-2" type="number" placeholder="Amount" value={expenseForm.amount} onChange={(event) => setExpenseForm((current) => ({ ...current, amount: event.target.value }))} />
              <input className="col-span-2 border border-gray-200 rounded-lg px-3 py-2" placeholder="Job reference" value={expenseForm.jobRef} onChange={(event) => setExpenseForm((current) => ({ ...current, jobRef: event.target.value }))} />
              <button
                type="button"
                className="col-span-2 bg-blue-600 text-white rounded-lg py-2 font-medium hover:bg-blue-700"
                onClick={() => {
                  if (!expenseForm.vendor.trim()) return;
                  const row: ExpenseRow = {
                    id: `E${Date.now().toString().slice(-4)}`,
                    date: expenseForm.date,
                    vendor: expenseForm.vendor.trim(),
                    category: expenseForm.category.trim() || 'General',
                    amount: Number(expenseForm.amount || '0'),
                    jobRef: expenseForm.jobRef.trim() || 'General ops',
                    status: 'Submitted',
                  };
                  setState((current) => ({ ...current, expenses: [row, ...current.expenses] }));
                  setExpenseForm({ date: expenseForm.date, vendor: '', category: expenseForm.category, amount: '0', jobRef: '' });
                }}
              >
                Add expense
              </button>
            </div>
            <div className="mt-3 space-y-2 max-h-56 overflow-y-auto">
              {state.expenses.map((row) => (
                <div key={row.id} className="border border-gray-200 rounded-lg px-3 py-2 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium text-gray-800">{row.vendor}</p>
                    <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">{row.status}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{row.date} | {row.category} | {row.jobRef}</p>
                  <p className="text-sm font-semibold text-gray-900 mt-1">{formatMoney(row.amount)}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white border border-gray-100 rounded-xl shadow-sm p-4">
            <div className="flex items-center gap-2">
              <ClipboardCheck size={16} className="text-emerald-500" />
              <h2 className="font-semibold text-gray-800">Payments and reconciliation</h2>
            </div>
            <p className="text-sm text-gray-500 mt-2">Mock feed that matches payment gateway, bank feed, and accounting ledger transactions.</p>
            <div className="mt-3 space-y-2">
              {state.recon.map((row) => (
                <div key={row.id} className="border border-gray-200 rounded-lg px-3 py-2 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium text-gray-800">{row.reference}</p>
                    <span className={`text-xs px-2 py-1 rounded-full border ${row.status === 'Matched' ? 'bg-green-50 text-green-700 border-green-200' : row.status === 'Exception' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>{row.status}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{row.source}</p>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-sm font-semibold text-gray-900">{formatMoney(row.amount)}</p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="text-xs px-2 py-1 rounded-lg border border-green-200 bg-green-50 text-green-700"
                        onClick={() => setState((current) => ({
                          ...current,
                          recon: current.recon.map((item) => (item.id === row.id ? { ...item, status: 'Matched' } : item)),
                        }))}
                      >
                        Match
                      </button>
                      <button
                        type="button"
                        className="text-xs px-2 py-1 rounded-lg border border-red-200 bg-red-50 text-red-700"
                        onClick={() => setState((current) => ({
                          ...current,
                          recon: current.recon.map((item) => (item.id === row.id ? { ...item, status: 'Exception' } : item)),
                        }))}
                      >
                        Flag
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 rounded-lg bg-gray-50 border border-gray-200 p-3 text-sm text-gray-700">
              <div className="flex items-center gap-2">
                <Wallet size={15} className="text-blue-500" />
                Reconciliation summary: {state.recon.filter((row) => row.status === 'Matched').length} matched, {totals.unmatched} need review.
              </div>
            </div>
          </section>
        </div>
      </div>
    </AppLayout>
  );
}
