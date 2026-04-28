import { useEffect, useState } from 'react';
import { getOpportunities, type OpportunityNode } from '@/api/opportunity/opportunityService';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

// Stage → color mapping kept in one place so it doesn't scatter across files
const STAGE_COLORS: Record<string, string> = {
	'Prospecting': 'bg-slate-500',
	'Qualification': 'bg-blue-500',
	'Needs Analysis': 'bg-cyan-500',
	'Value Proposition': 'bg-teal-500',
	'Id. Decision Makers': 'bg-yellow-500',
	'Perception Analysis': 'bg-orange-500',
	'Proposal/Price Quote': 'bg-purple-500',
	'Negotiation/Review': 'bg-pink-500',
	'Closed Won': 'bg-green-500',
	'Closed Lost': 'bg-red-500',
};

function formatCurrency(value: number | null): string {
	if (value === null) return '—';
	return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
}

function formatDate(value: string | null): string {
	if (!value) return '—';
	return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function StageBadge({ stage }: { stage: string | null }) {
	const label = stage ?? '—';
	const color = stage ? (STAGE_COLORS[stage] ?? 'bg-slate-500') : 'bg-slate-700';
	return (
		<span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium text-white', color)}>
			{label}
		</span>
	);
}

function LoadingRows() {
	return (
		<>
			{Array.from({ length: 10 }).map((_, i) => (
				<TableRow key={i} className="border-slate-800">
					{Array.from({ length: 7 }).map((_, j) => (
						<TableCell key={j}><Skeleton className="h-4 w-full bg-slate-800" /></TableCell>
					))}
				</TableRow>
			))}
		</>
	);
}

export default function OpportunitiesPage() {
	const [opportunities, setOpportunities] = useState<OpportunityNode[]>([]);
	const [totalCount, setTotalCount] = useState(0);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let cancelled = false;
		getOpportunities()
			.then(result => {
				if (!cancelled) {
					setOpportunities(result.opportunities);
					setTotalCount(result.totalCount);
				}
			})
			.catch(err => {
				if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load opportunities');
			})
			.finally(() => {
				if (!cancelled) setLoading(false);
			});
		return () => { cancelled = true; };
	}, []);

	return (
		<div className="min-h-screen bg-slate-950 text-slate-50 p-6">
			<div className="max-w-7xl mx-auto">
				<div className="mb-6">
					<h1 className="text-2xl font-bold text-white">Opportunities</h1>
					<p className="text-slate-400 text-sm mt-1">
						Single GraphQL query returning Opportunity + nested Account data — one round trip, no joins in Apex.
					</p>
					{!loading && !error && (
						<p className="text-slate-500 text-xs mt-1">{totalCount} total records · showing first 10</p>
					)}
				</div>

				{error && (
					<div className="rounded-lg border border-red-800 bg-red-950/50 p-4 text-red-400 text-sm mb-6">
						{error}
					</div>
				)}

				<div className="rounded-lg border border-slate-800 bg-slate-900">
					<Table>
						<TableHeader>
							<TableRow className="border-slate-800 hover:bg-transparent">
								<TableHead className="text-slate-400 font-semibold">Opportunity</TableHead>
								<TableHead className="text-slate-400 font-semibold">Stage</TableHead>
								<TableHead className="text-slate-400 font-semibold">Amount</TableHead>
								<TableHead className="text-slate-400 font-semibold">Close Date</TableHead>
								<TableHead className="text-slate-400 font-semibold">Account</TableHead>
								<TableHead className="text-slate-400 font-semibold">Industry</TableHead>
								<TableHead className="text-slate-400 font-semibold text-right">Probability</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{loading ? (
								<LoadingRows />
							) : opportunities.length === 0 ? (
								<TableRow className="border-slate-800">
									<TableCell colSpan={7} className="text-center text-slate-500 py-12">
										No opportunities found.
									</TableCell>
								</TableRow>
							) : (
								opportunities.map(opp => (
									<TableRow key={opp.Id} className="border-slate-800 hover:bg-slate-800/50">
										<TableCell className="font-medium text-white">
											{opp.Name?.displayValue ?? opp.Name?.value ?? '—'}
										</TableCell>
										<TableCell>
											<StageBadge stage={opp.StageName?.value ?? null} />
										</TableCell>
										<TableCell className="text-slate-300">
											{formatCurrency(opp.Amount?.value ?? null)}
										</TableCell>
										<TableCell className="text-slate-300">
											{formatDate(opp.CloseDate?.value ?? null)}
										</TableCell>
										<TableCell className="text-slate-300">
											{opp.Account?.Name?.displayValue ?? opp.Account?.Name?.value ?? '—'}
										</TableCell>
										<TableCell>
											{opp.Account?.Industry?.displayValue ? (
												<Badge variant="outline" className="border-slate-600 text-slate-400 text-xs">
													{opp.Account.Industry.displayValue}
												</Badge>
											) : (
												<span className="text-slate-600">—</span>
											)}
										</TableCell>
										<TableCell className="text-right text-slate-300">
											{opp.Probability?.value != null ? `${opp.Probability.value}%` : '—'}
										</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
					</Table>
				</div>
			</div>
		</div>
	);
}
