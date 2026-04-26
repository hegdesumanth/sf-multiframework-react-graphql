export type FieldValue<T> = { value: T; displayValue?: string | null } | null;

export interface OpportunityNode {
  Id: string;
  Name: FieldValue<string>;
  Amount: FieldValue<number>;
  CloseDate: FieldValue<string>;
  StageName: FieldValue<string>;
  Probability: FieldValue<number>;
  IsClosed: FieldValue<boolean>;
  IsWon: FieldValue<boolean>;
  Account: {
    Name: FieldValue<string>;
    Industry?: FieldValue<string>;
    AnnualRevenue?: FieldValue<number>;
  } | null;
  Owner: {
    Name: FieldValue<string>;
    Title?: FieldValue<string>;
    SmallPhotoUrl?: FieldValue<string>;
  } | null;
}

export interface Opportunity {
  Id: string;
  Name: string | null;
  Amount: number | null;
  CloseDate: string | null;
  StageName: string | null;
  Probability: number | null;
  IsClosed: boolean | null;
  IsWon: boolean | null;
  Account: {
    Name: string | null;
    Industry: string | null;
    AnnualRevenue: number | null;
  } | null;
  Owner: {
    Name: string | null;
    Title: string | null;
    SmallPhotoUrl: string | null;
  } | null;
}

export interface PipelineQueryResponse {
  uiapi: {
    query: {
      Opportunity: {
        edges: Array<{ node: OpportunityNode }>;
        totalCount: number;
      };
    };
  };
}

export interface OptionalAccountNode {
  Id: string;
  Name: FieldValue<string>;
  Industry?: FieldValue<string>;
  AnnualRevenue?: FieldValue<number>;
}

export interface OptionalFieldsQueryResponse {
  uiapi: {
    query: {
      Account: {
        edges: Array<{ node: OptionalAccountNode }>;
      };
    };
  };
}
