import { cn } from '@/lib/utils';

// ❌ LWC @wire limitation — query is static, cannot be changed at runtime:
// @wire(graphql, { query: CORE_QUERY }) pipelineData;
// You cannot do: if (isExtended) { this.query = EXTENDED_QUERY; }
// @wire does not react to query string changes — you'd need a full Apex method swap.
//
// ✅ Multi-Framework approach — query string constructed at runtime:
// const query = isExtended ? EXTENDED_PIPELINE_QUERY : CORE_PIPELINE_QUERY;
// const data = await sdk.fetch(query);

interface DynamicQueryToggleProps {
  isExtended: boolean;
  onToggle: () => void;
}

export function DynamicQueryToggle({ isExtended, onToggle }: DynamicQueryToggleProps) {
  return (
    <div className="flex items-center justify-between rounded-md border border-slate-800 bg-slate-900 px-4 py-3">
      <div>
        <p className="text-sm font-medium text-slate-100">Dynamic Query (Extended View)</p>
        <p className="text-xs text-slate-400">
          Toggle to swap the GraphQL query at runtime — adds Industry, Annual Revenue, and Owner Title columns.
        </p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={isExtended}
        aria-label="Toggle extended view"
        onClick={onToggle}
        className={cn('relative h-6 w-11 rounded-full transition-colors', isExtended ? 'bg-indigo-500' : 'bg-slate-700')}
      >
        <span
          className={cn('absolute top-0.5 left-1 h-5 w-5 rounded-full bg-white transition-transform', isExtended ? 'translate-x-4' : '')}
        />
      </button>
    </div>
  );
}
