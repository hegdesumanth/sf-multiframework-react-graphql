# Technical Requirements Document (TRD)
## Sales Pipeline Intelligence Dashboard
### Salesforce Multi-Framework POC

---

**Document Version:** 1.0
**Status:** Draft
**Author:** Sumanth Shyam Hegde
**Organization:** ABSYZ
**Date:** April 2026

---

## 1. System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    Salesforce Scratch Org                       │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              Agentforce 360 Platform                     │   │
│  │                                                          │   │
│  │   ┌──────────────────┐     ┌────────────────────────┐   │   │
│  │   │   UI Bundle       │     │   Salesforce Platform  │   │   │
│  │   │   (React App)     │────▶│   GraphQL API (UIAPI)  │   │   │
│  │   │                  │     │                        │   │   │
│  │   │  • App.jsx        │     │  • Opportunity SObject │   │   │
│  │   │  • Components     │     │  • Account SObject     │   │   │
│  │   │  • Hooks          │     │  • User SObject        │   │   │
│  │   │  • Queries        │◀────│                        │   │   │
│  │   └──────────────────┘     └────────────────────────┘   │   │
│  │            │                                             │   │
│  │   ┌────────▼──────────┐                                  │   │
│  │   │  @salesforce/     │                                  │   │
│  │   │  sdk-data         │                                  │   │
│  │   │  (Data SDK)       │                                  │   │
│  │   └───────────────────┘                                  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Authentication: Handled automatically by createDataSDK()       │
│  Security: Platform-native (FLS, CRUD, Sharing Rules apply)     │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Technology Stack

| Layer | Technology | Version | Justification |
|---|---|---|---|
| Framework | React | 18.x | Multi-Framework beta supports React 18 |
| Build Tool | Vite | 5.x | Preconfigured in scaffold template |
| Test Runner | Vitest | Latest | Preconfigured in scaffold template |
| Data Layer | @salesforce/sdk-data | Beta | Official Salesforce Data SDK for GraphQL |
| UI Components | shadcn/ui | Latest | Zinc theme, composable, no runtime dependency |
| Styling | Tailwind CSS | 3.x | Utility-first, dark mode native |
| Charts | Recharts | 2.x | React-native charting, composable |
| Icons | lucide-react | 0.383.x | Lightweight, tree-shakeable |
| Language | JavaScript (JSX) | ES2022+ | Blog-friendlier than TypeScript for readers |
| Platform Runtime | Salesforce Multi-Framework | Beta | Agentforce 360 Platform hosting |

---

## 3. Project Structure

```
force-app/main/default/uiBundles/PipelineDashboard/
│
├── src/
│   ├── components/
│   │   ├── ui/                        ← shadcn generated components
│   │   │   ├── card.jsx
│   │   │   ├── badge.jsx
│   │   │   ├── table.jsx
│   │   │   ├── tabs.jsx
│   │   │   ├── progress.jsx
│   │   │   ├── skeleton.jsx
│   │   │   ├── avatar.jsx
│   │   │   └── tooltip.jsx
│   │   │
│   │   ├── KPICard.jsx                ← FR-01: Single KPI stat card
│   │   ├── OpportunityTable.jsx       ← FR-02: Main data table
│   │   ├── StageFunnel.jsx            ← FR-03: Recharts bar chart
│   │   ├── DynamicQueryToggle.jsx     ← FR-04: Toggle + query switch logic
│   │   └── OptionalFieldsDemo.jsx     ← FR-05: Optional fields explainer
│   │
│   ├── hooks/
│   │   └── usePipelineData.js         ← All GraphQL fetches, loading/error state
│   │
│   ├── lib/
│   │   ├── queries.js                 ← All GraphQL query strings (named exports)
│   │   └── formatters.js             ← Currency, date, initials helpers
│   │
│   ├── App.jsx                        ← Root layout, Tabs, SDK init
│   ├── main.jsx                       ← Entry point
│   └── index.css                      ← Tailwind directives
│
├── package.json
├── vite.config.js
├── vitest.config.js
├── tailwind.config.js
├── postcss.config.js
└── PipelineDashboard.app-meta.xml     ← Salesforce metadata (App Launcher entry)
```

---

## 4. GraphQL API Design

### 4.1 SDK Initialization

```javascript
// App.jsx — initialized once at root, passed via context or imported per hook
import { createDataSDK } from '@salesforce/sdk-data';
const sdk = createDataSDK();
```

Authentication is handled entirely by `createDataSDK()`. No token management, no OAuth flows in application code.

### 4.2 Query 1 — Core Pipeline Data (Default View)

