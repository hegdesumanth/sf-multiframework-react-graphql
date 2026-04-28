## Current Status

Pipeline Dashboard complete. Two additional GraphQL exploration routes built. Pre-blog-publish work remains.

### What's done
- Scratch org created and Multi-Framework beta enabled
- Agentforce Vibes scaffolded the project (TypeScript, not JS)
- PRD and TRD are in /docs folder
- shadcn/ui components already exist in src/components/ui/
- GraphQL client already exists at src/api/graphqlClient.ts
- Routing set up via router-utils.tsx and routes.tsx
- Styles entry point is src/styles/global.css (not index.css)
- **Pipeline Dashboard fully built** — all 5 components (KPICard, OpportunityTable, StageFunnel, DynamicQueryToggle, OptionalFieldsDemo) + usePipelineData hook
- **OpportunitiesPage built** — `/opportunities` route, flat Opportunity query with nested Account, single round trip
- **AccountsWithOpportunitiesPage built** — `/accounts-with-opps` route, parent-child GraphQL query (equivalent to SOQL sub-select), expandable row UI

### Active routes
| Path | Component | Nav label |
|---|---|---|
| `/` | `Home` | Home |
| `/accounts` | `AccountSearch` | (not in nav) |
| `/accounts/:recordId` | `AccountObjectDetailPage` | (not in nav) |
| `/pipeline` | `PipelineDashboard` | Pipeline |
| `/opportunities` | `OpportunitiesPage` | Opportunities |
| `/accounts-with-opps` | `AccountsWithOpportunitiesPage` | Accounts & Opps |

### Remaining before blog-publish
- Verify all 5 Pipeline Dashboard sections render with real org data
- Confirm Dynamic Query Toggle swaps query string (check network panel)
- Confirm Optional Fields panel does not crash on inaccessible fields
- Update `MultiFrameworkPOC.uibundle-meta.xml` masterLabel to "Pipeline Dashboard"
- Replace README.md body with LWC vs Multi-Framework comparison table (TRD §14)

### Key decisions made
- All files are .tsx/.ts (TypeScript scaffold, not JS)
- Build on existing graphqlClient.ts pattern, don't recreate
- Dark theme: slate-950 bg, indigo-500 accent; each page owns its dark wrapper (`min-h-screen bg-slate-950`)
- No SLDS classes anywhere
- All GraphQL queries stored as `.graphql` files imported with `?raw`, not inline gql tags — keeps query files auditable and separately readable
- Stage badge color map defined locally per-component (not centralized) — acceptable deviation from TRD since the map is small and co-located with rendering logic
- Service layer per domain: `src/api/opportunity/`, `src/api/accountOpportunities/`, `src/api/account/` — each has a `query/` subfolder with `.graphql` files and a service `.ts` file that calls `executeGraphQL` directly



# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> Authoritative companions: read `AGENT.md` (Salesforce / UI Bundle conventions, deploy rules, GraphQL non-negotiables), `docs/PRD_SalesPipelineDashboard.md` (product spec), `docs/TRD_SalesPipelineDashboard.md` (technical spec). This file is the working brief that ties them together and flags where the scaffold deviates from the TRD.

---

## 1. Project Overview

**What this is:** A proof-of-concept Salesforce app — the **Sales Pipeline Intelligence Dashboard** — built on the new Salesforce Multi-Framework (open beta). It runs natively inside a scratch org but is authored as a Vite + React SPA inside a UI Bundle.

**What it demonstrates** (each maps to a blog post section):
1. React running natively on Salesforce (App Launcher entry, no LWC).
2. GraphQL via `@salesforce/sdk-data` replacing `@wire`.
3. **Dynamic query construction at runtime** — the headline differentiator vs. LWC `@wire`.
4. **Optional fields with `@optional`** — graceful FLS degradation vs. the old `lightning/uiGraphQLApi` which threw `FIELD_NOT_ACCESSIBLE`.
5. Third-party charts (Recharts) and shadcn/ui working without static-resource gymnastics.

This POC will be screenshotted and quoted in a public blog post for the Salesforce dev community. **Code readability for outsiders is a first-class requirement.**

---

## 2. Tech Stack

