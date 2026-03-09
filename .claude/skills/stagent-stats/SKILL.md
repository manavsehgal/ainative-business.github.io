---
name: stagent-stats
description: Collect development metrics (LOC, tests, commits, features, infrastructure) from the Stagent project and write a timestamped report to stagent-stats.md. Use when the user asks to check project stats, update metrics, or track development velocity.
---

This skill collects comprehensive development metrics from the Stagent project and writes them to `stagent-stats.md` as a timestamped entry. Each run appends a new entry, building a time-series of project velocity.

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

# Pages
find /Users/manavsehgal/Developer/stagent/src/app -name "page.tsx" 2>/dev/null | wc -l

# Agent profiles
find /Users/manavsehgal/Developer/stagent/src -path "*/agents/*" -name "*.ts" 2>/dev/null | wc -l
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

## Output

After writing the report, summarize the key metrics to the user in a concise format. Highlight any notable velocity changes if previous data exists.

## Updating the Website

After collecting stats, also update the Stagent entry in `src/data/timeline.ts` in the stagent.github.io project with the latest values so the website stays current. Update these fields in the Stagent timeline entry:
- `stats` — LOC count, test count, features shipped ratio
- `achievements` — notable milestones
- `description` — if scope has meaningfully changed
