import { format, parseISO } from 'date-fns';

const CURRENCY_FORMATTER = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

export function currency(amount: number | null | undefined): string {
  if (amount == null || Number.isNaN(amount)) return '—';
  return CURRENCY_FORMATTER.format(amount);
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  try {
    return format(parseISO(iso), 'MMM d, yyyy');
  } catch {
    return '—';
  }
}

export function initials(name: string | null | undefined): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map(p => p[0]?.toUpperCase() ?? '').join('') || '?';
}

export function percent(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return '—';
  return `${Math.round(value)}%`;
}

export const STAGE_BADGE_CLASSES: Record<string, string> = {
  Prospecting: 'bg-slate-500',
  Qualification: 'bg-blue-500',
  'Needs Analysis': 'bg-cyan-500',
  'Value Proposition': 'bg-teal-500',
  'Id. Decision Makers': 'bg-yellow-500',
  'Perception Analysis': 'bg-orange-500',
  'Proposal/Price Quote': 'bg-purple-500',
  'Negotiation/Review': 'bg-pink-500',
  'Closed Won': 'bg-green-500',
  'Closed Lost': 'bg-red-500',
};

export function stageBadgeClass(stage: string | null | undefined): string {
  if (!stage) return 'bg-slate-500';
  return STAGE_BADGE_CLASSES[stage] ?? 'bg-slate-500';
}
