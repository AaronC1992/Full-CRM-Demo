import { Lead } from '@/lib/types';

export type LeadCategory = 'Residential' | 'Commercial' | '';

const RESIDENTIAL_TAG = 'residential';
const COMMERCIAL_TAG = 'commercial';

export const LEAD_CATEGORY_OPTIONS: LeadCategory[] = ['Residential', 'Commercial'];

export function getLeadCategoryFromTags(tags?: string[] | null): LeadCategory {
  const values = Array.isArray(tags) ? tags.map((tag) => String(tag).toLowerCase()) : [];
  if (values.includes(RESIDENTIAL_TAG)) return 'Residential';
  if (values.includes(COMMERCIAL_TAG)) return 'Commercial';
  return '';
}

export function getLeadCategory(lead: Pick<Lead, 'tags'>): LeadCategory {
  return getLeadCategoryFromTags(lead.tags);
}

export function setLeadCategory(tags: string[] | undefined, category: LeadCategory): string[] {
  const next = (tags || []).filter((tag) => {
    const value = String(tag).toLowerCase();
    return value !== RESIDENTIAL_TAG && value !== COMMERCIAL_TAG;
  });

  if (category === 'Residential') return [...next, RESIDENTIAL_TAG];
  if (category === 'Commercial') return [...next, COMMERCIAL_TAG];
  return next;
}
