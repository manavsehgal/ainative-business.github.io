---
name: stagent-stats
description: Collect development metrics (LOC, tests, commits, features, infrastructure) from the Stagent project and write a timestamped report to stagent-stats.md. Then update all stat locations across the marketing website. Use when the user asks to check project stats, update metrics, or track development velocity.
---

This skill collects comprehensive development metrics from the Stagent project and writes them to `stagent-stats.md` as a timestamped entry. Each run appends a new entry, building a time-series of project velocity. It then propagates the collected stats to all locations across the marketing website.

## Target Project

The Stagent codebase lives at `/Users/manavsehgal/Developer/stagent/`. All metric collection commands run against that directory. The report file `stagent-stats.md` is written to the current working directory.

## Architecture

Stagent is a pure **Next.js 16 + React 19** web application with local SQLite storage via Drizzle ORM. AI integration uses the **Claude Agent SDK** v0.2.71. There is no Rust, Tauri, or native desktop component.

## Collection Steps

### 1. Verify Tools

Check availability of these tools before proceeding:
- `tokei` — fast LOC counter (install: `brew install tokei`)
- `git` — version control

If `tokei` is missing, fall back to `find + wc -l` for LOC counting. Note any missing tools in the report.

### 2. Collect LOC

Run `tokei` on the Stagent project root:
```bash
tokei /Users/manavsehgal/Developer/stagent/ --sort code -t=TypeScript,TSX,CSS,JSON
```

If `tokei` is unavailable, use:
```bash
find /Users/manavsehgal/Developer/stagent/src -name '*.ts' -o -name '*.tsx' | xargs wc -l
```

Record: TypeScript production LOC, TypeScript test LOC, total LOC.

### 3. Count Tests

Count test functions (Vitest only — no Playwright or Rust tests):
```bash
grep -r "it(\|test(" /Users/manavsehgal/Developer/stagent/src --include="*.test.ts" --include="*.test.tsx" --include="*.spec.ts" | wc -l
```

Record: Vitest count, total.

### 4. Git Velocity

```bash
cd /Users/manavsehgal/Developer/stagent/
git rev-list --count HEAD
git log --oneline --since="$(git log --reverse --format='%aI' | head -1)" | wc -l
git log --reverse --format='%aI' | head -1  # first commit timestamp
git log -1 --format='%aI'                   # latest commit timestamp
```

Compute:
- Total commits
- Hours elapsed (latest - first commit)
- Commits per hour (commits / hours)
- LOC per hour (total LOC / hours)

### 5. Feature Status

```bash
# Count features from roadmap
cat /Users/manavsehgal/Developer/stagent/features/roadmap.md
```

Count completed vs total features from the roadmap file. List completed feature names.

### 6. Infrastructure Counts

```bash
# API routes
find /Users/manavsehgal/Developer/stagent/src/app/api -name "route.ts" 2>/dev/null | wc -l

# Database tables
grep -c "export const" /Users/manavsehgal/Developer/stagent/src/db/schema.ts 2>/dev/null || echo 0

# React components
find /Users/manavsehgal/Developer/stagent/src/components -name "*.tsx" 2>/dev/null | wc -l

# Pages (operator surfaces)
find /Users/manavsehgal/Developer/stagent/src/app -name "page.tsx" 2>/dev/null | wc -l

# Agent profiles
find /Users/manavsehgal/Developer/stagent/src -path "*/agents/*" -name "*.ts" 2>/dev/null | wc -l

# Service modules
find /Users/manavsehgal/Developer/stagent/src/services -maxdepth 1 -name "*.ts" 2>/dev/null | wc -l

# Workflow patterns
find /Users/manavsehgal/Developer/stagent/src -path "*/workflows/*" -name "*.ts" 2>/dev/null | wc -l
```

### 7. Quality Indicators

Note TypeScript strict mode and ESLint config status if available.

### 8. Write Report

Read the existing `stagent-stats.md` file if it exists. Append a new timestamped entry in this format:

```markdown
## [YYYY-MM-DD HH:MM] Metrics Snapshot

| Category | Metric | Value |
|----------|--------|-------|
| LOC | TypeScript (production) | X,XXX |
| LOC | TypeScript (tests) | X,XXX |
| LOC | **Total** | **X,XXX** |
| Tests | Vitest | XXX |
| Tests | **Total** | **XXX** |
| Git | Commits | XX |
| Git | Hours elapsed | XX.X |
| Git | Commits/hour | X.X |
| Git | LOC/hour | XXX |
| Features | Completed | XX/XX |
| Infra | API routes | XX |
| Infra | DB tables | XX |
| Infra | UI components | XX |
| Infra | Pages | XX |
| Infra | Agent profiles | XX |
```

### 9. Trend Comparison

If previous entries exist in `stagent-stats.md`, compute and display deltas:
- LOC: +X,XXX since last snapshot
- Tests: +XX since last snapshot
- Commits: +XX since last snapshot

Format deltas with arrows: `↑ +1,234 LOC` or `→ no change`.

## Updating the Website

After collecting stats, update ALL stat locations across the marketing website so they stay in sync. The sections below list every file and the specific values to update.

