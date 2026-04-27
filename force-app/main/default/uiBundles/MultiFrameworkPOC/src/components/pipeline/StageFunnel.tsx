import { useMemo } from 'react';
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { currency } from '@/lib/formatters';
import type { Opportunity } from '@/types/pipeline';

interface StageFunnelProps {
  opportunities: Opportunity[];
  loading: boolean;
}

export function StageFunnel({ opportunities, loading }: StageFunnelProps) {
  const data = useMemo(() => {
    const map = new Map<string, number>();
    for (const o of opportunities) {
      const stage = o.StageName ?? 'Unknown';
      map.set(stage, (map.get(stage) ?? 0) + (o.Amount ?? 0));
    }
    return Array.from(map, ([stage, total]) => ({ stage, total })).sort(
      (a, b) => b.total - a.total,
    );
  }, [opportunities]);

  return (
    <div className="rounded-md border border-slate-800 bg-slate-900 p-4">
      <h3 className="text-sm font-medium text-slate-100 mb-4">Pipeline by Stage</h3>
      {loading ? (
        <Skeleton className="h-64 w-full bg-slate-800" />
      ) : data.length === 0 ? (
        <div className="text-center text-slate-500 py-12 text-sm">No data to display.</div>
      ) : (
        <ResponsiveContainer width="100%" height={Math.max(220, data.length * 36)}>
          <BarChart data={data} layout="vertical" margin={{ left: 32, right: 32 }}>
            <defs>
              <linearGradient id="funnelGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#312e81" />
              </linearGradient>
            </defs>
            <XAxis type="number" stroke="#64748b" tickFormatter={v => currency(Number(v))} />
            <YAxis type="category" dataKey="stage" stroke="#94a3b8" width={140} />
            <Tooltip
              cursor={{ fill: '#1e293b' }}
              contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 6 }}
              labelStyle={{ color: '#f1f5f9' }}
              itemStyle={{ color: '#c7d2fe' }}
              formatter={v => currency(Number(v ?? 0))}
            />
            <Bar dataKey="total" fill="url(#funnelGradient)" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