The TRD prescribes one stack; the scaffold under `force-app/main/default/uiBundles/MultiFrameworkPOC/` ships another. **Use what the scaffold ships — do not downgrade.** When the TRD's snippets contradict the scaffold, port them to the scaffold's stack.

| Layer | TRD says | Scaffold ships | Use this |
|---|---|---|---|
| Language | JavaScript (JSX) | TypeScript (TSX) | **TypeScript** — scaffold ships codegen + tsc; rewriting in JS is wasted work. Keep code small and well-commented so blog readers can follow. |
| React | 18.x | 19.2 | React 19 |
| Build | Vite 5 | Vite 7 | Vite 7 |
| Styling | Tailwind 3 | Tailwind 4 (`@tailwindcss/vite`) | Tailwind 4 — config lives in `src/styles/global.css`, not a `tailwind.config.js` |
| Router | (unspecified) | React Router 7 | React Router 7, definitions only in `src/routes.tsx` |
| Tests | Vitest | Vitest 4 + Playwright | Vitest for unit, Playwright for e2e |
| Data SDK | `@salesforce/sdk-data` (beta) | `@salesforce/sdk-data` ^1.120 | as scaffolded |
| UI primitives | shadcn/ui | shadcn (new-york style, `neutral` base) + Radix UI | as scaffolded — primitives live in `src/components/ui/` |
| Icons | lucide-react | lucide-react ^0.562 | lucide-react |
| Charts | Recharts 2.x | **not installed yet** | Add via `npm install recharts` from inside the UI Bundle directory when building `StageFunnel` |
| Toasts | (unspecified) | `sonner` | use existing `sonner` rather than adding another |
| Date utils | (unspecified) | `date-fns` already installed | prefer `date-fns` over hand-rolled date code |

**Why these choices** (for the blog):
- **Multi-Framework + sdk-data** — the only way to run React natively on Salesforce while still respecting platform security (FLS, CRUD, sharing).
- **shadcn + Tailwind** — composable, npm-ecosystem-native UI; proves you can ship modern design in Salesforce without SLDS.
- **Recharts** — chosen because it's a pure React lib that would be painful to load as an LWC static resource. The existence of this dependency *is* part of the demo.
- **TypeScript** — kept because regenerating the scaffold in JS would lose the codegen pipeline and `gql` schema validation.

---

## 3. Project Structure

The PRD/TRD describe one tree; the actual layout is below. The bundle folder is **`MultiFrameworkPOC`**, not `PipelineDashboard`.

