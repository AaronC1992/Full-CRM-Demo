'use client';
import { Menu, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { INDUSTRY_OPTIONS } from '@/lib/demo-mode';
import { useDemoMode } from '@/components/demo/DemoModeProvider';

interface HeaderProps {
  title: string;
  onMenuClick: () => void;
}

export default function Header({ title, onMenuClick }: HeaderProps) {
  const router = useRouter();
  const { industry, setIndustry } = useDemoMode();

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-20 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100"
      >
        <Menu size={20} />
      </button>
      <h1 className="font-semibold text-gray-800 text-lg flex-1">{title}</h1>
      <div className="hidden md:flex items-center gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-blue-700 bg-blue-50 border border-blue-200 px-2 py-1 rounded-md">
          Demo mode
        </span>
        <select
          value={industry}
          onChange={(event) => setIndustry(event.target.value as typeof industry)}
          className="text-sm border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Demo industry"
        >
          {INDUSTRY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <button
        onClick={handleLogout}
        title="Sign out"
        className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
      >
        <LogOut size={18} />
      </button>
    </header>
  );
}
