'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Users, PlusCircle, Globe, Handshake,
  CheckSquare, FileDown, Settings, Package, Sparkles,
  MessageSquare, X, BarChart3
} from 'lucide-react';

const nav = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/leads', label: 'Leads', icon: Users },
  { href: '/leads/add', label: 'Add Lead', icon: PlusCircle },
  { href: '/deals', label: 'Deals', icon: Handshake },
  { href: '/demos', label: 'Demo Tracker', icon: Globe },
  { href: '/tasks', label: 'Tasks & Follow Ups', icon: CheckSquare },
  { href: '/outreach', label: 'Outreach Templates', icon: MessageSquare },
  { href: '/import-export', label: 'Import / Export', icon: FileDown },
  { href: '/packages', label: 'Packages', icon: Package },
  { href: '/ai-helper', label: 'AI Helper', icon: Sparkles },
  { href: '/settings', label: 'Settings', icon: Settings },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();

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
              <span className="font-bold text-white text-base leading-tight">Cue CRM</span>
            </div>
            <p className="text-slate-400 text-xs mt-0.5">Cue Marketing Solutions</p>
          </div>
          <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-white p-1">
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
          {nav.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href + '/') && href !== '/leads/add');
            const exactActive = pathname === href;
            const isActive = href === '/leads/add' ? exactActive : active;
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
          <p className="text-slate-500 text-xs">Aaron Cue</p>
          <p className="text-slate-600 text-xs">918 808 0074</p>
        </div>
      </aside>
    </>
  );
}