```
<repo root>/
├── CLAUDE.md                                 # ← you are here
├── AGENT.md                                  # platform conventions (read first)
├── README.md                                 # template README (do not rewrite for blog yet)
├── CHANGELOG.md                              # template changelog
├── docs/
│   ├── PRD_SalesPipelineDashboard.md         # product spec
│   └── TRD_SalesPipelineDashboard.md         # technical spec
├── sfdx-project.json                         # packageDirectories[0].path = "force-app"
├── package.json                              # ROOT — SFDX tooling only, not the React app
├── scripts/
│   ├── sf-project-setup.mjs                  # install deps + build + dev (root entry)
│   ├── org-setup.mjs                         # full deploy pipeline; --help for flags
│   ├── graphql-search.sh                     # entity/field lookup against schema.graphql
│   └── ...
├── config/project-scratch-def.json           # scratch org definition
└── force-app/main/default/uiBundles/MultiFrameworkPOC/   # ← PRIMARY WORKSPACE
    ├── package.json                          # Vite/React/sdk-data deps; ALL npm scripts run here
    ├── vite.config.ts
    ├── tsconfig.json / tsconfig.node.json
    ├── codegen.yml                           # GraphQL codegen → src/api/graphql-operations-types.ts
    ├── playwright.config.ts / vitest.config.ts
    ├── eslint.config.js
    ├── components.json                       # shadcn config — alias map + new-york / neutral
    ├── ui-bundle.json                        # runtime: outputDir=dist, fallback=index.html
    ├── MultiFrameworkPOC.uibundle-meta.xml   # Salesforce deploy descriptor
    └── src/
        ├── app.tsx                           # creates BrowserRouter — DO NOT add UI here
        ├── appLayout.tsx                     # shell: header / nav / <Outlet /> / footer
        ├── routes.tsx                        # SINGLE route registry; '*' route stays last
        ├── navigationMenu.tsx
        ├── router-utils.tsx
        ├── index.ts
        ├── styles/global.css                 # Tailwind 4 directives + theme tokens
        ├── lib/utils.ts                      # cn() helper — use for all conditional classes
        ├── api/
        │   ├── graphqlClient.ts              # executeGraphQL<TData,TVars> — already wired
        │   ├── graphql-operations-types.ts   # GENERATED — never hand-edit
        │   ├── account/                      # Account search + detail (scaffold template)
        │   │   ├── accountSearchService.ts
        │   │   └── query/                    # searchAccounts.graphql, getAccountDetail.graphql, …
        │   ├── opportunity/                  # ✅ BUILT — flat Opportunity list
        │   │   ├── opportunityService.ts
        │   │   └── query/getOpportunities.graphql
        │   └── accountOpportunities/         # ✅ BUILT — Account + child Opps (parent-child query)
        │       ├── accountOpportunitiesService.ts
        │       └── query/getAccountsWithOpportunities.graphql
        ├── components/
        │   ├── ui/                           # shadcn primitives — VERIFY exports before importing
        │   ├── pipeline/                     # ✅ BUILT — all 5 pipeline components
        │   │   ├── KPICard.tsx
        │   │   ├── OpportunityTable.tsx
        │   │   ├── StageFunnel.tsx
        │   │   ├── DynamicQueryToggle.tsx
        │   │   └── OptionalFieldsDemo.tsx
        │   └── accounts/                     # ✅ BUILT — reusable accounts+opps table
        │       └── AccountOppTable.tsx
        ├── hooks/
        │   ├── usePipelineData.ts            # ✅ BUILT — picks core/extended query, flattens edges
        │   └── useOpportunityFilter.ts       # ✅ BUILT — client-side filter state for opp table
        ├── lib/
        │   ├── utils.ts                      # cn() helper
        │   ├── queries.ts                    # ✅ BUILT — CORE_PIPELINE_QUERY, EXTENDED_PIPELINE_QUERY, OPTIONAL_FIELDS_DEMO_QUERY
        │   └── formatters.ts                 # ✅ BUILT — currency, date, initials, computeKpis
        ├── features/                         # object-search feature module (scaffold template)
        ├── pages/
        │   ├── Home.tsx
        │   ├── AccountSearch.tsx
        │   ├── AccountObjectDetailPage.tsx
        │   ├── NotFound.tsx
        │   ├── PipelineDashboard.tsx         # ✅ BUILT — root composer for all 5 pipeline sections
        │   ├── OpportunitiesPage.tsx         # ✅ BUILT — flat opp list, nested Account data
        │   └── AccountsWithOpportunitiesPage.tsx  # ✅ BUILT — parent-child query, expandable rows
        ├── assets/
        └── types/
```

**Pipeline Dashboard files** (TRD §3 — all built):

| Path (under `src/`) | Status | Purpose |
|---|---|---|
| `lib/queries.ts` | ✅ done | `CORE_PIPELINE_QUERY`, `EXTENDED_PIPELINE_QUERY`, `OPTIONAL_FIELDS_DEMO_QUERY` |
| `lib/formatters.ts` | ✅ done | `currency`, `date`, `initials`, `computeKpis` |
| `hooks/usePipelineData.ts` | ✅ done | `(isExtended: boolean) => { opportunities, loading, error, refetch }` |
| `pages/PipelineDashboard.tsx` | ✅ done | Root page — composes five sections |
| `components/pipeline/KPICard.tsx` | ✅ done | FR-01 (≤ 60 lines) |
| `components/pipeline/OpportunityTable.tsx` | ✅ done | FR-02 (≤ 150 lines) |
| `components/pipeline/StageFunnel.tsx` | ✅ done | FR-03 (≤ 80 lines) |
| `components/pipeline/DynamicQueryToggle.tsx` | ✅ done | FR-04 (≤ 50 lines) |
| `components/pipeline/OptionalFieldsDemo.tsx` | ✅ done | FR-05 (≤ 80 lines) |

**GraphQL exploration routes** (added post-PRD for pre-publish testing):

