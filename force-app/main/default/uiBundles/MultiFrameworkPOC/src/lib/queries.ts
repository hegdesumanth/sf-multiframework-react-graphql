import { gql } from '@salesforce/sdk-data';

/**
 * CORE_PIPELINE_QUERY — default view.
 *
 * Returns up to 200 open Opportunity records (IsClosed = false), ordered by
 * CloseDate ascending. Each record is joined with its Account (Name) and
 * Owner (Name, SmallPhotoUrl) in a single network round-trip.
 *
 * Why this beats LWC @wire:
 *   In LWC, joining Opportunity + Account + User in one shot meant custom
 *   Apex or three @wire adapters with manual joining on the client. With
 *   sdk-data + GraphQL it is one declarative call; the joins are baked into
 *   the schema.
 *
 * Note the @optional directive on every record field. If FLS hides a field
 * for the running user, just that field is omitted from the response — the
 * query still succeeds. Without @optional, one inaccessible field throws
 * FIELD_NOT_ACCESSIBLE for the whole query and the dashboard goes blank.
 */
export const CORE_PIPELINE_QUERY = gql`
  query CorePipeline($first: Int!) {
    uiapi {
      query {
        Opportunity(
          first: $first
          where: { IsClosed: { eq: false } }
          orderBy: { CloseDate: { order: ASC } }
        ) {
          edges {
            node {
              Id
              Name @optional { value }
              Amount @optional { value }
              CloseDate @optional { value }
              StageName @optional { value }
              Probability @optional { value }
              IsClosed @optional { value }
              IsWon @optional { value }
              Account @optional {
                Name @optional { value }
              }
              Owner @optional {
                Name @optional { value }
                SmallPhotoUrl @optional { value }
              }
            }
          }
          totalCount
        }
      }
    }
  }
`;

/**
 * EXTENDED_PIPELINE_QUERY — extended view (toggle ON).
 *
 * Same as CORE_PIPELINE_QUERY plus three extra fields: Account.Industry,
 * Account.AnnualRevenue, and Owner.Title.
 *
 * Why it matters: this query is selected at runtime by usePipelineData()
 * based on the Dynamic Query toggle. LWC @wire cannot do this — @wire
 * requires a single, statically-known query string at compile time.
 * Multi-Framework + sdk-data lets us swap query strings on the fly, the
 * headline limitation this POC defeats.
 */
export const EXTENDED_PIPELINE_QUERY = gql`
  query ExtendedPipeline($first: Int!) {
    uiapi {
      query {
        Opportunity(
          first: $first
          where: { IsClosed: { eq: false } }
          orderBy: { CloseDate: { order: ASC } }
        ) {
          edges {
            node {
              Id
              Name @optional { value }
              Amount @optional { value }
              CloseDate @optional { value }
              StageName @optional { value }
              Probability @optional { value }
              IsClosed @optional { value }
              IsWon @optional { value }
              Account @optional {
                Name @optional { value }
                Industry @optional { value }
                AnnualRevenue @optional { value }
              }
              Owner @optional {
                Name @optional { value }
                Title @optional { value }
                SmallPhotoUrl @optional { value }
              }
            }
          }
          totalCount
        }
      }
    }
  }
`;

/**
 * OPTIONAL_FIELDS_DEMO_QUERY — proves @optional's value.
 *
 * Fetches 5 Accounts asking for two fields a typical user may lack FLS for:
 * Industry and AnnualRevenue.
 *
 * Why it matters: with @optional, fields the running user cannot access come
 * back as null instead of crashing the request. The OptionalFieldsDemo
 * panel inspects each field's resolution status and shows a colored dot.
 * Without @optional — i.e. the old lightning/uiGraphQLApi behavior — one
 * inaccessible field throws FIELD_NOT_ACCESSIBLE for the entire query and
 * the panel goes blank.
 */
export const OPTIONAL_FIELDS_DEMO_QUERY = gql`
  query OptionalFieldsDemo($first: Int!) {
    uiapi {
      query {
        Account(first: $first) {
          edges {
            node {
              Id
              Name @optional { value }
              Industry @optional { value }
              AnnualRevenue @optional { value }
            }
          }
        }
      }
    }
  }
`;
