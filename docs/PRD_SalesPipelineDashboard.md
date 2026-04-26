# Product Requirements Document (PRD)
## Sales Pipeline Intelligence Dashboard
### Salesforce Multi-Framework POC

---

**Document Version:** 1.0
**Status:** Draft
**Author:** Sumanth Shyam Hegde
**Organization:** ABSYZ
**Date:** April 2026

---

## 1. Executive Summary

This document defines the product requirements for the **Sales Pipeline Intelligence Dashboard**, a proof-of-concept (POC) application built natively inside Salesforce using the newly announced **Salesforce Multi-Framework** (open beta). The app demonstrates how React, GraphQL, shadcn/ui, and Tailwind CSS can be used to build production-grade Salesforce experiences — replacing traditional LWC patterns with a modern, ecosystem-friendly development model.

This POC is the foundation for a technical blog post showcasing the real-world benefits of Multi-Framework to the Salesforce developer community.

---

## 2. Problem Statement

### 2.1 The Developer Experience Gap

Salesforce developers today face a fundamental trade-off: adopt Lightning Web Components (LWC) and get deep platform integration, or use React/modern tooling and lose platform features entirely.

Specifically:

**Open-source libraries** must be loaded as static resources — cumbersome, version-frozen, and outside npm's ecosystem. **Dynamic UI logic** is constrained by LWC's `@wire` decorator, which does not support runtime query construction. **Field-level access control** in queries throws hard errors when a user lacks FLS permissions — there is no graceful degradation. **Component portability** is zero — LWC components cannot be reused outside Salesforce without re-writing them.

### 2.2 What This POC Proves

This dashboard proves that all four of the above problems are solved by Salesforce Multi-Framework + GraphQL, with zero compromise on platform security or data governance.

---

## 3. Goals & Objectives

| Goal | Metric |
|---|---|
| Demonstrate React running natively on Salesforce | App launches from App Launcher in scratch org |
| Show GraphQL as the data layer replacing @wire | All data fetched via `@salesforce/sdk-data` GraphQL |
| Showcase dynamic query construction at runtime | Toggle switches between two query shapes live |
| Prove optional field resilience | Panel shows field resolution status without query failure |
| Demonstrate modern component ecosystem freedom | shadcn/ui + Tailwind used with zero SLDS dependency |
| Produce blog-ready, documented code | All key files commented for blog readers |

---

## 4. Target Audience

### Primary — Blog Readers
Salesforce developers (LWC/Apex background) who are evaluating whether to adopt Multi-Framework. They need to see clear, working code and understand the "why" behind each technology choice.

### Secondary — Internal Team
ABSYZ developers evaluating Multi-Framework for future client projects. The POC serves as an internal reference implementation.

---

## 5. Scope

### 5.1 In Scope

The dashboard covers the following capability demonstrations:

**Pipeline KPI Overview** — Four summary cards showing aggregated Opportunity data (Total Pipeline, Weighted Pipeline, Average Deal Size, Win Rate), fetched via a single GraphQL query.

**Opportunities Table** — A filterable, sortable table of open Opportunities with nested Account and Owner data from a single relational GraphQL query — something that requires multiple `@wire` calls or Apex in traditional LWC.

**Stage Funnel Visualization** — A horizontal bar chart showing pipeline value grouped by Stage, rendered with Recharts — a third-party library impossible to use cleanly in traditional LWC without static resources.

**Dynamic Query Toggle** — The centerpiece demo. A toggle that switches between a "core fields" query and an "extended fields" query at runtime, constructed dynamically. This is the key differentiator vs. LWC's `@wire` which cannot do this.

**Optional Fields Demo Panel** — A small panel showing a GraphQL query where `Account.Industry` is marked optional. The panel displays field resolution status, demonstrating that the query succeeds even when the field is inaccessible — unlike the old `lightning/uiGraphQLApi` which would throw.

### 5.2 Out of Scope

The following are explicitly not part of this POC:

- Record create / edit / delete operations (no mutations)
- User authentication flows (handled by the platform SDK)
- Lightning App Builder integration (not yet supported in beta)
- Mobile responsiveness below 1280px
- Automated test suite
- Production org deployment