| Path (under `src/`) | Route | Purpose |
|---|---|---|
| `api/opportunity/opportunityService.ts` | `/opportunities` | Flat Opportunity query with nested `Account` — demonstrates one-query parent traversal |
| `api/accountOpportunities/accountOpportunitiesService.ts` | `/accounts-with-opps` | Parent-child query (`Account` + `Opportunities` sub-connection) — equivalent to SOQL sub-select |
| `components/accounts/AccountOppTable.tsx` | — | Expandable row table; click account row to reveal child opps inline |

Do not modify `app.tsx` or `appLayout.tsx` to add pages — that's an `AGENT.md` rule. All routes go in `routes.tsx` only.

---

## 4. Build Commands

**Always run from the UI Bundle directory** (`force-app/main/default/uiBundles/MultiFrameworkPOC/`), unless explicitly listed under "Project root" below.

### UI Bundle directory (primary)

```bash
npm install                  # first time only
npm run dev                  # Vite dev server (http://localhost:5173)
npm run build                # tsc -b && vite build  ← MUST pass before claiming done
npm run lint                 # ESLint  ← MUST pass before claiming done
npm run test                 # Vitest unit tests
npm run preview              # serve the production build locally
npm run graphql:schema       # fetch schema.graphql from the org (requires authenticated CLI)
npm run graphql:codegen      # regenerate src/api/graphql-operations-types.ts
```

After **every** code change, in order: `npm run build` → `npm run lint` → `npm run dev`. Don't declare a task done until all three are green.

### Project root (SFDX only)

```bash
npm run sf-project-setup                              # install + build + dev (one-shot bootstrap)
npm run setup -- --target-org <alias>                 # interactive: login + deploy + schema + codegen + build + dev
npm run setup -- --target-org <alias> --yes           # same, non-interactive
npm run setup -- --help                               # all flags
```

### Deploy to scratch org

```bash
# 1. Build (from UI Bundle dir)
npm run build

# 2. Deploy (from repo root)
sf project deploy start --source-dir force-app/main/default/uiBundles --target-org <alias>
# or all metadata:
sf project deploy start --source-dir force-app --target-org <alias>
```

**Do not** open the app for the user (`sf org open`, manual URL guesses, `/s/<appName>` paths). Per `AGENT.md`, deployment is "complete" when `sf project deploy start` succeeds — let the user open it themselves. If you need them to run an interactive command, suggest they prefix it with `!`.

### Common single-test invocations

```bash
npm run test -- src/components/pipeline/KPICard.test.tsx     # one file
npm run test -- -t "computes weighted pipeline"              # one test by name
```

---

## 5. GraphQL Patterns (confirmed working)

These patterns have been validated against the live scratch org and can be used as templates for new queries.

### Query file convention
All queries live in `.graphql` files imported as raw strings:
```typescript
import MY_QUERY from './query/myQuery.graphql?raw';
// then: executeGraphQL<MyResponseType, MyVarsType>(MY_QUERY, vars)
```
This keeps queries human-readable and separately auditable. The `?raw` Vite suffix imports the file as a plain string — no bundler transform.

### Parent-traversal (many-to-one)
Access a related parent object directly as a nested field on the child:
```graphql
Opportunity(first: 10) {
  edges { node {
    Id
    Name @optional { value displayValue }
    Account @optional {           # ← parent Account, traversed inline
      Id
      Name @optional { value displayValue }
      Industry @optional { value displayValue }
    }
    Owner @optional {
      Name @optional { value displayValue }
    }
  }}
}
```
Equivalent SOQL: `SELECT Id, Name, Account.Name, Owner.Name FROM Opportunity LIMIT 10`

### Child sub-query (one-to-many)
Access child records using the Salesforce relationship name as a sub-connection. **Always include `first:` on child connections** — omitting it silently caps at 10.
```graphql
Account(first: 10) {
  edges { node {
    Id
    Name @optional { value displayValue }
    Opportunities(first: 50) @optional {   # ← child Opps, sub-connection
      edges { node {
        Id
        Name @optional { value displayValue }
        StageName @optional { value displayValue }
        Amount @optional { value displayValue }
      }}
      totalCount
    }
  }}
}
```
Equivalent SOQL: `SELECT Id, Name, (SELECT Id, Name, StageName FROM Opportunities) FROM Account LIMIT 10`