**Purpose:** Fetches the minimum required fields for KPI cards, table, and funnel chart.
**Triggered:** On component mount and when Extended View toggle is OFF.

```graphql
query CorePipelineQuery {
  uiapi {
    query {
      Opportunity(
        where: { IsClosed: { eq: false } }
        orderBy: { CloseDate: { order: ASC } }
        first: 200
      ) {
        edges {
          node {
            Id
            Name { value }
            Amount { value }
            StageName { value }
            CloseDate { value }
            Probability { value }
            IsClosed { value }
            IsWon { value }
            Account {
              Name { value }
            }
            Owner {
              Name { value }
              SmallPhotoUrl { value }
            }
          }
        }
      }
    }
  }
}
```

**Why this beats @wire:** A single query returns Opportunity + related Account + related User in one network call. In LWC, this requires either a custom Apex method or three separate `@wire` adapters with manual joining logic.

### 4.3 Query 2 — Extended Pipeline Data (Extended View)

**Purpose:** Runtime extension of Query 1 with additional fields. Constructed dynamically in JavaScript.
**Triggered:** When Extended View toggle is ON.

```graphql
query ExtendedPipelineQuery {
  uiapi {
    query {
      Opportunity(
        where: { IsClosed: { eq: false } }
        orderBy: { CloseDate: { order: ASC } }
        first: 200
      ) {
        edges {
          node {
            Id
            Name { value }
            Amount { value }
            StageName { value }
            CloseDate { value }
            Probability { value }
            IsClosed { value }
            IsWon { value }
            Account {
              Name { value }
              Industry { value }        # ← Extended field
              AnnualRevenue { value }   # ← Extended field
            }
            Owner {
              Name { value }
              SmallPhotoUrl { value }
              Title { value }           # ← Extended field
            }
          }
        }
      }
    }
  }
}
```

**Key Technical Point:** The query string is assembled at runtime by `usePipelineData.js` based on the `isExtended` boolean flag. The LWC `@wire` decorator cannot do this — it requires a static query known at compile time.

### 4.4 Query 3 — Optional Fields Demo

**Purpose:** Demonstrates query resilience when a user may not have FLS access to a field.
**Triggered:** On mount of `OptionalFieldsDemo.jsx`. Fetches 5 Accounts only.

```graphql
query OptionalFieldsDemo {
  uiapi {
    query {
      Account(first: 5) {
        edges {
          node {
            Id
            Name { value }
            Industry @optional { value }        # ← Will not throw if inaccessible
            AnnualRevenue @optional { value }   # ← Will not throw if inaccessible
          }
        }
      }
    }
  }
}
```