### Deriving Website Stats from Collected Metrics

Use this mapping to translate collected metrics into website values:

| Website Stat | Source |
|-------------|--------|
| Features Shipped | `Features | Completed` — the shipped count (numerator only) |
| Operator Surfaces | `Infra | Pages` count from step 6 |
| AI Runtimes | Count from product's runtime config (typically stable at 5) |
| Agent Profiles | `Infra | Agent profiles` count from step 6 |
| Workflow Patterns | Workflow patterns count from step 6 |
| LOC (Stagent) | `LOC | Total` from step 2, formatted as `XXK` |
| Tests | `Tests | Total` from step 3 |
| API Endpoints | `Infra | API routes` from step 6 |
| DB Tables | `Infra | DB tables` from step 6 |
| Service Modules | Service modules count from step 6 |
| TypeScript % | From `tokei` output, compute TS LOC / Total LOC |
| Business-function profiles | Manually count profiles tagged as business-function in the product |

### Update Target 1: Proof Section (Homepage)

**File:** `src/components/sections/Proof.astro` (lines 5-11)

Update the `metrics` array with current values:
```javascript
const metrics = [
  { value: '<FEATURES_SHIPPED>', label: 'Features Shipped' },
  { value: '<OPERATOR_SURFACES>', label: 'Operator Surfaces' },
  { value: '<AI_RUNTIMES>', label: 'AI Runtimes' },
  { value: '<AGENT_PROFILES>+', label: 'Agent Profiles' },
  { value: '<WORKFLOW_PATTERNS>', label: 'Workflow Patterns' },
];
```

### Update Target 2: Projects Page Metrics Bar

**File:** `src/data/timeline.ts` (lines 23-29)

Update the top-level `metrics` array:
```typescript
export const metrics = [
  { label: 'Lines of Code', target: <PORTFOLIO_LOC_K>, suffix: 'K+' },
  { label: 'AI Agents', target: <PORTFOLIO_AGENTS>, suffix: '+' },
  { label: 'Production Systems', target: <PRODUCTION_SYSTEMS>, suffix: '' },
  { label: 'Projects', target: <PROJECTS>, suffix: '+' },
  { label: 'Blog Articles', target: <BLOG_ARTICLES>, suffix: '+' },
];
```

Note: Portfolio-wide metrics (LOC, AI Agents, Projects, Blog Articles) include ALL projects, not just Stagent. To update these, sum LOC across all project entries and count agents across the portfolio. `Production Systems` and `Projects` count the total number of shipped systems and projects respectively.

Also update the Stagent project entry's `stats` field (search for the Stagent entry near the bottom of the timeline array):
```
stats: '<LOC>K LOC · <TESTS> tests · <FEATURES_COMPLETED>/<FEATURES_TOTAL> features shipped'
```

### Update Target 3: Research Page — "What's Shipped Today" Table

**File:** `src/pages/research.mdx` (~lines 177-193)

Update these table rows with current values:
```markdown
| Capability | Status |
|-----------|--------|
| <FEATURES_TOTAL> features across <OPERATOR_SURFACES> operator surfaces | Shipped |
| <AGENT_PROFILES>+ specialist agent profiles (incl. <BIZ_PROFILES> business-function profiles) | Shipped |
| <WORKFLOW_PATTERNS> workflow patterns with blueprint catalog | Shipped |
| <AI_RUNTIMES> AI runtimes (Claude, OpenAI, Ollama, direct APIs) | Shipped |
```

Keep the remaining rows (Slack/Telegram, heartbeat, memory, etc.) unchanged unless the product has added new shipped capabilities.

### Update Target 4: Research Page — Architecture Section

**File:** `src/pages/research.mdx` (~lines 229-233)

Update the architecture bullets:
```markdown
- **Browser layer** — React 19 with <OPERATOR_SURFACES> operator surfaces, real-time SSE streaming
- **Server layer** — Next.js 16 with <SERVICE_MODULES> service modules, <API_ENDPOINTS> API endpoints
- **External layer** — Local SQLite database (WAL mode, <DB_TABLES>+ tables), no cloud dependency

Technology stack: TypeScript (<TS_PERCENT>% of codebase), Tailwind CSS v4, shadcn/ui, Drizzle ORM.
```

### Update Target 5: Architecture Glance SVG (Homepage)

**File:** `src/components/svg/ArchitectureGlance.astro`

This is a simplified 4-pillar architecture diagram on the homepage Proof section. Update text elements containing stats:
- Orchestrate pillar: `<AGENT_PROFILES>+ Agent Profiles` (search for `Agent Profiles`)
- Automate pillar: `<WORKFLOW_PATTERNS> Workflow Patterns` (search for `Workflow Patterns`)

### Update Target 6: System Architecture SVG (Research Page)

**File:** `src/components/svg/SystemArchitecture.astro`

This is the detailed 4-column × 3-row architecture diagram in the research page. Update text elements containing stats:
- Row label: `<OPERATOR_SURFACES> screens` (search for `screens`)
- Row label: `<API_ENDPOINTS> APIs` (search for `APIs`)
- Orchestrate surfaces cell: `Profiles (<AGENT_PROFILES>+)` (search for `Profiles (`)
- Automate infra cell: `SQLite (<DB_TABLES>+ tables)` (search for `SQLite (`)

