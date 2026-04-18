# Handoff: ainative pivot — work to perform in the `stagent` (product code) repo

**Date:** 2026-04-17
**Author:** Manav Sehgal
**Companion spec:** [`docs/superpowers/specs/2026-04-17-ainative-pivot-design.md`](../docs/superpowers/specs/2026-04-17-ainative-pivot-design.md) (in the website repo)
**Target repo:** `manavsehgal/stagent` → to be renamed `manavsehgal/ainative`

---

## Why this handoff exists

The website repo (`manavsehgal/stagent.github.io`) is being pivoted from "Stagent" to "ainative". The product code repo (`manavsehgal/stagent`) needs the matching pivot to land in parallel so the two repos stay in sync. This document hands off the product-repo work to a parallel session running against that repo.

The website repo's spec covers all the website-side changes. It explicitly marks the product-code repo's changes as "Out of scope" because they happen here, in a different working directory. **This handoff is the contract between the two sessions.**

## The decisions already made (do not re-litigate)

These were settled during the website-repo brainstorm. Inherit them; do not re-open them.

1. **Software canonical name: `ainative`** (always lowercase, even at sentence start unless grammar absolutely demands `Ainative`). Same convention as `bun`, `npm`, `pnpm`. Rationale: unifies CLI + product + npm package as one identifier; defensible-by-being-descriptive; aligned with command-line-native aesthetic.
2. **The software's runtime, install flow, and behavior do NOT change.** This is a *narrative* pivot, not a *product* pivot. `npx ainative` does exactly what `npx stagent` does today. Do not refactor.
3. **Full rewrite of all "Stagent" references to "ainative"** — no historical preservation, no dual-name period. Project is 30 days old; no real citation graph to preserve.
4. **Atomic execution.** Land everything in one PR/commit batch on `main`, deploy + npm publish + GitHub repo rename within an hour. Solo author working on `main` per his preference.
5. **Repo rename target: `manavsehgal/ainative`** (not `manavsehgal/ainative-app` or anything else). GitHub auto-redirects old URLs forever.
6. **npm package name: `ainative`** (verified available on registry as of 2026-04-17). Single name, no scope (`@manavsehgal/ainative` was considered and rejected — bare name is cleaner for `npx ainative`).

## Scope of work in the `stagent` repo

### 1. Repo rename

- Rename `manavsehgal/stagent` → `manavsehgal/ainative` via GitHub repo settings.
- After rename, update local clones: `git remote set-url origin git@github.com:manavsehgal/ainative.git`.
- GitHub auto-redirects `https://github.com/manavsehgal/stagent` to the new URL permanently — no action needed for inbound link rot.

### 2. Package rename

- `package.json` → change `"name": "stagent"` to `"name": "ainative"`.
- If there's a `bin` field for the CLI, ensure the binary name is `ainative` (not `stagent`). The `npx ainative` invocation depends on this.
- Bump version to a clean release number (e.g., `0.x.0` → `0.(x+1).0`) reflecting the rename — semver-wise it's a breaking change for anyone already using `stagent` as a dependency, even though the runtime is unchanged.
- `package-lock.json` regenerate after `package.json` edit.

### 3. CLI binary / source rename

- Any string literals, log lines, banners, splash screens, help text, prompt strings, or branding output that say "Stagent" → "ainative".
- Internal module names, class names, type names that include "Stagent" or "stagent" — rename for consistency. (Type `StagentConfig` → `AinativeConfig`, etc.)
- Source filenames that include `stagent` — rename. Use `git mv` to preserve history.
- README.md (if present) — full rewrite reflecting the new framing: "ainative is the companion software for the *AI Native Business* book by Manav Sehgal." Link to https://ainative.business.

### 4. Brand surface

- npm `description` field → reframed as book companion (suggestion: *"Companion software for the AI Native Business book — a local-first agent runtime and builder scaffold for AI-native businesses."*).
- npm `homepage` field → `https://ainative.business`.
- npm `repository` field → updated to new GitHub URL.
- npm `bugs` URL → updated.
- npm `keywords` → keep technical keywords (`agents`, `local-first`, etc.); consider adding `ai-native-business` and `book-companion`.
- License field stays `Apache-2.0`.

