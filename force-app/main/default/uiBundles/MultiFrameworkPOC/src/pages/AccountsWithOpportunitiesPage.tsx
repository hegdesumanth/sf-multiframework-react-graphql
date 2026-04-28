import { useEffect, useState } from 'react';
import {
	getAccountsWithOpportunities,
	type AccountWithOpportunitiesNode,
} from '@/api/accountOpportunities/accountOpportunitiesService';
import { AccountOppTable } from '@/components/accounts/AccountOppTable';

export default function AccountsWithOpportunitiesPage() {
	const [accounts, setAccounts] = useState<AccountWithOpportunitiesNode[]>([]);
	const [totalCount, setTotalCount] = useState(0);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let cancelled = false;
		getAccountsWithOpportunities()
			.then(result => {
				if (!cancelled) {
					setAccounts(result.accounts);
					setTotalCount(result.totalCount);
					setLoading(false);
				}
			})
			.catch(err => {
				if (!cancelled) {
					setError(err instanceof Error ? err.message : 'Failed to load accounts');
					setLoading(false);
				}
			});
		return () => { cancelled = true; };
	}, []);

	return (
		<div className="min-h-screen bg-slate-950 text-slate-50 p-6">
			<div className="max-w-7xl mx-auto">
				<div className="mb-6">
					<h1 className="text-2xl font-bold text-white">Accounts &amp; Opportunities</h1>
					<p className="text-slate-400 text-sm mt-1">
						Parent-child GraphQL query — equivalent to{' '}
						<code className="font-mono text-indigo-400 text-xs bg-slate-800 px-1 py-0.5 rounded">
							SELECT Id, Name, (SELECT Id, Name FROM Opportunities) FROM Account
						</code>
						, resolved in a single round trip. Click a row to expand its opportunities.
					</p>
					{!loading && !error && (
						<p className="text-slate-500 text-xs mt-2">{totalCount} total accounts · showing first 10</p>
					)}
				</div>

				{error && (
					<div className="rounded-lg border border-red-800 bg-red-950/50 p-4 text-red-400 text-sm mb-6">
						{error}
					</div>
				)}

				<AccountOppTable accounts={accounts} loading={loading} />
			</div>
		</div>
	);
}