---

## 6. Salesforce Objects Used

All data is read-only from standard Salesforce objects requiring zero custom setup:

| Object | Fields Used |
|---|---|
| Opportunity | Id, Name, Amount, StageName, CloseDate, Probability, IsClosed, IsWon |
| Account | Name, Industry (optional), AnnualRevenue (optional) |
| User | Name, SmallPhotoUrl, Title (extended) |

No custom objects, no custom fields, no data setup required. The POC works against any org's existing Opportunity data or Salesforce's sample data.

---

## 7. Feature Requirements

### FR-01: KPI Cards
The app must display four summary KPI cards at the top of the dashboard. Each card shows a single computed metric derived from the GraphQL query result. Cards must show a skeleton loading state while data is being fetched. Cards must animate into view on initial load.

### FR-02: Opportunities Table
The table must display all open Opportunities with at minimum: Name, Account Name, Stage (as a badge), Amount (formatted as currency), Close Date, Probability (as a progress bar), and Owner (avatar + name). The table must support text search filtering by Opportunity Name or Account Name. The table must support multi-select Stage filtering via pill toggle buttons.

### FR-03: Stage Funnel Chart
The app must display a horizontal bar chart showing total pipeline Amount grouped by StageName. The chart must use a color gradient. Labels must show stage name and formatted value.

### FR-04: Dynamic Query Toggle
A toggle in the UI must switch between two query modes at runtime: Core (default) and Extended. In Extended mode the query must add Account.Industry, Account.AnnualRevenue, and Owner.Title fields. The table must add corresponding columns when Extended mode is active. Added columns must be visually marked as "Extended".

### FR-05: Optional Fields Demo Panel
A dedicated section must fire a GraphQL query where at least two Account fields are marked as optional using the `@optional` directive. The panel must display a status indicator for each field showing whether it resolved successfully or was skipped due to access restrictions. An inline code snippet must show the optional field syntax for blog readers.

### FR-06: Blog Comments
All GraphQL query strings must have a comment block explaining what they do and why they are better than the LWC equivalent. The Dynamic Query component must include a side-by-side comment showing the LWC `@wire` limitation. The Optional Fields component must include a comment showing what the old `lightning/uiGraphQLApi` would have done.

---

## 8. Non-Functional Requirements

**Performance** — Initial data load must complete within 3 seconds on a standard scratch org. Client-side filtering and toggle must be instantaneous (no re-fetch on filter).

**Design** — Dark theme throughout (slate-950 background). Accent color: indigo-500. No Salesforce Lightning Design System classes anywhere. Inter font for body text, monospace font for code snippets.

**Code Quality** — No component file may exceed 150 lines. All logic must be split into hooks and utility files. All GraphQL queries must be exported as named constants from a central `queries.js` file.

**Browser Support** — Chrome and Edge latest only (scratch org developer environment).

---

## 9. Success Criteria

The POC is considered complete and blog-ready when:

1. The app launches from the Salesforce App Launcher in the scratch org
2. All five feature sections render with real Opportunity data
3. The Dynamic Query Toggle demonstrably changes the visible columns and the underlying query string
4. The Optional Fields panel shows a field resolution status without the app crashing
5. A non-Salesforce developer reading the code can understand the GraphQL approach from the comments alone
6. The README contains a comparison table of React Multi-Framework vs LWC for this use case

---

## 10. Blog Post Mapping

Each feature maps directly to a section of the planned blog post:

| Dashboard Feature | Blog Section |
|---|---|
| Project scaffold + App Launcher | "Getting Started with Multi-Framework" |
| GraphQL data fetch (KPI + Table) | "Replacing @wire with GraphQL" |
| Recharts integration | "The Ecosystem Freedom Benefit" |
| Dynamic Query Toggle | "Dynamic Queries: What LWC Can't Do" |
| Optional Fields Panel | "Resilient Queries with Optional Fields" |
| README comparison table | "Should You Switch?" |

---

*End of PRD v1.0*
