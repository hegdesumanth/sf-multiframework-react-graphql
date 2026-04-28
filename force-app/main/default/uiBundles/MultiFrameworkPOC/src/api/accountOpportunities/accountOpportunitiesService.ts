import GET_ACCOUNTS_WITH_OPPS_QUERY from './query/getAccountsWithOpportunities.graphql?raw';
import { executeGraphQL } from '../graphqlClient';

interface SFField<T> {
	value: T | null;
	displayValue: string | null;
}

export interface ChildOpportunity {
	Id: string;
	Name: SFField<string> | null;
	StageName: SFField<string> | null;
	Amount: SFField<number> | null;
	CloseDate: SFField<string> | null;
	Probability: SFField<number> | null;
}

export interface AccountWithOpportunitiesNode {
	Id: string;
	Name: SFField<string> | null;
	Industry: SFField<string> | null;
	Type: SFField<string> | null;
	Phone: SFField<string> | null;
	Opportunities: {
		edges: Array<{ node: ChildOpportunity }>;
		totalCount: number;
	} | null;
}

interface GetAccountsWithOpportunitiesResponse {
	uiapi: {
		query: {
			Account: {
				edges: Array<{ node: AccountWithOpportunitiesNode }>;
				totalCount: number;
			};
		};
	};
}

export interface AccountsWithOpportunitiesResult {
	accounts: AccountWithOpportunitiesNode[];
	totalCount: number;
}

export async function getAccountsWithOpportunities(): Promise<AccountsWithOpportunitiesResult> {
	const data = await executeGraphQL<GetAccountsWithOpportunitiesResponse, Record<string, never>>(
		GET_ACCOUNTS_WITH_OPPS_QUERY
	);
	const conn = data.uiapi.query.Account;
	return {
		accounts: conn.edges.map(e => e.node),
		totalCount: conn.totalCount,
	};
}
