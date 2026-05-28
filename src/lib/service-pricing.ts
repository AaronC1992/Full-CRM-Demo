export interface ServiceLineItem {
  id: string;
  name: string;
  price: number;
}

export type ServicePricingMap = Record<number, ServiceLineItem[]>;

const STORAGE_KEY = 'fullcrmdemo_service_pricing_v1';

function normalizeItems(items: ServiceLineItem[]): ServiceLineItem[] {
  return items
    .map((item, index) => ({
      id: item.id || `service-${Date.now()}-${index}`,
      name: String(item.name || '').trim(),
      price: Number.isFinite(Number(item.price)) ? Math.max(0, Number(item.price)) : 0,
    }))
    .filter((item) => item.name.length > 0);
}

export function loadServicePricingMap(): ServicePricingMap {
  if (typeof window === 'undefined') return {};

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};

    const parsed = JSON.parse(raw) as Record<string, ServiceLineItem[]>;
    const map: ServicePricingMap = {};

    for (const [key, value] of Object.entries(parsed)) {
      const id = Number(key);
      if (!Number.isFinite(id) || !Array.isArray(value)) continue;
      map[id] = normalizeItems(value);
    }

    return map;
  } catch {
    return {};
  }
}

export function saveServicePricingMap(map: ServicePricingMap): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    // Ignore storage failures in demo mode.
  }
}

export function getServiceItems(map: ServicePricingMap, recordId: number): ServiceLineItem[] {
  return map[recordId] || [];
}

export function setServiceItems(map: ServicePricingMap, recordId: number, items: ServiceLineItem[]): ServicePricingMap {
  const normalized = normalizeItems(items);
  const next = { ...map };

  if (normalized.length === 0) {
    delete next[recordId];
  } else {
    next[recordId] = normalized;
  }

  return next;
}

export function getServiceSummary(items: ServiceLineItem[]): { count: number; total: number } {
  return {
    count: items.length,
    total: items.reduce((sum, item) => sum + (item.price || 0), 0),
  };
}

export function buildSeedServices(options: {
  serviceOpportunity?: string;
  suggestedOffer?: string;
}): ServiceLineItem[] {
  const names = [options.serviceOpportunity, options.suggestedOffer]
    .flatMap((value) => String(value || '').split(','))
    .map((value) => value.trim())
    .filter((value, index, list) => value.length > 0 && list.indexOf(value) === index)
    .slice(0, 3);

  return names.map((name, index) => ({
    id: `seed-${Date.now()}-${index}`,
    name,
    price: 0,
  }));
}
