import { useMemo, useState } from 'react';
import { BarChart3, Calculator, Trophy, TrendingUp } from 'lucide-react';
import { KPICard } from '@/components/pipeline/KPICard';
import { usePipelineData } from '@/hooks/usePipelineData';
import { computeKpis } from '@/lib/kpi';
import { currency, percent } from '@/lib/formatters';

export default function PipelineDashboard() {
  const [isExtended] = useState(false);
  const { opportunities, loading, error } = usePipelineData(isExtended);

  const kpis = useMemo(() => computeKpis(opportunities), [opportunities]);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-950 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-semibold tracking-tight">
          Sales Pipeline Intelligence
        </h1>
        <p className="mt-2 text-slate-400">
          Open pipeline KPIs at a glance. Funnel, table, and the runtime query
          toggle land in subsequent phases.
        </p>

        {error && (
          <div className="mt-6 rounded-md border border-red-900 bg-red-950/40 p-4 text-sm text-red-300">
            Failed to load pipeline data: {error.message}
          </div>
        )}

        <section className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Total Open Pipeline"
            value={currency(kpis.totalOpenPipeline)}
            icon={<TrendingUp className="h-4 w-4" />}
            loading={loading}
          />
          <KPICard
            title="Weighted Pipeline"
            value={currency(kpis.weightedPipeline)}
            icon={<Calculator className="h-4 w-4" />}
            loading={loading}
          />
          <KPICard
            title="Average Deal Size"
            value={currency(kpis.averageDealSize)}
            icon={<BarChart3 className="h-4 w-4" />}
            loading={loading}
          />
          <KPICard
            title="Win Rate"
            value={percent(kpis.winRate)}
            icon={<Trophy className="h-4 w-4" />}
            loading={loading}
          />
        </section>
      </div>
    </div>
  );
}
