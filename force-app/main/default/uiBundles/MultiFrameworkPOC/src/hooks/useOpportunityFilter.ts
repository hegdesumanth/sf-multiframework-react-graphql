import { useMemo, useState } from 'react';
import type { Opportunity } from '@/types/pipeline';

export function useOpportunityFilter(opportunities: Opportunity[]) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeStages, setActiveStages] = useState<string[]>([]);

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return opportunities.filter(o => {
      const matchesQuery =
        !q ||
        o.Name?.toLowerCase().includes(q) ||
        o.Account?.Name?.toLowerCase().includes(q);
      const matchesStage =
        activeStages.length === 0 ||
        (o.StageName != null && activeStages.includes(o.StageName));
      return matchesQuery && matchesStage;
    });
  }, [opportunities, searchTerm, activeStages]);

  const toggleStage = (stage: string) =>
    setActiveStages(s =>
      s.includes(stage) ? s.filter(x => x !== stage) : [...s, stage],
    );

  return { searchTerm, setSearchTerm, activeStages, toggleStage, filtered };
}