### `@optional` placement rules
- **Scalar fields**: `FieldName @optional { value displayValue }` — always
- **Parent relationships**: `RelationshipName @optional { NestedField @optional { value } }` — directive on the relationship itself
- **Child sub-connections**: `ChildRelationship(first: N) @optional { edges { node { ... } } }` — directive after arguments, before the block
- Missing `@optional` on ANY field causes the entire query to fail with `FIELD_NOT_ACCESSIBLE` if the running user lacks FLS access

### TypeScript response shape
Salesforce fields always return a wrapper object, never raw scalars:
```typescript
interface SFField<T> { value: T | null; displayValue: string | null; }
// Usage: opp.Name?.value, opp.Amount?.displayValue
```
Since codegen only generates types for queries already in the project, new query files won't have generated types immediately. Define inline interfaces in the service file until the next `npm run graphql:codegen` run.

---

## 6. GraphQL Queries (Pipeline Dashboard)

All three queries live in `src/lib/queries.ts` as named `gql`-tagged exports (the `gql` tag from `@salesforce/sdk-data` is required so `@graphql-eslint` can validate against `schema.graphql`). Verify every field name against the schema before writing — use `scripts/graphql-search.sh` or regenerate via `npm run graphql:schema`. **Never** open `schema.graphql` directly (265K+ lines).

### Query 1 — `CORE_PIPELINE_QUERY` (default view)
- **Triggered:** mount + when Extended toggle is OFF.
- **Returns:** open `Opportunity` (max 200, `IsClosed: false`, ASC by `CloseDate`) with nested `Account.Name` and `Owner.Name` / `SmallPhotoUrl`.
- **Why this beats `@wire`:** one network call returns Opportunity + Account + User. In LWC this needs custom Apex or three `@wire` adapters with manual joins. The query string above the constant must include this comment for blog readers.

### Query 2 — `EXTENDED_PIPELINE_QUERY` (extended view)
- **Triggered:** when Extended toggle flips ON; selected at runtime in `usePipelineData.ts`.
- **Returns:** Query 1's fields **plus** `Account.Industry`, `Account.AnnualRevenue`, `Owner.Title`.
- **Why it matters:** `@wire` cannot swap query strings at runtime — it requires a static query known at compile time. Runtime construction is the headline LWC limitation this POC defeats. Comment the file to that effect (TRD §5.4 has the exact wording).

### Query 3 — `OPTIONAL_FIELDS_DEMO_QUERY`
- **Triggered:** mount of `OptionalFieldsDemo`. Fetches 5 `Account`s.
- **Returns:** `Id`, `Name`, plus `Industry @optional` and `AnnualRevenue @optional`.
- **Why it matters:** with `@optional`, fields the user can't access are simply omitted from the response — the query succeeds. Without `@optional` (old `lightning/uiGraphQLApi`), the entire query throws `FIELD_NOT_ACCESSIBLE` and the component crashes. The demo panel inspects each field's resolution status and shows a colored dot per field. Side-by-side comment in TRD §5.5.

**General GraphQL rules** (see AGENT.md for the full list):
- `@optional` on **every** record field, not just the demo. FLS will sink the whole query otherwise.
- Always include explicit `first:` (omitting it silently caps at 10).
- Always check `response.errors` — HTTP 200 does not mean success.
- Use the existing `executeGraphQL<TData, TVars>` helper in `src/api/graphqlClient.ts`. Don't re-instantiate the SDK per call.

---

## 7. Component Map

All paths are under `src/components/pipeline/` unless noted. **Hard line limits per TRD §5 — do not exceed.** If a component is approaching its cap, extract logic into a hook (`src/hooks/`) or a util (`src/lib/`).

