import { useEffect, useState } from 'react';
import { getOpportunities, type OpportunityNode } from '@/api/opportunity/opportunityService';
import { updateOpportunityStage } from '@/api/opportunity/opportunityMutationService';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

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

function StageBadge({ stage }: { stage: string | null }) {
	const label = stage ?? '—';
	const color = stage ? (STAGE_COLORS[stage] ?? 'bg-slate-500') : 'bg-slate-700';
	return (
		<span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium text-white', color)}>
			{label}
		</span>
	);
}

function Spinner() {
	return (
		<span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-slate-400 border-t-transparent" />
	);
}

function formatCurrency(value: number | null): string {
	if (value === null) return '—';
	return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
}

function LoadingRows() {
	return (
		<>
			{Array.from({ length: 8 }).map((_, i) => (
				<TableRow key={i} className="border-slate-800">
					{Array.from({ length: 5 }).map((_, j) => (
						<TableCell key={j}><Skeleton className="h-4 w-full bg-slate-800" /></TableCell>
					))}
				</TableRow>
			))}
		</>
	);
}

export default function QuickClosePage() {
	const [opportunities, setOpportunities] = useState<OpportunityNode[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [closingId, setClosingId] = useState<string | null>(null);
	const [rowErrors, setRowErrors] = useState<Record<string, string>>({});

	useEffect(() => {
		let cancelled = false;
		getOpportunities()
			.then((result) => {
				if (!cancelled) setOpportunities(result.opportunities);
			})
			.catch((err) => {
				if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load opportunities');
			})
			.finally(() => {
				if (!cancelled) setLoading(false);
			});
		return () => { cancelled = true; };
	}, []);

	async function handleClose(id: string, stageName: 'Closed Won' | 'Closed Lost') {
		setClosingId(id);
		setRowErrors((prev) => { const next = { ...prev }; delete next[id]; return next; });

		try {
			await updateOpportunityStage(id, stageName);
			setOpportunities((prev) =>
				prev.map((opp) =>
					opp.Id === id
						? {
								...opp,
								StageName: { value: stageName, displayValue: stageName },
								IsClosed: { value: true, displayValue: null },
								IsWon: { value: stageName === 'Closed Won', displayValue: null },
							}
						: opp,
				),
			);
		} catch (err) {
			const msg = err instanceof Error ? err.message : 'Mutation failed';
			setRowErrors((prev) => ({ ...prev, [id]: msg }));
		} finally {
			setClosingId(null);
		}
	}

	const openOpps = opportunities.filter((o) => !o.IsClosed?.value);
	const closedOpps = opportunities.filter((o) => o.IsClosed?.value);

	return (
		<div className="min-h-screen bg-slate-950 text-slate-50 p-6">
			<div className="max-w-7xl mx-auto">
				<div className="mb-6">
					<h1 className="text-2xl font-bold text-white">Quick Close</h1>
					<p className="text-slate-400 text-sm mt-1">
						Demonstrates <code className="text-blue-400 bg-slate-800 px-1 py-0.5 rounded text-xs">data.graphql.mutate()</code> — click Won or Lost to fire a live GraphQL mutation and update the stage inline.
					</p>
				</div>

				{error && (
					<div className="rounded-lg border border-red-800 bg-red-950/50 p-4 text-red-400 text-sm mb-6">
						{error}
					</div>
				)}

				{/* Open opportunities — actionable */}
				<div className="mb-8">
					<h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
						Open · {loading ? '…' : openOpps.length} record{openOpps.length !== 1 ? 's' : ''}
					</h2>
					<div className="rounded-lg border border-slate-800 bg-slate-900">
						<Table>
							<TableHeader>
								<TableRow className="border-slate-800 hover:bg-transparent">
									<TableHead className="text-slate-400 font-semibold">Opportunity</TableHead>
									<TableHead className="text-slate-400 font-semibold">Account</TableHead>
									<TableHead className="text-slate-400 font-semibold">Stage</TableHead>
									<TableHead className="text-slate-400 font-semibold">Amount</TableHead>
									<TableHead className="text-slate-400 font-semibold text-right">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{loading ? (
									<LoadingRows />
								) : openOpps.length === 0 ? (
									<TableRow className="border-slate-800">
										<TableCell colSpan={5} className="text-center text-slate-500 py-12">
											No open opportunities found.
										</TableCell>
									</TableRow>
								) : (
									openOpps.map((opp) => (
										<>
											<TableRow key={opp.Id} className="border-slate-800 hover:bg-slate-800/50">
												<TableCell className="font-medium text-white">
													{opp.Name?.displayValue ?? opp.Name?.value ?? '—'}
												</TableCell>
												<TableCell className="text-slate-300">
													{opp.Account?.Name?.displayValue ?? opp.Account?.Name?.value ?? '—'}
												</TableCell>
												<TableCell>
													<StageBadge stage={opp.StageName?.value ?? null} />
												</TableCell>
												<TableCell className="text-slate-300">
													{formatCurrency(opp.Amount?.value ?? null)}
												</TableCell>
												<TableCell className="text-right">
													{closingId === opp.Id ? (
														<span className="inline-flex items-center gap-2 text-slate-400 text-sm">
															<Spinner /> Saving…
														</span>
													) : (
														<div className="inline-flex gap-2">
															<Button
																size="sm"
																variant="outline"
																className="border-green-700 text-green-400 hover:bg-green-900/40 hover:text-green-300 text-xs h-7"
																disabled={closingId !== null}
																onClick={() => handleClose(opp.Id, 'Closed Won')}
															>
																Won
															</Button>
															<Button
																size="sm"
																variant="outline"
																className="border-red-800 text-red-400 hover:bg-red-900/40 hover:text-red-300 text-xs h-7"
																disabled={closingId !== null}
																onClick={() => handleClose(opp.Id, 'Closed Lost')}
															>
																Lost
															</Button>
														</div>
													)}
												</TableCell>
											</TableRow>
											{rowErrors[opp.Id] && (
												<TableRow key={`${opp.Id}-err`} className="border-slate-800 border-t-0">
													<TableCell colSpan={5} className="pt-0 pb-2">
														<p className="text-red-400 text-xs px-1">{rowErrors[opp.Id]}</p>
													</TableCell>
												</TableRow>
											)}
										</>
									))
								)}
							</TableBody>
						</Table>
					</div>
				</div>

				{/* Closed opportunities — read-only */}
				{!loading && closedOpps.length > 0 && (
					<div>
						<h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
							Closed · {closedOpps.length} record{closedOpps.length !== 1 ? 's' : ''}
						</h2>
						<div className="rounded-lg border border-slate-800 bg-slate-900 opacity-60">
							<Table>
								<TableHeader>
									<TableRow className="border-slate-800 hover:bg-transparent">
										<TableHead className="text-slate-500 font-semibold">Opportunity</TableHead>
										<TableHead className="text-slate-500 font-semibold">Account</TableHead>
										<TableHead className="text-slate-500 font-semibold">Stage</TableHead>
										<TableHead className="text-slate-500 font-semibold">Amount</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{closedOpps.map((opp) => (
										<TableRow key={opp.Id} className="border-slate-800">
											<TableCell className="text-slate-500">
												{opp.Name?.displayValue ?? opp.Name?.value ?? '—'}
											</TableCell>
											<TableCell className="text-slate-600">
												{opp.Account?.Name?.displayValue ?? opp.Account?.Name?.value ?? '—'}
											</TableCell>
											<TableCell>
												<StageBadge stage={opp.StageName?.value ?? null} />
											</TableCell>
											<TableCell className="text-slate-600">
												{formatCurrency(opp.Amount?.value ?? null)}
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
