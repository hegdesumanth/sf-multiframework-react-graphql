# Sales Pipeline Intelligence Dashboard
### Salesforce Multi-Framework + React + GraphQL POC

A proof-of-concept Salesforce app that runs a **React 19 SPA natively inside a Salesforce scratch org** — no LWC, no Apex, no SLDS. Built on the [Salesforce Multi-Framework](https://developer.salesforce.com/docs/atlas.en-us.platform_connect.meta/platform_connect/ui_bundle_intro.htm) (open beta) using `@salesforce/sdk-data` for GraphQL, shadcn/ui for components, and Tailwind CSS v4 for styling.

This codebase is the companion repo for the **ABSYZ blog post series** on Salesforce Multi-Framework.

> 📹 **Building this from scratch?** Follow the [Video Course Guide](./VIDEO_COURSE_GUIDE/README.md) — step-by-step from org setup to deployed app.

---

## What This Demonstrates

| # | Feature | Why It Matters |
|---|---|---|
| 1 | **React running natively on Salesforce** | Launch from App Launcher — no Experience Cloud, no iframes |
| 2 | **GraphQL via `@salesforce/sdk-data`** | Replaces `@wire` — one call returns Opportunity + Account + User |
| 3 | **Dynamic query construction at runtime** | Toggle swaps the query string live — impossible with `@wire`'s static requirement |
| 4 | **`@optional` fields for FLS resilience** | Inaccessible fields are omitted gracefully instead of crashing the whole query |
| 5 | **Third-party npm ecosystem (Recharts, shadcn/ui)** | No static-resource gymnastics — just `npm install` and import |

---

## React + Multi-Framework vs LWC — Comparison

| Capability | React (Multi-Framework) | LWC (Traditional) |
|---|---|---|
| Dynamic query at runtime | ✅ String construction in JS/TS | ❌ `@wire` requires a static query |
| Optional fields (FLS resilience) | ✅ `@optional` directive | ❌ Query throws `FIELD_NOT_ACCESSIBLE` |
| Relational data in one call | ✅ Nested GraphQL | ⚠️ Apex or multiple `@wire` adapters |
| Third-party chart library | ✅ `npm install`, use directly | ⚠️ Static resource, manual loading |
| Component reuse outside Salesforce | ✅ Standard React component | ❌ Salesforce-only runtime |
| Tailwind CSS | ✅ Full support | ⚠️ Must fight SLDS specificity |
| shadcn/ui | ✅ Full support | ❌ Not compatible with Lightning Web Security |
| TypeScript | ✅ Full support + codegen | ✅ Supported (Spring '26+) |
| `@wire` data caching | ❌ Manual with SDK | ✅ Built-in via Lightning Data Service |
| Base Lightning Components | ❌ Not available | ✅ 80+ components |
| App Builder integration | ❌ Beta limitation | ✅ Full drag-and-drop |

---

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | React | 19.2 |
| Language | TypeScript | ~5.9 |
| Build | Vite | 7.x |
| Styling | Tailwind CSS v4 (`@tailwindcss/vite`) | 4.x |
| UI Components | shadcn/ui (new-york, neutral) + Radix UI | latest |
| Charts | Recharts | 3.x |
| Icons | lucide-react | 0.562 |
| Router | React Router | 7.x |
| Data SDK | `@salesforce/sdk-data` | ^1.120 |
| Tests | Vitest + Playwright | 4.x / 1.49 |
| Toasts | Sonner | 1.7 |
| Date utils | date-fns | 4.x |

---

## Project Structure

```
sf-multiframework-react-graphql/
├── config/
│   └── project-scratch-def.json       # Scratch org definition
├── docs/
│   ├── PRD_SalesPipelineDashboard.md  # Product spec
│   └── TRD_SalesPipelineDashboard.md  # Technical spec
├── force-app/main/default/uiBundles/
│   └── MultiFrameworkPOC/             # ← ALL React work lives here
│       ├── package.json               # React app dependencies
│       ├── vite.config.ts
│       ├── tsconfig.json
│       ├── codegen.yml                # GraphQL codegen config
│       └── src/
│           ├── app.tsx                # BrowserRouter root
│           ├── appLayout.tsx          # Shell: header / nav / <Outlet />
│           ├── routes.tsx             # Single route registry
│           ├── styles/global.css      # Tailwind 4 directives + theme tokens
│           ├── lib/
│           │   ├── queries.ts         # gql-tagged query constants (3 queries)
│           │   ├── formatters.ts      # currency, date, initials helpers
│           │   ├── kpi.ts             # KPI computation (pure functions)
│           │   └── utils.ts           # cn() helper
│           ├── hooks/
│           │   ├── usePipelineData.ts # Picks query, calls executeGraphQL, flattens edges
│           │   └── useOpportunityFilter.ts
│           ├── api/
│           │   ├── graphqlClient.ts   # executeGraphQL<TData,TVars> wrapper
│           │   └── graphql-operations-types.ts  # GENERATED — do not hand-edit
│           ├── components/
│           │   ├── ui/                # shadcn primitives
│           │   └── pipeline/
│           │       ├── KPICard.tsx
│           │       ├── OpportunityTable.tsx
│           │       ├── StageFunnel.tsx
│           │       ├── DynamicQueryToggle.tsx
│           │       └── OptionalFieldsDemo.tsx
│           ├── pages/
│           │   └── PipelineDashboard.tsx
│           └── types/
│               └── pipeline.ts
├── scripts/
│   ├── org-setup.mjs                  # Full deploy pipeline
│   └── sf-project-setup.mjs          # Install + build + dev
├── sfdx-project.json
└── package.json                       # Root — SFDX tooling only
```

---

## Prerequisites

Before you clone and run this project you need:

- **Node.js ≥ 22** — check with `node --version`
- **Salesforce CLI** — [install guide](https://developer.salesforce.com/docs/atlas.en-us.sfdx_setup.meta/sfdx_setup/sfdx_setup_intro.htm)
  ```bash
  npm install -g @salesforce/cli
  sf --version   # confirm install
  ```
- **Salesforce Dev Hub** with Multi-Framework (open beta) enabled
  - In your Dev Hub org: Setup → Multi-Framework → Enable
- **A connected Dev Hub** authenticated in the CLI:
  ```bash
  sf org login web --set-default-dev-hub --alias DevHub
  ```

---

## Setup & Run (Fork / Clone)

### 1. Clone the repo

```bash
git clone https://github.com/Dark-Milton/sf-multiframework-react-graphql.git
cd sf-multiframework-react-graphql
```

### 2. Install root dependencies (SFDX tooling)

```bash
npm install
```

### 3. Create a scratch org

```bash
sf org create scratch \
  --definition-file config/project-scratch-def.json \
  --alias pipeline-demo \
  --set-default \
  --duration-days 30
```

> The scratch org needs the **Multi-Framework** beta feature enabled. If you see an error, make sure your Dev Hub has the beta turned on (Setup → Multi-Framework → Enable).

### 4. Install React app dependencies

```bash
cd force-app/main/default/uiBundles/MultiFrameworkPOC
npm install
```

### 5. Fetch the GraphQL schema from your scratch org

```bash
npm run graphql:schema
```

This writes `src/api/schema.graphql` — required for linting and codegen.

### 6. Run codegen (regenerate typed operations)

```bash
npm run graphql:codegen
```

### 7. Build the React app

```bash
npm run build
```

### 8. Deploy to the scratch org

```bash
# From the repo root:
cd ../../../../..    # back to repo root
sf project deploy start \
  --source-dir force-app/main/default/uiBundles \
  --target-org pipeline-demo
```

### 9. Open the app

```bash
sf org open --target-org pipeline-demo
```

Navigate to the **App Launcher** and search for **"Pipeline Dashboard"**.

---

## One-Command Setup (Alternative)

The repo ships a full setup script that does steps 3–8 in one shot:

```bash
# From the repo root — runs login, build, deploy, schema fetch, codegen, and dev server
npm run setup -- --target-org pipeline-demo --yes
```

Run `npm run setup -- --help` for all flags.

---

## Local Dev Server (no org required for UI work)

You can iterate on the React app against mock/static data without a live org connection:

```bash
cd force-app/main/default/uiBundles/MultiFrameworkPOC
npm run dev
```

Opens at **http://localhost:5173**. GraphQL calls that require the org will fail in this mode — use it for layout and component work only.

---

## Available Scripts

All scripts below run from inside the **UI Bundle directory** (`force-app/main/default/uiBundles/MultiFrameworkPOC/`):

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server at http://localhost:5173 |
| `npm run build` | TypeScript check + Vite production build |
| `npm run lint` | ESLint (must pass before deploy) |
| `npm run test` | Vitest unit tests |
| `npm run preview` | Serve the production build locally |
| `npm run graphql:schema` | Fetch `schema.graphql` from the authenticated org |
| `npm run graphql:codegen` | Regenerate `src/api/graphql-operations-types.ts` |

**From the repo root:**

| Command | Description |
|---|---|
| `npm run sf-project-setup` | Install UI Bundle deps + build + start dev server |
| `npm run setup -- --target-org <alias>` | Full pipeline: login → deploy → schema → codegen → dev |

---

## The Five Dashboard Sections

### KPI Cards
Four computed metrics — Total Open Pipeline, Weighted Pipeline, Average Deal Size, Win Rate. Computed client-side from the GraphQL response. Skeleton loading state while data fetches.

### Stage Funnel
Horizontal Recharts `BarChart` grouped by `StageName`. Indigo gradient (`#6366f1 → #312e81`). All stage badge colors defined in a single map in `src/lib/formatters.ts`.

### Dynamic Query Toggle
Flips between `CORE_PIPELINE_QUERY` and `EXTENDED_PIPELINE_QUERY` at runtime. The toggle is the live demo of the headline Multi-Framework advantage — see the `// ❌ LWC @wire …` vs `// ✅ Multi-Framework …` comment block in `DynamicQueryToggle.tsx`.

### Opportunity Table
Filterable, sortable table. Extended columns (Industry, Annual Revenue, Owner Title) appear as `<Badge variant="outline">Extended</Badge>` when the toggle is ON. Filtering is purely client-side — no re-fetch.

### Optional Fields Demo
Fires `OPTIONAL_FIELDS_DEMO_QUERY` on mount. Classifies `Industry` and `AnnualRevenue` as `resolved` (green dot), `skipped` (yellow dot — FLS blocked), or `error` (red dot). The `@optional` directive is what makes this possible — see the comment block in `OptionalFieldsDemo.tsx`.

---

## Design Tokens

| Token | Value |
|---|---|
| Background | `slate-950` |
| Accent | `indigo-500` |
| Chart gradient | `#6366f1 → #312e81` |
| Body font | Inter |
| shadcn style | new-york / neutral |

Dark theme only — SLDS is not used anywhere in this project.

---

## Constraints

- **Read-only** — no GraphQL mutations. This is a display POC.
- **Scratch org only** — Multi-Framework is in beta; production deploy is unsupported.
- **No SLDS** — zero `slds-*` classes or `lightning/*` imports.
- **No `@wire`, no Apex** — all data via `@salesforce/sdk-data` GraphQL.
- **No `fetch()` / `axios` for Salesforce data** — only `sdk.graphql` via the `executeGraphQL` wrapper.
- **1280px+ viewport** — mobile is out of scope for this POC.

---

## GraphQL Queries

Three named queries live in `src/lib/queries.ts`:

| Constant | Triggered by | Purpose |
|---|---|---|
| `CORE_PIPELINE_QUERY` | Mount + toggle OFF | Open Opportunities + Account.Name + Owner.Name |
| `EXTENDED_PIPELINE_QUERY` | Toggle ON | Core + Account.Industry + Account.AnnualRevenue + Owner.Title |
| `OPTIONAL_FIELDS_DEMO_QUERY` | OptionalFieldsDemo mount | 5 Accounts with `Industry @optional` + `AnnualRevenue @optional` |

Every record field uses the `@optional` directive. Without it, a single inaccessible field fails the whole query with `FIELD_NOT_ACCESSIBLE`.

---

## Authors

- **Sumanth Shyam Hegde** — [ABSYZ](https://absyz.com)

---

## License

MIT