| Component | Props (typed) | Responsibility | Max lines |
|---|---|---|---|
| `KPICard.tsx` | `title: string; value: string; icon: ReactNode; loading: boolean` | One stat card. `<Skeleton>` while loading, opacity transition on mount. No data fetching. | **60** |
| `OpportunityTable.tsx` | `opportunities: Opportunity[]; isExtended: boolean; loading: boolean` | Filterable, sortable table. Local state only: `searchTerm`, `activeStages`. **No re-fetch on filter** — purely client-side. Extended columns rendered with `<Badge variant="outline">Extended</Badge>`. | **150** |
| `StageFunnel.tsx` | `opportunities: Opportunity[]; loading: boolean` | Horizontal Recharts `BarChart` (`layout="vertical"`). Group + sum via `useMemo`. Indigo `LinearGradient` `#6366f1 → #312e81`. | **80** |
| `DynamicQueryToggle.tsx` | `isExtended: boolean; onToggle: () => void` | Toggle switch. Side-by-side `// ❌ LWC @wire …` vs `// ✅ Multi-Framework …` comment block (TRD §5.4) is required, not decorative. | **50** |
| `OptionalFieldsDemo.tsx` | none (self-contained) | Fires Query 3, classifies each optional field as `resolved` / `skipped` / `loading`, renders status dots + inline `@optional` code block. Side-by-side `// ❌ Old lightning/uiGraphQLApi …` vs `// ✅ @optional …` comment (TRD §5.5) required. | **80** |
| `PipelineDashboard.tsx` (page) | none | Root composer. Holds `isExtended` state. Calls `usePipelineData(isExtended)`. Lays out four `KPICard`s + `StageFunnel` + `DynamicQueryToggle` + `OpportunityTable` + `OptionalFieldsDemo`. | (page, no hard cap, but stay lean) |
| `usePipelineData.ts` (hook) | arg: `isExtended: boolean` → `{ opportunities, loading, error, refetch }` | Picks query based on `isExtended`, calls `executeGraphQL`, flattens `edges/node`, exposes loading/error. Re-runs on `isExtended` change. | (hook, ~80 lines target) |

**Stage badge colors** (TRD §10) — keep these in a single map in `lib/formatters.ts` or alongside the table; don't scatter `bg-*` classes:

```
Prospecting → bg-slate-500          Perception Analysis → bg-orange-500
Qualification → bg-blue-500         Proposal/Price Quote → bg-purple-500
Needs Analysis → bg-cyan-500        Negotiation/Review → bg-pink-500
Value Proposition → bg-teal-500     Closed Won → bg-green-500
Id. Decision Makers → bg-yellow-500 Closed Lost → bg-red-500
```

**KPI formulas** (TRD §11) — compute client-side from `opportunities`:
- Total Open Pipeline = `SUM(Amount)` where `IsClosed = false`
- Weighted Pipeline = `SUM(Amount × Probability / 100)` where `IsClosed = false`
- Average Deal Size = `Total Open Pipeline / COUNT(open)`
- Win Rate % = `COUNT(IsWon) / COUNT(IsClosed) × 100` — denominator excludes open ones

---

## 8. Design Tokens

**Dark theme everywhere.** PRD §8 is non-negotiable.

| Token | Value | Notes |
|---|---|---|
| Background | `slate-950` | App shell, page background |
| Accent | `indigo-500` | CTAs, active states, chart gradient start |
| Chart gradient | `#6366f1 → #312e81` | indigo-500 → indigo-900, horizontal funnel only |
| Body font | Inter | declare in `styles/global.css` |
| Mono font | system mono stack | for inline `<code>` in OptionalFieldsDemo |
| shadcn style | `new-york`, base `neutral` | from `components.json` — do not change |

The scaffolded `appLayout.tsx` currently uses a **light** theme (`bg-white`, `text-gray-900`). When wiring the dashboard, either swap the layout to dark or render the dashboard page with its own dark wrapper that overrides the shell. Either is acceptable — pick one and keep it consistent.

**Never use** `slds-*` classes, `lightning-*` web components, or any SLDS asset. The point of the POC is to prove SLDS isn't required.

---

## 9. Key Constraints (do NOT violate)

From PRD §5.2, AGENT.md, and TRD §13:

- **No mutations.** This POC is read-only. No `create`, `update`, `delete` GraphQL operations.
- **No production deploy.** Scratch org only. Multi-Framework is in beta; production is unsupported.
- **No Lightning App Builder integration.** Beta limitation — launch via App Launcher only. Don't ship Aura/LWC bridge components.
- **No SLDS.** Tailwind + shadcn only. No `slds-*` classes, no `lightning/*` imports.
- **No `@wire`, no Apex, no LWC APIs.** All data via `@salesforce/sdk-data` GraphQL.
- **No `fetch()` / `axios` for Salesforce data.** Only `sdk.graphql` (preferred) or `sdk.fetch` for the permitted endpoints listed in AGENT.md.
- **No `any`** in TypeScript. Use generated types from codegen, or `unknown` + narrowing.
- **No inline `style={{...}}`.** Tailwind classes only; use `cn()` for conditionals.
- **No mobile work below 1280px** — out of scope.
- **No automated test suite** required by PRD, but write Vitest tests for non-trivial logic (formatters, KPI math, `usePipelineData` flattening).
- **No opening the app for the user** post-deploy. See AGENT.md "Deploying".