### 5. Docs and supporting files

- README.md, CONTRIBUTING.md, CHANGELOG.md, any `/docs/`, any examples directory — all rewritten using the same 1:1 substitution rule (`Stagent` → `ainative`, lowercase mid-sentence).
- Code comments referencing "Stagent" — rewrite.
- Test names, test descriptions — rewrite where they include the brand.
- Any GitHub Actions workflow files referencing the old repo name or stagent-specific resources — update.

### 6. Asset renames

- Logo files in the repo (favicons, banners) named `stagent-*.png` → `ainative-*.png`. Update README image references. (The website repo handles its own logo assets separately.)

## Cross-repo coordination

The two pivots have to land within a tight window so visitors don't see a mid-pivot site that links to a non-existent GitHub repo.

**Required ordering:**

1. **In any order (independent):**
   - Land all changes in the website repo on `main` (covered by the website spec).
   - Land all changes in the product code repo on `main` (covered by this handoff).
2. **Then, coordinated within the same hour:**
   - Rename `manavsehgal/stagent.github.io` → `manavsehgal/ainative-business.github.io` (website).
   - Rename `manavsehgal/stagent` → `manavsehgal/ainative` (product code).
   - Update CNAME in the website repo to `ainative.business`; update DNS.
   - Publish the renamed npm package: `npm publish` for `ainative@<new-version>`.
   - Create `manavsehgal/stagent-io-redirect` (covered by website spec) — the meta-refresh shell at the old domain.

**Failure mode to avoid:** if the website rename + deploy lands while the product repo is still named `stagent`, all GitHub links on the new ainative.business site would 404 (until GitHub's auto-redirect catches up — usually instant, but not guaranteed). Mitigate by doing both renames in immediate sequence.

## Out of scope (do not do here)

- Anything in the website repo (`manavsehgal/stagent.github.io`) — the website session owns it.
- Anything in the book content (`src/data/book/`) — the book lives in the website repo.
- Anything in the research papers — they live in the website repo.
- Skills under `.claude/skills/` of the website repo — handled there.
- DNS changes for `stagent.io` and `ainative.business` — performed by the website session and Manav personally.
- The redirect repo (`stagent-io-redirect`) — the website session creates it.
- npm package for the website (`stagent-website` → `ainative-business-website`) — that's a workspace-internal name in the website repo, not published.

## Verification (before commit / publish in the product repo)

1. `grep -ri "stagent" .` in the product repo → expect zero matches outside `.git/`, `node_modules/`, lockfiles, and any deliberate historical mention in `CHANGELOG.md` (acceptable to leave a single `## Renamed from stagent` heading there for provenance).
2. `grep -ri "Stagent" .` → zero matches outside the same exceptions.
3. CLI smoke test: `npm pack && npx ./ainative-<version>.tgz` → verify the binary launches, the help text says "ainative", no "Stagent" appears in any output.
4. `npm publish --dry-run` → verify the package metadata (name, description, repository, homepage) all show ainative branding.
5. Tag the release: `git tag v<new-version>`, `git push --tags`.

## After both repos land

- Verify the website at `https://ainative.business/` shows the new branding, with the GitHub link in the nav resolving to `https://github.com/manavsehgal/ainative` (HTTP 200, not 404).
- Verify `https://stagent.io/<any-path>` redirects to `https://ainative.business/<any-path>` (path-preserving meta-refresh).
- Verify `npm view ainative` shows the published package with the new metadata.
- Notify the few people who have the old `stagent.io` URL or have done `npx stagent` — direct them to the new commands and links.

## References

- Website pivot spec: [`docs/superpowers/specs/2026-04-17-ainative-pivot-design.md`](../docs/superpowers/specs/2026-04-17-ainative-pivot-design.md)
- Memory: stagent.io is the credibility anchor for the paid Maven cohort (one-way relationship — Maven points to the site, the site does not point back). After the pivot, ainative.business inherits this role; no Maven-side action required from this handoff (Maven cohort copy lives outside both repos).