### Update Target 7: Detailed Architecture SVG (Research Page)

**File:** `src/components/svg/DetailedArchitecture.astro`

This is the 3-layer detailed architecture diagram. Update text elements containing stats:
- Browser subtitle: `<OPERATOR_SURFACES> operator-facing surfaces across 3 workspace categories`
- Workflow Engine card: `<WORKFLOW_PATTERNS> orchestration patterns` (search for `orchestration patterns`)
- Server subtitle: `<SERVICE_MODULES> service modules` (search for `service modules`)
- External storage: `SQLite DB (<DB_TABLES>+ tables)` (search for `SQLite DB (`)

### Update Target 8: Homepage FAQ (JSON-LD Structured Data)

**File:** `src/pages/index.astro` (~lines 60-80)

Update the stat references in FAQ answers:
- "supports **<AI_RUNTIMES> AI runtimes**, **<AGENT_PROFILES>+ specialist agent profiles**, **<WORKFLOW_PATTERNS> workflow patterns**"

### Update Target 9: Stagent Timeline Entry

**File:** `src/data/timeline.ts` (Stagent entry near bottom of timeline array)

Update these fields:
- `stats` — LOC count, test count, features shipped ratio
- `achievements` — notable milestones if any new ones
- `description` — if scope has meaningfully changed

### Update Target 10: Standalone Architecture SVG (Product README)

**File:** `/Users/manavsehgal/Developer/stagent/public/readme/architecture.svg`

This is a self-contained SVG (900x520 viewBox) referenced by the product's README.md on GitHub. It mirrors the 3-layer architecture from Target 7 (Browser → Server → External) but uses hardcoded hex colors instead of CSS custom properties. After updating stats in the website SVGs, update this file with the **same stat values** and ensure it uses the **light theme** color scheme so it renders cleanly on GitHub's white background.

**Stats to update:**
- DB tables: search for text containing `tables · Self-healing bootstrap` — replace the table count with `<DB_TABLES>` (e.g., `<DB_TABLES> tables · Self-healing bootstrap`)
- Agent profiles: search for text containing `agent profiles` — replace the profile count with `<AGENT_PROFILES>` (e.g., `<AGENT_PROFILES> agent profiles`)
- Route pills (Browser layer): verify the listed route pills match current operator surfaces from step 6. Add or remove `<rect>`/`<text>` pairs as needed, adjusting x-positions to fit within the 820px row.

**Light theme color scheme — apply these hex replacements throughout the file:**

| Dark Hex | Role | Light Hex |
|----------|------|-----------|
| `#0F172A` | Background / card fill | `#F0F1F5` |
| `#1E293B` | Card fill / gradient end | `#FCFCFD` |
| `#334155` | Card stroke / border | `#D4D6DE` |
| `#F8FAFC`, `#F1F5F9` | Bright text (on dark bg) | `#2D3250` |
| `#94A3B8` | Title / subtitle text | `#656A80` |
| `#64748B` | Description text | `#7B8099` |
| `#475569` | Dim labels / footer | `#7B8099` |
| `#60A5FA` | Route pill text | `#2563EB` |
| `#22D3EE` | Teal accent / connectors | `#0D7D8C` |
| `#7C3AED` | Purple accent | `#7233B8` |
| `#F59E0B` | Orange accent bar | `#A66D0A` |
| `#10B981` | Green accent bar | `#0D7D5A` |
| `#EC4899` | Pink accent bar | `#B83D75` |
| `#EF4444` | Red accent bar | `#C23030` |
| `#06B6D4` | Cyan accent bar | `#0D7D8C` |
| `#D97706` | Anthropic icon | `#A66D0A` |
| `#10A37F` | OpenAI icon | `#0D7D5A` |
| `#000` (shadow filter) | Drop shadow | `#475569` at `flood-opacity="0.1"` |

**Gradient updates:**
- `bgGrad`: both stops → `#F0F1F5` (flat light background)
- `browserGrad`: `#2563EB` → `#0D7D8C`
- `serverGrad`: `#FCFCFD` → `#F0F1F5`
- `externalGrad`: `#7233B8` → `#A78BFA`

**Footer text:** update `fill` to `#656A80`.

Light hex values are derived from the website's OKLCH light-theme tokens in `src/styles/global.css` (lines 70-92).

## Post-Update Verification

### Build Check
```bash
cd /path/to/stagent.github.io && npm run build
```

Verify the build completes without errors.

### Consistency Check

After updating all locations, grep for the OLD values to catch any stragglers:
```bash
grep -rn '<OLD_FEATURES_COUNT>\|<OLD_SURFACES_COUNT>\|<OLD_AGENT_COUNT>' src/
```

Report any remaining mismatches to the user.

## Output

After writing the report and updating the website, summarize:
1. Key metrics from the latest snapshot
2. Trend deltas vs previous snapshot
3. All website files that were updated
4. Build verification result
5. Any consistency issues found
