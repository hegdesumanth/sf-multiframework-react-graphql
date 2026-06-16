import UPDATE_OPP_STAGE from './mutation/updateOpportunityStage.graphql?raw';
import { executeMutation } from '../graphqlClient';

interface UpdateOpportunityStageMutation {
	uiapi: {
		OpportunityUpdate: {
			Record: { Id: string, Name: { value: string }, StageName: { value: string } } | null;
		};
	};
}

export async function updateOpportunityStage(
	id: string,
	stageName: 'Closed Won' | 'Closed Lost',
): Promise<void> {
	await executeMutation<UpdateOpportunityStageMutation, { id: string; stage: string }>(
		UPDATE_OPP_STAGE,
		{ id, stage: stageName }
	);
}
