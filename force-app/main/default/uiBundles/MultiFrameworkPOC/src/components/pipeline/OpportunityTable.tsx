import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { STAGE_BADGE_CLASSES, currency, formatDate, initials, percent, stageBadgeClass } from '@/lib/formatters';
import { useOpportunityFilter } from '@/hooks/useOpportunityFilter';
import type { Opportunity } from '@/types/pipeline';

interface OpportunityTableProps {
  opportunities: Opportunity[];
  isExtended: boolean;
  loading: boolean;
}

const ALL_STAGES = Object.keys(STAGE_BADGE_CLASSES);

export function OpportunityTable({ opportunities, isExtended, loading }: OpportunityTableProps) {
  const { searchTerm, setSearchTerm, activeStages, toggleStage, filtered } =
    useOpportunityFilter(opportunities);
  const colSpan = isExtended ? 10 : 7;

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3">
        <Input
          placeholder="Search by name or account..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="max-w-sm bg-slate-900 border-slate-800 text-slate-100 placeholder:text-slate-500"
        />
        <div className="flex flex-wrap gap-1.5">
          {ALL_STAGES.map(stage => {
            const active = activeStages.includes(stage);
            return (
              <button
                key={stage}
                type="button"
                onClick={() => toggleStage(stage)}
                className={cn(
                  'px-2 py-0.5 text-xs rounded-md border transition',
                  active
                    ? `${stageBadgeClass(stage)} border-transparent text-white`
                    : 'border-slate-800 bg-slate-900 text-slate-400 hover:bg-slate-800',
                )}
              >
                {stage}
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-md border border-slate-800 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-slate-800 hover:bg-transparent">
              <TableHead className="text-slate-400">Name</TableHead>
              <TableHead className="text-slate-400">Account</TableHead>
              <TableHead className="text-slate-400">Owner</TableHead>
              <TableHead className="text-slate-400">Stage</TableHead>
              <TableHead className="text-right text-slate-400">Amount</TableHead>
              <TableHead className="text-right text-slate-400">Probability</TableHead>
              <TableHead className="text-slate-400">Close Date</TableHead>
              {isExtended && (
                <>
                  <TableHead className="text-slate-400">Industry <Badge variant="outline" className="ml-1 text-[10px] text-slate-400">Extended</Badge></TableHead>
                  <TableHead className="text-right text-slate-400">Annual Revenue <Badge variant="outline" className="ml-1 text-[10px] text-slate-400">Extended</Badge></TableHead>
                  <TableHead className="text-slate-400">Owner Title <Badge variant="outline" className="ml-1 text-[10px] text-slate-400">Extended</Badge></TableHead>
                </>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i} className="border-slate-800">
                  <TableCell colSpan={colSpan}><Skeleton className="h-4 w-full bg-slate-800" /></TableCell>
                </TableRow>
              ))
            ) : filtered.length === 0 ? (
              <TableRow className="border-slate-800">
                <TableCell colSpan={colSpan} className="text-center text-slate-500 py-8">
                  No opportunities match the current filters.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map(o => (
                <TableRow key={o.Id} className="border-slate-800">
                  <TableCell className="font-medium text-slate-100">{o.Name ?? '—'}</TableCell>
                  <TableCell className="text-slate-300">{o.Account?.Name ?? '—'}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        {o.Owner?.SmallPhotoUrl && <AvatarImage src={o.Owner.SmallPhotoUrl} alt="" />}
                        <AvatarFallback className="text-[10px] bg-slate-800 text-slate-300">{initials(o.Owner?.Name)}</AvatarFallback>
                      </Avatar>
                      <span className="text-slate-300">{o.Owner?.Name ?? '—'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={cn(stageBadgeClass(o.StageName), 'text-white border-transparent')}>{o.StageName ?? '—'}</Badge>
                  </TableCell>
                  <TableCell className="text-right text-slate-100">{currency(o.Amount)}</TableCell>
                  <TableCell className="text-right text-slate-300">{percent(o.Probability)}</TableCell>
                  <TableCell className="text-slate-300">{formatDate(o.CloseDate)}</TableCell>
                  {isExtended && (
                    <>
                      <TableCell className="text-slate-300">{o.Account?.Industry ?? '—'}</TableCell>
                      <TableCell className="text-right text-slate-300">{currency(o.Account?.AnnualRevenue ?? null)}</TableCell>
                      <TableCell className="text-slate-300">{o.Owner?.Title ?? '—'}</TableCell>
                    </>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
