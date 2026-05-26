'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  DEFAULT_ENABLED_MODULES,
  DEMO_MODULES,
  DemoIndustry,
  DemoModuleKey,
  INDUSTRY_OPTIONS,
  INDUSTRY_PROFILES,
  IndustryOption,
} from '@/lib/demo-mode';

const STORAGE_KEY = 'cuecrm_demo_mode_v1';

interface DemoModeState {
  industry: DemoIndustry;
  industryOption: IndustryOption;
  setIndustry: (next: DemoIndustry) => void;
  enabledModules: Record<DemoModuleKey, boolean>;
  setModuleEnabled: (module: DemoModuleKey, enabled: boolean) => void;
  toggleModule: (module: DemoModuleKey) => void;
  resetModules: () => void;
  profile: (typeof INDUSTRY_PROFILES)[DemoIndustry];
  moduleDefinitions: typeof DEMO_MODULES;
}

const DemoModeContext = createContext<DemoModeState | null>(null);

export function DemoModeProvider({ children }: { children: React.ReactNode }) {
  const [industry, setIndustryState] = useState<DemoIndustry>('lawn-care');
  const [enabledModules, setEnabledModules] = useState<Record<DemoModuleKey, boolean>>(DEFAULT_ENABLED_MODULES);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as {
        industry?: DemoIndustry;
        enabledModules?: Partial<Record<DemoModuleKey, boolean>>;
      };

      if (parsed.industry && INDUSTRY_OPTIONS.some((option) => option.value === parsed.industry)) {
        setIndustryState(parsed.industry);
      }

      if (parsed.enabledModules) {
        const merged = { ...DEFAULT_ENABLED_MODULES };
        for (const key of Object.keys(parsed.enabledModules) as DemoModuleKey[]) {
          merged[key] = Boolean(parsed.enabledModules[key]);
        }
        setEnabledModules(merged);
      }
    } catch {
      // Ignore storage parse issues and use defaults.
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ industry, enabledModules })
      );
    } catch {
      // Ignore storage write failures.
    }
  }, [industry, enabledModules]);

  const state = useMemo<DemoModeState>(() => {
    const industryOption = INDUSTRY_OPTIONS.find((option) => option.value === industry) ?? INDUSTRY_OPTIONS[0];

    return {
      industry,
      industryOption,
      setIndustry: setIndustryState,
      enabledModules,
      setModuleEnabled: (module, enabled) => {
        setEnabledModules((prev) => ({ ...prev, [module]: enabled }));
      },
      toggleModule: (module) => {
        setEnabledModules((prev) => ({ ...prev, [module]: !prev[module] }));
      },
      resetModules: () => setEnabledModules(DEFAULT_ENABLED_MODULES),
      profile: INDUSTRY_PROFILES[industry],
      moduleDefinitions: DEMO_MODULES,
    };
  }, [industry, enabledModules]);

  return <DemoModeContext.Provider value={state}>{children}</DemoModeContext.Provider>;
}

export function useDemoMode() {
  const context = useContext(DemoModeContext);
  if (!context) {
    throw new Error('useDemoMode must be used inside DemoModeProvider.');
  }
  return context;
}
