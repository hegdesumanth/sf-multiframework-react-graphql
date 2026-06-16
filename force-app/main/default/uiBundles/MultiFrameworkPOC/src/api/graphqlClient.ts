/**
 * Thin GraphQL client: createDataSDK + data.graphql with centralized error handling.
 * Use with gql-tagged queries and generated operation types for type-safe calls.
 */
import { createDataSDK } from '@salesforce/platform-sdk/data';

export async function executeGraphQL<TData, TVariables>(
  query: string,
  variables?: TVariables
): Promise<TData> {
  const data = await createDataSDK();
  const response = await data.graphql?.query<TData, TVariables>({ query, variables });

  if (!response) {
    throw new Error('GraphQL response is undefined');
  }

  if (response?.errors?.length) {
    const msg = response.errors.map(e => e.message).join('; ');
    throw new Error(`GraphQL Error: ${msg}`);
  }

  if (response.data === undefined) {
    throw new Error('GraphQL response data is undefined');
  }

  return response.data;
}

export async function executeMutation<TData, TVariables>(
  mutation: string,
  variables?: TVariables
): Promise<TData> {
  const data = await createDataSDK();
  const response = await data.graphql?.mutate<TData, TVariables>({ mutation, variables });

  if (!response) {
    throw new Error('Mutation response is undefined');
  }

  if (response.errors?.length) {
    const msg = response.errors.map(e => e.message).join('; ');
    throw new Error(`GraphQL Mutation Error: ${msg}`);
  }

  if (response.data === undefined) {
    throw new Error('Mutation response data is undefined');
  }

  return response.data;
}
