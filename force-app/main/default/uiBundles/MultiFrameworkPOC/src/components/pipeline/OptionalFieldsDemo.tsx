import { useEffect, useState } from 'react';
import { executeGraphQL } from '@/api/graphqlClient';
import { OPTIONAL_FIELDS_DEMO_QUERY } from '@/lib/queries';
import type { FieldValue, OptionalAccountNode, OptionalFieldsQueryResponse } from '@/types/pipeline';

// ❌ Old lightning/uiGraphQLApi behavior:
// If Industry was inaccessible, the entire query threw:
// { message: "FIELD_NOT_ACCESSIBLE", errorCode: "INSUFFICIENT_ACCESS" }
// The component crashed. There was no way to say "skip this field if inaccessible".
//
// ✅ New @optional directive behavior:
// Industry @optional { value }
// If inaccessible: field is simply omitted from the response. Query succeeds.
// If accessible: field resolves normally.

type Status = 'loading' | 'resolved' | 'skipped' | 'error';
interface FieldRow { field: string; status: Status; detail: string; }

const DOT: Record<Status, string> = {
  loading: 'bg-slate-500 animate-pulse',
  resolved: 'bg-green-500',
  skipped: 'bg-yellow-500',
  error: 'bg-red-500',
};

function classify(name: string, accounts: OptionalAccountNode[], pick: (n: OptionalAccountNode) => FieldValue<unknown> | undefined): FieldRow {
  if (accounts.every(a => pick(a) === undefined)) {
    return { field: name, status: 'skipped', detail: 'Inaccessible (FLS) — omitted via @optional' };
  }
  const present = accounts.filter(a => pick(a)?.value != null).length;
  return { field: name, status: 'resolved', detail: `${present}/${accounts.length} records returned a value` };
}

export function OptionalFieldsDemo() {
  const [rows, setRows] = useState<FieldRow[]>([
    { field: 'Industry', status: 'loading', detail: 'Querying...' },
    { field: 'AnnualRevenue', status: 'loading', detail: 'Querying...' },
  ]);

  useEffect(() => {
    let cancelled = false;
    executeGraphQL<OptionalFieldsQueryResponse, { first: number }>(OPTIONAL_FIELDS_DEMO_QUERY, { first: 5 })
      .then(data => {
        if (cancelled) return;
        const accounts = data.uiapi.query.Account.edges.map(e => e.node);
        setRows([
          classify('Industry', accounts, n => n.Industry),
          classify('AnnualRevenue', accounts, n => n.AnnualRevenue),
        ]);
      })
      .catch(err => {
        if (cancelled) return;
        const msg = err instanceof Error ? err.message : String(err);
        setRows(prev => prev.map(r => ({ ...r, status: 'error', detail: msg })));
      });
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="rounded-md border border-slate-800 bg-slate-900 p-4 space-y-3">
      <h3 className="text-sm font-medium text-slate-100">Optional Fields (FLS Resilience Demo)</h3>
      <p className="text-xs text-slate-400">
        With <code className="font-mono text-indigo-300">@optional</code>, fields the user can&apos;t access are omitted instead of crashing the query.
      </p>
      <ul className="space-y-2">
        {rows.map(r => (
          <li key={r.field} className="flex items-center gap-3 text-sm">
            <span className={`h-2.5 w-2.5 rounded-full ${DOT[r.status]}`} aria-hidden />
            <span className="font-mono text-slate-200">{r.field}</span>
            <span className="text-slate-400">— {r.detail}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