**Key Technical Point:** The `@optional` directive (available in `lightning/graphql` Winter '26 and `@salesforce/sdk-data`) prevents query failure when the user lacks FLS access. The old `lightning/uiGraphQLApi` would throw a `FIELD_NOT_ACCESSIBLE` error in this scenario, crashing the entire component.

---

## 5. Component Specifications

### 5.1 KPICard.jsx

**Inputs (props):**
| Prop | Type | Description |
|---|---|---|
| `title` | string | Card label |
| `value` | string | Formatted display value |
| `icon` | ReactNode | lucide-react icon |
| `loading` | boolean | Controls skeleton display |

**Behavior:** Shows `<Skeleton>` when `loading` is true. Animates in with `opacity-0 → opacity-100` CSS transition on mount. No internal data fetching.

**Max lines:** 60

---

### 5.2 OpportunityTable.jsx

**Inputs (props):**
| Prop | Type | Description |
|---|---|---|
| `opportunities` | Array | Processed opportunity records |
| `isExtended` | boolean | Whether to show extended columns |
| `loading` | boolean | Controls skeleton rows |

**Internal state:**
- `searchTerm` — string, controls name/account text filter
- `activeStages` — string[], controls multi-select stage filter

**Filtering:** Purely client-side. No re-fetch on filter change.

**Column definitions:**

| Column | Component | Notes |
|---|---|---|
| Name | text | Truncated at 30 chars |
| Account | text | From nested Account.Name |
| Stage | `<Badge>` | Color-coded per stage |
| Amount | text | `formatters.currency()` |
| Close Date | text | `formatters.date()` |
| Probability | `<Progress>` | 0–100 value |
| Owner | `<Avatar>` + `<Tooltip>` | Initials fallback if no photo |
| Industry | text + `<Badge variant="outline">Extended</Badge>` | Extended only |
| Annual Revenue | text + `<Badge variant="outline">Extended</Badge>` | Extended only |
| Owner Title | text + `<Badge variant="outline">Extended</Badge>` | Extended only |

**Max lines:** 150

---

### 5.3 StageFunnel.jsx

**Inputs (props):**
| Prop | Type | Description |
|---|---|---|
| `opportunities` | Array | Full opportunity list for aggregation |
| `loading` | boolean | Controls skeleton |

**Internal computation:** Groups opportunities by `StageName`, sums `Amount` per stage. Computed with `useMemo`.

**Chart config:**
- Library: Recharts `BarChart` (horizontal, `layout="vertical"`)
- Fill: LinearGradient from `#6366f1` (indigo-500) to `#312e81` (indigo-900)
- Labels: Custom label showing stage name + formatted currency

**Max lines:** 80

---

### 5.4 DynamicQueryToggle.jsx

**Inputs (props):**
| Prop | Type | Description |
|---|---|---|
| `isExtended` | boolean | Current toggle state |
| `onToggle` | function | Callback to parent (App.jsx) |

**Behavior:** Renders a toggle switch. On change, calls `onToggle()`. Parent re-fetches with appropriate query.

**Blog Feature:** Includes a comment block showing:

```javascript
// ❌ LWC @wire limitation — query is static, cannot be changed at runtime:
// @wire(graphql, { query: CORE_QUERY }) pipelineData;
// You cannot do: if (isExtended) { this.query = EXTENDED_QUERY; }
// @wire does not react to query string changes — you'd need a full Apex method swap.

// ✅ Multi-Framework approach — query string constructed at runtime:
// const query = isExtended ? EXTENDED_PIPELINE_QUERY : CORE_PIPELINE_QUERY;
// const data = await sdk.fetch(query);
```

**Max lines:** 50

---

### 5.5 OptionalFieldsDemo.jsx

**Inputs:** None (self-contained, fetches its own data)

**Internal state:**
- `fieldStatuses` — object mapping field names to `resolved | skipped | loading`

**Behavior:** On mount, fires Query 3. After response, inspects each optional field's value. If `null` and no error thrown, marks as `skipped`. If value present, marks as `resolved`.

**UI:** Status indicator per field using color-coded dot (green = resolved, yellow = skipped). Inline `<code>` block showing `@optional` syntax.

**Blog Feature:** Includes a comment block showing:

```javascript
// ❌ Old lightning/uiGraphQLApi behavior:
// If Industry was inaccessible, the entire query threw:
// { message: "FIELD_NOT_ACCESSIBLE", errorCode: "INSUFFICIENT_ACCESS" }
// The component crashed. There was no way to say "skip this field if inaccessible".

// ✅ New @optional directive behavior:
// Industry @optional { value }
// If inaccessible: field is simply omitted from the response. Query succeeds.
// If accessible: field resolves normally.
```

**Max lines:** 80

---

## 6. Custom Hook: usePipelineData.js

**Returns:**
```javascript
{
  opportunities: Array,   // processed, flattened opportunity records
  loading: boolean,
  error: string | null,
  refetch: function       // callable to manually re-trigger fetch
}
```

**Accepts:**
```javascript
usePipelineData(isExtended: boolean)
```

**Behavior:**
- On mount and when `isExtended` changes, selects the appropriate query constant
- Calls `sdk.fetch(query)` via the Data SDK
- Flattens GraphQL edges/node structure into a plain array for components
- Exposes `loading` and `error` states
- `refetch` allows manual refresh without remount

---

## 7. Utility Files

### 7.1 lib/queries.js

Exports all three query strings as named constants. No logic — pure string exports.

```javascript
export const CORE_PIPELINE_QUERY = `query CorePipelineQuery { ... }`;
export const EXTENDED_PIPELINE_QUERY = `query ExtendedPipelineQuery { ... }`;
export const OPTIONAL_FIELDS_DEMO_QUERY = `query OptionalFieldsDemo { ... }`;
```

### 7.2 lib/formatters.js

```javascript
export const currency = (value) => 
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', 
    notation: 'compact' }).format(value ?? 0);

export const date = (isoString) => 
  new Date(isoString).toLocaleDateString('en-US', 
    { month: 'short', day: 'numeric', year: 'numeric' });

export const initials = (fullName) => 
  fullName?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() ?? '??';
```

---

## 8. Salesforce Metadata

### 8.1 App Metadata (App Launcher Entry)

```xml
<!-- PipelineDashboard.app-meta.xml -->
<?xml version="1.0" encoding="UTF-8"?>
<UIBundle xmlns="http://soap.sforce.com/2006/04/metadata">
    <label>Pipeline Dashboard</label>
    <description>Sales Pipeline Intelligence Dashboard — Multi-Framework POC</description>
    <type>Internal</type>
</UIBundle>
```

### 8.2 Permission Requirements

No custom permissions required. Standard Salesforce object access applies:
- Read on Opportunity
- Read on Account
- Read on User

FLS restrictions are handled gracefully by the `@optional` directive where applicable.

---

## 9. Data Flow Diagram

```
User opens app in App Launcher
        │
        ▼
App.jsx initializes createDataSDK()
        │
        ▼
usePipelineData(isExtended=false) fires
        │
        ▼
CORE_PIPELINE_QUERY sent to Salesforce GraphQL API
        │
        ├─▶ Opportunity data returned
        ├─▶ Account.Name (nested) returned
        └─▶ Owner.Name + SmallPhotoUrl (nested) returned
        │
        ▼
Hook flattens edges/node structure into plain array
        │
        ├─▶ KPICard ×4 — compute aggregates from array
        ├─▶ OpportunityTable — render rows
        └─▶ StageFunnel — group by stage, sum amounts
        │
User clicks "Extended View" toggle
        │
        ▼
isExtended=true → usePipelineData re-runs with EXTENDED_PIPELINE_QUERY
        │
        ▼
Additional fields (Industry, AnnualRevenue, Title) added to response
        │
        ▼
OpportunityTable renders 3 new "Extended" tagged columns
```

---

## 10. Stage Badge Color Mapping

| Stage Name | Badge Color Class |
|---|---|
| Prospecting | `bg-slate-500` |
| Qualification | `bg-blue-500` |
| Needs Analysis | `bg-cyan-500` |
| Value Proposition | `bg-teal-500` |
| Id. Decision Makers | `bg-yellow-500` |
| Perception Analysis | `bg-orange-500` |
| Proposal/Price Quote | `bg-purple-500` |
| Negotiation/Review | `bg-pink-500` |
| Closed Won | `bg-green-500` |
| Closed Lost | `bg-red-500` |

---

## 11. KPI Computation Logic

All four KPI values are computed client-side from the raw opportunity array:

| KPI | Formula |
|---|---|
| Total Open Pipeline | `SUM(Amount)` where `IsClosed = false` |
| Weighted Pipeline | `SUM(Amount × Probability / 100)` where `IsClosed = false` |
| Average Deal Size | `Total Open Pipeline / COUNT(open opportunities)` |
| Win Rate % | `COUNT(IsWon = true) / COUNT(IsClosed = true) × 100` |

Note: Win Rate uses closed opportunities (both Won and Lost) as the denominator. Open opportunities are excluded from this calculation.

---

## 12. Deployment Steps

```bash
# 1. Build the React app
cd force-app/main/default/uiBundles/PipelineDashboard
npm run build

# 2. Push all metadata to scratch org
cd ../../../../..
sf project deploy start --target-org MultiFrameworkPOC

# 3. Open the org and find the app
sf org open --target-org MultiFrameworkPOC
# Search "Pipeline Dashboard" in App Launcher
```

---

## 13. Known Beta Limitations

| Limitation | Impact on POC | Workaround |
|---|---|---|
| No production org deployment | Demo only in scratch org | Use scratch org for all blog screenshots |
| No Lightning App Builder support | Cannot drag component onto record pages | Launch via App Launcher only |
| English-only orgs | N/A for this POC | Scratch org set to en_US |
| No micro-frontend embedding (pilot Spring 2027) | Cannot embed React panel inside existing Lightning page | Standalone app only |
| Some platform APIs unavailable in beta | Avoid non-UIAPI calls | All queries use UIAPI GraphQL only |

---

## 14. React vs LWC — Technical Comparison

| Capability | React (Multi-Framework) | LWC (Traditional) |
|---|---|---|
| Dynamic query at runtime | ✅ String construction in JS | ❌ `@wire` requires static query |
| Optional fields (FLS resilience) | ✅ `@optional` directive | ❌ Query throws on inaccessible field |
| Relational data in one call | ✅ Nested GraphQL | ⚠️ Apex or multiple `@wire` adapters |
| Third-party chart library | ✅ npm install, use directly | ⚠️ Static resource, manual loading |
| Component reuse outside SF | ✅ Standard React component | ❌ Salesforce-only runtime |
| Tailwind CSS | ✅ Full support | ⚠️ Must override SLDS, conflicts |
| shadcn/ui | ✅ Full support | ❌ Not compatible with LWS |
| TypeScript | ✅ Full support | ✅ Supported (Spring '26+) |
| `@wire` data caching | ❌ Manual with SDK | ✅ Built-in via LDS |
| Base Lightning Components | ❌ Not available | ✅ 80+ components |
| App Builder integration | ❌ Beta limitation | ✅ Full drag-and-drop |

---

*End of TRD v1.0*
