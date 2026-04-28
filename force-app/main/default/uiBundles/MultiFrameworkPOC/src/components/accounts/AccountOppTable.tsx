import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import {
	Table, TableBody, TableCell, TableHead,
	TableHeader, TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { AccountWithOpportunitiesNode, ChildOpportunity } from '@/api/accountOpportunities/accountOpportunitiesService';

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

function OpportunitiesSubTable({ opps }: { opps: ChildOpportunity[] }) {
	if (opps.length === 0) {
		return <p className="text-slate-500 text-xs py-2 px-4">No opportunities found.</p>;
	}
	return (
		<Table>
			<TableHeader>
				<TableRow className="border-slate-700 hover:bg-transparent">
					<TableHead className="text-slate-500 text-xs py-2">Opportunity</TableHead>
					<TableHead className="text-slate-500 text-xs py-2">Stage</TableHead>
					<TableHead className="text-slate-500 text-xs py-2">Amount</TableHead>
					<TableHead className="text-slate-500 text-xs py-2">Close Date</TableHead>
					<TableHead className="text-slate-500 text-xs py-2 text-right">Probability</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{opps.map(opp => (
					<TableRow key={opp.Id} className="border-slate-700 hover:bg-slate-700/30">
						<TableCell className="text-slate-200 text-xs py-2">
							{opp.Name?.displayValue ?? opp.Name?.value ?? '—'}
						</TableCell>
						<TableCell className="py-2">
							{opp.StageName?.value ? (
								<span className={cn(
									'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium text-white',
									STAGE_COLORS[opp.StageName.value] ?? 'bg-slate-500'
								)}>
									{opp.StageName.value}
								</span>
							) : <span className="text-slate-600 text-xs">—</span>}
						</TableCell>
						<TableCell className="text-slate-300 text-xs py-2">
							{formatCurrency(opp.Amount?.value ?? null)}
						</TableCell>
						<TableCell className="text-slate-300 text-xs py-2">
							{formatDate(opp.CloseDate?.value ?? null)}
						</TableCell>
						<TableCell className="text-slate-300 text-xs py-2 text-right">
							{opp.Probability?.value != null ? `${opp.Probability.value}%` : '—'}
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
}

function AccountRow({ account }: { account: AccountWithOpportunitiesNode }) {
	const [expanded, setExpanded] = useState(false);
	const opps = account.Opportunities?.edges.map(e => e.node) ?? [];
	const oppCount = account.Opportunities?.totalCount ?? 0;

	return (
		<>
			<TableRow
				className="border-slate-800 hover:bg-slate-800/50 cursor-pointer select-none"
				onClick={() => setExpanded(x => !x)}
			>
				<TableCell className="w-8 text-slate-500">
					{expanded
						? <ChevronDown className="h-4 w-4" />
						: <ChevronRight className="h-4 w-4" />}
				</TableCell>
				<TableCell className="font-medium text-white">
					{account.Name?.displayValue ?? account.Name?.value ?? '—'}
				</TableCell>
				<TableCell>
					{account.Industry?.displayValue ? (
						<Badge variant="outline" className="border-slate-600 text-slate-400 text-xs">
							{account.Industry.displayValue}
						</Badge>
					) : <span className="text-slate-600">—</span>}
				</TableCell>
				<TableCell className="text-slate-300">
					{account.Type?.displayValue ?? '—'}
				</TableCell>
				<TableCell className="text-slate-300">
					{account.Phone?.displayValue ?? account.Phone?.value ?? '—'}
				</TableCell>
				<TableCell className="text-right">
					<Badge
						variant={oppCount > 0 ? 'default' : 'outline'}
						className={cn(
							'text-xs',
							oppCount > 0
								? 'bg-indigo-600 hover:bg-indigo-600 text-white'
								: 'border-slate-700 text-slate-500'
						)}
					>
						{oppCount} {oppCount === 1 ? 'opp' : 'opps'}
					</Badge>
				</TableCell>
			</TableRow>

			{expanded && (
				<TableRow className="border-slate-800 hover:bg-transparent">
					<TableCell colSpan={6} className="bg-slate-800/40 px-8 py-0">
						<OpportunitiesSubTable opps={opps} />
					</TableCell>
				</TableRow>
			)}
		</>
	);
}

function LoadingRows() {
	return (
		<>
			{Array.from({ length: 10 }).map((_, i) => (
				<TableRow key={i} className="border-slate-800">
					{Array.from({ length: 6 }).map((_, j) => (
						<TableCell key={j}><Skeleton className="h-4 w-full bg-slate-800" /></TableCell>
					))}
				</TableRow>
			))}
		</>
	);
}

interface Props {
	accounts: AccountWithOpportunitiesNode[];
	loading: boolean;
}

export function AccountOppTable({ accounts, loading }: Props) {
	return (
		<div className="rounded-lg border border-slate-800 bg-slate-900">
			<Table>
				<TableHeader>
					<TableRow className="border-slate-800 hover:bg-transparent">
						<TableHead className="w-8" />
						<TableHead className="text-slate-400 font-semibold">Account</TableHead>
						<TableHead className="text-slate-400 font-semibold">Industry</TableHead>
						<TableHead className="text-slate-400 font-semibold">Type</TableHead>
						<TableHead className="text-slate-400 font-semibold">Phone</TableHead>
						<TableHead className="text-slate-400 font-semibold text-right">Opportunities</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{loading ? (
						<LoadingRows />
					) : accounts.length === 0 ? (
						<TableRow className="border-slate-800">
							<TableCell colSpan={6} className="text-center text-slate-500 py-12">
								No accounts found.
							</TableCell>
						</TableRow>
					) : (
						accounts.map(account => <AccountRow key={account.Id} account={account} />)
					)}
				</TableBody>
			</Table>
		</div>
	);
}
