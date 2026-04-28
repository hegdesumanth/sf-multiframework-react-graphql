import GET_OPPORTUNITIES_QUERY from './query/getOpportunities.graphql?raw';
import { executeGraphQL } from '../graphqlClient';

interface SFField<T> {
	value: T | null;
	displayValue: string | null;
}

export interface OpportunityNode {
	Id: string;
	Name: SFField<string> | null;
	StageName: SFField<string> | null;
	Amount: SFField<number> | null;
	CloseDate: SFField<string> | null;
	Probability: SFField<number> | null;
	IsClosed: SFField<boolean> | null;
	IsWon: SFField<boolean> | null;
	Account: {
		Id: string;
		Name: SFField<string> | null;
		Industry: SFField<string> | null;
		Type: SFField<string> | null;
	} | null;
	Owner: {
		Id: string;
		Name: SFField<string> | null;
	} | null;
}

interface GetOpportunitiesResponse {
	uiapi: {
		query: {
			Opportunity: {
				edges: Array<{ node: OpportunityNode }>;
				totalCount: number;
			};
		};
	};
}

export interface OpportunityResult {
	opportunities: OpportunityNode[];
	totalCount: number;
}

export async function getOpportunities(): Promise<OpportunityResult> {
	const data = await executeGraphQL<GetOpportunitiesResponse, Record<string, never>>(
		GET_OPPORTUNITIES_QUERY
	);
	const conn = data.uiapi.query.Opportunity;
	return {
		opportunities: conn.edges.map(e => e.node),
		totalCount: conn.totalCount,
	};
}
