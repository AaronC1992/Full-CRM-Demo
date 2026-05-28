export interface ServiceCatalogItem {
  id: string;
  name: string;
  value: number;
  active: boolean;
}

const SERVICE_CATALOG_KEY = 'fullcrmdemo_service_catalog_v1';

function normalizeServiceName(value: string): string {
  return value.trim().toLowerCase();
}

export function suggestMockServiceValue(name: string): number {
  const normalized = normalizeServiceName(name);

  const contains = (values: string[]) => values.some((value) => normalized.includes(value));

  if (contains(['one time', 'single visit', 'inspection', 'consultation'])) return 149;
  if (contains(['weekly', 'biweekly', 'monthly', 'plan', 'membership', 'maintenance'])) return 249;
  if (contains(['repair', 'install', 'installation', 'replacement', 'remodel', 'build'])) return 699;
  if (contains(['mow', 'cleaning', 'detail', 'rotation', 'oil change', 'service'])) return 199;
  if (contains(['commercial', 'fleet', 'contract', 'corporate'])) return 899;
  if (contains(['premium', 'vip', 'wedding', 'bridal', 'package', 'bundle'])) return 499;
  if (contains(['emergency', 'urgent'])) return 349;

  return 229;
}

export function parseSelectedServices(value?: string | null): string[] {
  if (!value) return [];

  return Array.from(new Set(
    value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
  ));
}

export function createServiceCatalogItem(name: string, value = 0): ServiceCatalogItem {
  const trimmedName = name.trim();
  const parsedValue = Number(value);
  const defaultValue = suggestMockServiceValue(trimmedName);
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
    name: trimmedName,
    value: Number.isFinite(parsedValue) && parsedValue > 0 ? Math.max(0, Math.round(parsedValue)) : defaultValue,
    active: true,
  };
}

export function fillMissingMockPrices(catalog: ServiceCatalogItem[]): ServiceCatalogItem[] {
  return catalog.map((item) => {
    if (item.value > 0) return item;
    return { ...item, value: suggestMockServiceValue(item.name) };
  });
}

export function mergeCatalogWithServices(existing: ServiceCatalogItem[], serviceNames: string[]): ServiceCatalogItem[] {
  const normalized = new Set(existing.map((item) => normalizeServiceName(item.name)));
  const additions = serviceNames
    .map((name) => name.trim())
    .filter(Boolean)
    .filter((name) => !normalized.has(normalizeServiceName(name)))
    .map((name) => createServiceCatalogItem(name));

  return [...existing, ...additions];
}

export function loadServiceCatalog(): ServiceCatalogItem[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = localStorage.getItem(SERVICE_CATALOG_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((item) => ({
        id: String(item?.id || `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`),
        name: String(item?.name || '').trim(),
        value: Number.isFinite(Number(item?.value)) ? Math.max(0, Math.round(Number(item.value))) : 0,
        active: item?.active !== false,
      }))
      .filter((item) => item.name.length > 0);
  } catch {
    return [];
  }
}

export function saveServiceCatalog(catalog: ServiceCatalogItem[]): void {
  if (typeof window === 'undefined') return;

  const sanitized = catalog
    .map((item) => ({
      id: String(item.id),
      name: item.name.trim(),
      value: Number.isFinite(Number(item.value)) ? Math.max(0, Math.round(Number(item.value))) : 0,
      active: item.active !== false,
    }))
    .filter((item) => item.name.length > 0);

  localStorage.setItem(SERVICE_CATALOG_KEY, JSON.stringify(sanitized));
  window.dispatchEvent(new Event('fullcrm-services-updated'));
}

export function calculateEstimatedValue(selectedServices: string[], catalog: ServiceCatalogItem[]): number {
  if (selectedServices.length === 0 || catalog.length === 0) return 0;

  const priceMap = new Map<string, number>();
  for (const item of catalog) {
    if (!item.active) continue;
    const key = normalizeServiceName(item.name);
    if (!key) continue;
    priceMap.set(key, Math.max(0, Math.round(item.value || 0)));
  }

  return selectedServices.reduce((sum, name) => {
    const price = priceMap.get(normalizeServiceName(name));
    return sum + (price || 0);
  }, 0);
}
