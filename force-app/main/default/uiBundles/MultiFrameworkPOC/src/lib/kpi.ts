import type { Opportunity } from '@/types/pipeline';

export interface PipelineKpis {
  totalOpenPipeline: number;
  weightedPipeline: number;
  averageDealSize: number;
  // null when no closed opportunities are present (denominator would be zero).
  winRate: number | null;
}

export function computeKpis(opportunities: Opportunity[]): PipelineKpis {
  const open = opportunities.filter(o => o.IsClosed === false);
  const closed = opportunities.filter(o => o.IsClosed === true);
  const won = closed.filter(o => o.IsWon === true);

  const totalOpenPipeline = open.reduce((sum, o) => sum + (o.Amount ?? 0), 0);

  const weightedPipeline = open.reduce(
    (sum, o) => sum + ((o.Amount ?? 0) * (o.Probability ?? 0)) / 100,
    0,
  );

  const averageDealSize = open.length > 0 ? totalOpenPipeline / open.length : 0;

  const winRate = closed.length > 0 ? (won.length / closed.length) * 100 : null;

  return { totalOpenPipeline, weightedPipeline, averageDealSize, winRate };
}
