import { useEffect, useState } from 'react';
import { executeGraphQL } from '@/api/graphqlClient';
import {
  CORE_PIPELINE_QUERY,
  EXTENDED_PIPELINE_QUERY,
} from '@/lib/queries';
import type {
  Opportunity,
  OpportunityNode,
  PipelineQueryResponse,
} from '@/types/pipeline';

const PAGE_SIZE = 200;

function flatten(node: OpportunityNode): Opportunity {
  return {
    Id: node.Id,
    Name: node.Name?.value ?? null,
    Amount: node.Amount?.value ?? null,
    CloseDate: node.CloseDate?.value ?? null,
    StageName: node.StageName?.value ?? null,
    Probability: node.Probability?.value ?? null,
    IsClosed: node.IsClosed?.value ?? null,
    IsWon: node.IsWon?.value ?? null,
    Account: node.Account
      ? {
          Name: node.Account.Name?.value ?? null,
          Industry: node.Account.Industry?.value ?? null,
          AnnualRevenue: node.Account.AnnualRevenue?.value ?? null,
        }
      : null,
    Owner: node.Owner
      ? {
          Name: node.Owner.Name?.value ?? null,
          Title: node.Owner.Title?.value ?? null,
          SmallPhotoUrl: node.Owner.SmallPhotoUrl?.value ?? null,
        }
      : null,
  };
}

interface PipelineState {
  opportunities: Opportunity[];
  loading: boolean;
  error: Error | null;
}

const INITIAL_STATE: PipelineState = {
  opportunities: [],
  loading: true,
  error: null,
};

export function usePipelineData(isExtended: boolean) {
  const [state, setState] = useState<PipelineState>(INITIAL_STATE);
  const [refetchToken, setRefetchToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    // Reset loading/error so the UI shows a spinner on toggle/refetch instead
    // of stale rows. React's set-state-in-effect rule targets data-library
    // use cases; for a hand-rolled fetch this is the simplest correct pattern.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState(s => ({ ...s, loading: true, error: null }));

    const query = isExtended ? EXTENDED_PIPELINE_QUERY : CORE_PIPELINE_QUERY;

    executeGraphQL<PipelineQueryResponse, { first: number }>(query, {
      first: PAGE_SIZE,
    })
      .then(data => {
        if (cancelled) return;
        const edges = data.uiapi.query.Opportunity.edges ?? [];
        setState({
          opportunities: edges.map(e => flatten(e.node)),
          loading: false,
          error: null,
        });
      })
      .catch(err => {
        if (cancelled) return;
        setState(s => ({
          ...s,
          loading: false,
          error: err instanceof Error ? err : new Error(String(err)),
        }));
      });

    return () => {
      cancelled = true;
    };
  }, [isExtended, refetchToken]);

  return {
    ...state,
    refetch: () => setRefetchToken(t => t + 1),
  };
}
