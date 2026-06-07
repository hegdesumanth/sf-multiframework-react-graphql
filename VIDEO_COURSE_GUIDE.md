# Building a React Internal App on Salesforce — Video Course Guide

> Step-by-step reference guide for the video course.
> Each section = one logical block you can explain on camera before moving to the next.

---

## Table of Contents

1. [What We're Building](#1-what-were-building)
2. [Prerequisites & Tools](#2-prerequisites--tools)
3. [Salesforce Org Setup](#3-salesforce-org-setup)
4. [Install Salesforce CLI & VS Code Extensions](#4-install-salesforce-cli--vs-code-extensions)
5. [Enable DevHub, Create & Authorize Scratch Org](#5-enable-devhub-create--authorize-scratch-org)
6. [Create the React Internal App](#6-create-the-react-internal-app)
7. [Set Scratch Org as Default](#7-set-scratch-org-as-default)
8. [Navigate into the UI Bundle & Inspect the Scaffold](#8-navigate-into-the-ui-bundle--inspect-the-scaffold)
9. [Install Dependencies & Run Locally](#9-install-dependencies--run-locally)
10. [Configure Tailwind CSS v4](#10-configure-tailwind-css-v4)
11. *(shadcn/ui — coming soon)*

---

## 1. What We're Building

### The Finished App

We're building a **Sales Pipeline Intelligence Dashboard** — a fully functional React 19 internal application running natively inside Salesforce. No iframes, no Experience Cloud, no Visualforce. It lives directly in the Salesforce App Launcher and behaves like any other internal Salesforce app, but the entire frontend is React.

The app has six pages accessible from a top navigation bar:

| Page | Route | What It Shows |
|------|-------|---------------|
| Home | `/` | Landing page with project overview |
| Pipeline Dashboard | `/pipeline` | **The main demo** — KPI cards, funnel chart, table, dynamic query toggle |
| Opportunities | `/opportunities` | Standalone filterable opportunity list |
| Account Search | `/accounts` | Search bar → account results from GraphQL |
| Account Detail | `/accounts/:recordId` | Individual account record view |
| Accounts & Opps | `/accounts-with-opps` | Accounts with nested related opportunities in one query |

### Why This Matters: Three Things LWC Cannot Do

**1. Dynamic queries at runtime** — `@wire` adapters are static, declared at compile time. GraphQL queries are strings — swap or extend them based on any runtime condition.

**2. FLS resilience via `@optional`** — In LWC, an inaccessible field throws `FIELD_NOT_ACCESSIBLE` and breaks the entire wire call. With `@optional`, the field is silently omitted and the query continues.

**3. One call for related data** — Fetching Opportunity + Account + Owner in LWC needs three separate `@wire` adapters. In GraphQL, it's a single nested query — one network call.

---

## 2. Prerequisites & Tools

- **Node.js v22+** — `node --version` to verify
- **npm** — ships with Node, no Yarn or pnpm
- **Git** — `git --version` to verify
- **VS Code** — with Salesforce Extension Pack, ESLint, Prettier, Tailwind CSS IntelliSense, GraphQL: Language Feature Support
- **Salesforce CLI (sf v2)** — `npm install -g @salesforce/cli`, then `sf --version` to verify. Do not use the old `sfdx` CLI
- **A Salesforce Developer Edition org** — free permanent org, sign up at `developer.salesforce.com/signup`
- **Scratch org or Sandbox** — Multi-Framework can be enabled on either. This course uses a **scratch org** (short-lived, config-driven, ideal for development). If you already have a sandbox with Multi-Framework enabled, you can follow along using that instead.

---

## 3. Salesforce Org Setup

1. Sign up for a **Salesforce Developer Edition org** at `developer.salesforce.com/signup`
2. Verify your email, set a password, and log in at `login.salesforce.com`
3. Note your username — needed for CLI authentication later

> This org acts as your **DevHub**. The app itself will run on a **scratch org** created from it.

---

## 4. Install Salesforce CLI & VS Code Extensions

**Salesforce CLI** — install via either:
```bash
npm install -g @salesforce/cli
```
or download the installer directly from `developer.salesforce.com/tools/salesforcecli`

```bash
sf --version   # verify
```

**VS Code Extensions** — install from the Extensions panel:
- Salesforce Extension Pack
- ESLint
- Prettier - Code Formatter
- Tailwind CSS IntelliSense
- GraphQL: Language Feature Support

---

## 5. Enable DevHub, Create & Authorize Scratch Org

**5.1 Enable DevHub in the Developer Edition org:**
1. Setup → Quick Find → `Dev Hub`
2. Toggle **Enable Dev Hub** → Save

**5.2 Authorize the DevHub in terminal:**
```bash
sf org login web --alias devhub --set-default-dev-hub
```
This opens a browser login — sign in with your Developer Edition credentials.

**5.3 Create a scratch org:**
```bash
sf org create scratch \
  --edition developer \
  --alias mf-scratch \
  --set-default \
  --duration-days 30
```

**5.4 Authorize the scratch org & reset password:**
```bash
sf org open --target-org mf-scratch
sf org generate password --target-org mf-scratch
```
Note the generated password — you'll need it to log into the scratch org UI.

**5.5 Enable Multi-Framework in the scratch org:**
1. Setup → Quick Find → `Multi-Framework`
2. Toggle **Enable Multi-Framework UI Apps** → Save

> Repeat steps 5.3 – 5.5 every time you create a new scratch org.

---

## 6. Create the React Internal App

Run this from the repo root:
```bash
sf template generate ui-bundle
```

The CLI will prompt:
- **Bundle name:** `MultiFrameworkDemo`
- **Bundle label:** `Pipeline Dashboard`
- **Description:** *(optional)*

This generates the full React scaffold at `force-app/main/default/uiBundles/MultiFrameworkDemo/`.

**Alternative:** VS Code Command Palette → `SFDX: Create UI Bundle` — same result, no terminal needed.

---

## 7. Set Scratch Org as Default

The scratch org was created in Step 5. If it isn't already the default, set it now:
```bash
sf config set target-org pipeline-demo
```

Verify:
```bash
sf org display
```

---

## 8. Navigate into the UI Bundle & Inspect the Scaffold

```bash
cd force-app/main/default/uiBundles/MultiFrameworkDemo
```

The generated scaffold looks like this:
```
src/
  App.tsx          ← root component
  main.tsx         ← entry point
vite.config.ts
package.json       ← @salesforce/sdk-data already included
tsconfig.json
index.html
```

`package.json` comes preconfigured with React 19, Vite, TypeScript, Tailwind CSS, and `@salesforce/sdk-data`. No manual wiring needed for these.

---

## 9. Install Dependencies & Run Locally

**Install base dependencies:**
```bash
npm install
```

**Install additional libraries used in this project:**
```bash
npm install recharts lucide-react date-fns sonner
```

**Start the dev server:**
```bash
npm run dev
```

Opens at `http://localhost:5173`. At this point it shows the default scaffold — not connected to Salesforce data yet, just local React dev.

---

## 10. Configure Tailwind CSS v4

Tailwind is already in `package.json` from the template.