---

## 10. Code Style Rules

This POC will be read by strangers on the internet. Optimize for that.

**Comment requirements (blog-readiness):**
- Every GraphQL query constant in `lib/queries.ts` must have a header comment explaining (a) what it returns and (b) why this beats the LWC equivalent. PRD FR-06.
- `DynamicQueryToggle.tsx` must include the `// ❌ LWC @wire …` vs `// ✅ Multi-Framework …` block from TRD §5.4 verbatim or near-verbatim.
- `OptionalFieldsDemo.tsx` must include the `// ❌ Old lightning/uiGraphQLApi …` vs `// ✅ @optional …` block from TRD §5.5.
- These three comment blocks are **product requirements**, not decoration. They are quoted directly in the blog post.
- Outside of these required teaching comments, follow the usual rule: only comment when *why* is non-obvious.

**File size limits** (TRD §5, repeated for visibility): `KPICard` ≤ 60, `DynamicQueryToggle` ≤ 50, `StageFunnel` ≤ 80, `OptionalFieldsDemo` ≤ 80, `OpportunityTable` ≤ 150. **No component file exceeds 150 lines** under any circumstance — extract a hook or util. Also applies to the new exploration-route components in `src/components/accounts/`.

**Naming:**
- Components: PascalCase TSX files matching the export name (`KPICard.tsx` exports `KPICard`).
- Hooks: `useThing.ts`, default-export disallowed for hooks.
- Pages: PascalCase, one **default-exported** component per file.
- Query constants: `SCREAMING_SNAKE_CASE` (`CORE_PIPELINE_QUERY`).
- Path alias: `@/*` → `src/*` for all cross-folder imports; relative paths only within the same folder.

**Other:**
- Always check shadcn primitive exports in `src/components/ui/` before importing — don't assume a component exists.
- Use `cn()` from `@/lib/utils` for any conditional className.
- Prefer `date-fns` over hand-rolled date arithmetic.
- The `gql` tag from `@salesforce/sdk-data` is mandatory for inline queries (it gates `@graphql-eslint` validation). Plain template strings will silently bypass schema checks.

---

## 11. Definition of Done

The POC is complete and blog-ready (PRD §9) when **all** of the following are true:

1. The app launches from the App Launcher in the target scratch org under the label **Pipeline Dashboard** (update `MultiFrameworkPOC.uibundle-meta.xml` `masterLabel` accordingly, or add a separate `app-meta.xml` per TRD §8.1).
2. All five sections render with real `Opportunity` data: **four KPI cards**, **opportunities table**, **stage funnel**, **dynamic query toggle**, **optional fields panel**.
3. Toggling the Dynamic Query Toggle visibly adds three "Extended"-tagged columns and demonstrably swaps the underlying query string (verify via network panel during the user's manual check).
4. The Optional Fields panel renders status dots per field and **does not crash** when a field is inaccessible.
5. The three required teaching comment blocks (queries.ts header, DynamicQueryToggle side-by-side, OptionalFieldsDemo side-by-side) are present and accurate. A non-Salesforce dev can read the code and understand the GraphQL approach from comments alone.
6. The README contains a **React Multi-Framework vs LWC comparison table** (TRD §14 has the source content). The current `README.md` is the template's — replace its body with project-specific content before declaring done.
7. From the UI Bundle directory: `npm run build` passes with **zero** errors, `npm run lint` passes with **zero** errors, `npm run dev` starts cleanly. None of these may be skipped.
8. No file exceeds its line cap (§7). No SLDS classes, no `lightning/*` imports, no `@wire`, no mutations, no `any`.

UI / behavior verification of items 1–4 cannot be done from this CLI — explicitly tell the user what to check in the browser rather than claiming the visuals work.
