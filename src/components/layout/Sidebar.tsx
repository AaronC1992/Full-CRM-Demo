'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Users, Handshake,
  CheckSquare, Settings, Sparkles,
  MessageSquare, X, BarChart3, MapPin, CalendarDays, UserCheck,
  ClipboardList, ReceiptText, FileText, Megaphone, Star, LineChart, Blocks, Layers,
  Bell, Smartphone, CreditCard, Gauge, Wrench, BookOpen,
  Wallet, HardHat, Store, Navigation, Building2, Link2, Clock,
} from 'lucide-react';
import { useDemoMode } from '@/components/demo/DemoModeProvider';
import { DemoModuleKey } from '@/lib/demo-mode';

type NavItem = {
  href: string;
  label: string;
  icon: React.ElementType;
  module?: DemoModuleKey;
};

const MAIN_NAV: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/features', label: 'Features', icon: BookOpen },
  { href: '/customers', label: 'Customers', icon: UserCheck, module: 'customers' },
  { href: '/leads', label: 'Leads', icon: Users },
  { href: '/lead-scoring', label: 'Lead scoring', icon: Gauge, module: 'lead-scoring' },
  { href: '/pipeline', label: 'Pipeline', icon: Handshake, module: 'lead-pipeline' },
  { href: '/communications', label: 'Communications', icon: MessageSquare, module: 'communications' },
  { href: '/calendar', label: 'Calendar', icon: CalendarDays, module: 'scheduling' },
  { href: '/jobs', label: 'Jobs or Projects', icon: ClipboardList, module: 'job-tracking' },
  { href: '/finance', label: 'Finance Ops', icon: Wallet, module: 'job-costing' },
  { href: '/dispatch', label: 'Dispatch', icon: Navigation, module: 'dispatch' },
  { href: '/assets', label: 'Assets', icon: HardHat, module: 'asset-tracking' },
  { href: '/locations', label: 'Locations', icon: Building2, module: 'locations' },
  { href: '/team', label: 'Team Ops', icon: Users, module: 'employee-operations' },
  { href: '/labor', label: 'Labor', icon: Clock, module: 'labor-tracking' },
  { href: '/estimates', label: 'Estimates', icon: FileText, module: 'estimates' },
  { href: '/invoices', label: 'Invoices', icon: ReceiptText, module: 'invoices' },
  { href: '/tasks', label: 'Tasks', icon: CheckSquare },
  { href: '/routes', label: 'Routes', icon: MapPin, module: 'route-builder' },
  { href: '/automations', label: 'Automations', icon: Sparkles, module: 'automations' },
  { href: '/services', label: 'Services', icon: Wrench },
  { href: '/notifications', label: 'Notifications', icon: Bell, module: 'notifications' },
  { href: '/field-mode', label: 'Field mode', icon: Smartphone, module: 'field-mode' },
  { href: '/marketing', label: 'Marketing', icon: Megaphone, module: 'marketing-dashboard' },
  { href: '/reviews', label: 'Reviews', icon: Star, module: 'review-requests' },
  { href: '/reports', label: 'Reports', icon: LineChart, module: 'reports' },
  { href: '/marketplace', label: 'Marketplace', icon: Store, module: 'marketplace' },
  { href: '/integrations', label: 'Integrations', icon: Link2, module: 'accounting-sync' },
  { href: '/ai-helper', label: 'AI Assistant', icon: Sparkles, module: 'ai-assistant' },
  { href: '/customer-portal', label: 'Customer Portal', icon: Layers, module: 'customer-portal' },
  { href: '/billing', label: 'Customer Billing', icon: CreditCard, module: 'billing' },
  { href: '/feature-builder', label: 'Feature Builder', icon: Blocks },
  { href: '/package-builder', label: 'Package Builder', icon: MessageSquare },
  { href: '/settings', label: 'Settings', icon: Settings },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { enabledModules, industryOption } = useDemoMode();
  const nav = MAIN_NAV.filter((item) => !item.module || enabledModules[item.module]);

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-slate-900 text-white z-40 flex flex-col
        transition-transform duration-300 ease-in-out
        ${open ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
      `}>
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-slate-700">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="text-blue-400" size={22} />
              <span className="font-bold text-white text-base leading-tight">Full CRM Demo</span>
            </div>
            <p className="text-slate-400 text-xs mt-0.5">Universal demo platform</p>
            <p className="text-blue-300 text-[11px] mt-1">{industryOption.shortLabel} profile</p>
          </div>
          <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-white p-1">
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
          {nav.map(({ href, label, icon: Icon }) => {
            const isCalendar = href.includes('?view=calendar');
            const basePath = href.split('?')[0];
            const active = !isCalendar && (pathname === basePath || (basePath !== '/dashboard' && pathname.startsWith(basePath + '/') && basePath !== '/leads/add'));
            const isActive = isCalendar ? false : (href === '/leads/add' ? pathname === href : active);
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon size={17} className="shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-slate-700">
          <p className="text-slate-500 text-xs">Demo data is simulated</p>
          <p className="text-slate-600 text-xs">No live billing or messaging</p>
        </div>
      </aside>
    </>
  );
}
