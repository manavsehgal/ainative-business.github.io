# Folding ai-field-notes into ainative.business

**Status:** Strategy approved 2026-05-02. Implementation follows in subsequent sessions per the phased roadmap below.

**Author:** Manav Sehgal (with Claude as thinking partner)

---

## Executive summary

Both `ainative.business` and `ai-field-notes` share design DNA but live as separate properties with separate audiences. This strategy consolidates them under a single brand — **AI Native** — by transplanting the more refined editorial system from `ai-field-notes` *up* into `ainative.business`, retiring `/research/` in favor of a single `/field-notes/` editorial section, and folding the existing two research papers into a new "AI Native Platform" series.

The result: one brand, one editorial system, two writing properties (Book + Field Notes), two product properties (Platform + Fieldkit), and a five-item nav that reads as a polish gradient from canonical to source.

The existing GitHub Pages blog at `manavsehgal.github.io/ai-field-notes/` is decommissioned via a hard cut (no redirect stubs — the site is 4 weeks old with no analytics or backlinks worth preserving). The `ai-field-notes` repository continues to live on the DGX Spark as the drafting environment; integrations into the published site happen by reading from a local MacBook clone.

---

## Why now

Two arguments converge:

1. **Audience expansion through bridging.** `ainative.business` reaches business architects, solo founders, and enterprise solutions leaders thinking about agents at the org level. `ai-field-notes` reaches ML engineers and AI builders working at the silicon level. A small middle of readers consume both. Folding the two creates one destination with two clear front doors and a credibility-halo effect for the leader audience — a reader who never clicks into a KV-cache article still perceives the depth of hands-on rigor by seeing the volume of field notes nearby.

2. **The editorial system in `ai-field-notes` is the better-designed one.** It has stages, series, tags, ordinal sequencing, evidence-folder patterns, and proper article taxonomies — all wired into the content schema. The current `ainative.business/research/` is two papers shoehorned into MDX without that infrastructure. Transplanting up costs less than building down.

---

## The decision narrative (condensed)

| Question | Decision | Why |
|---|---|---|
| Who is the audience after consolidation? | Bridge two distinct audiences (builders + leaders) under one brand. Subgoal: deepen credibility halo with leaders. | Same-brand front doors > cross-promotion across separate brands. |
| How do field notes articles enter the new site? | All 33 articles (29 published + 4 upcoming + 2 reframed research) land in a single `/field-notes/` collection, with **series-level segmentation** carrying polish-tier signals. | Original three-tier hybrid (notes → research → book footnotes) had real promotion-pipeline drag. Single editorial system with series naming is simpler and just as expressive. |
| URL strategy + fate of existing blog? | Hard cut. GitHub Pages on `ai-field-notes` repo turned off (Settings → Pages → Source: None). Old URLs return 404. | Site is 4 weeks old, no analytics, no submitted sitemap, no backlinks. SEO migration cost is near-zero. Stub-page redirect machinery would be over-engineering. |
| Homepage + nav IA? | Co-equal top-level nav for `/field-notes/`. Drop Home (logo serves home). Drop About (footer). Drop Research (replaced by Field Notes). Demote API from top nav into Platform sidebar. | Builders need a clear front door; leaders see the volume of hands-on work as a halo signal even without clicking in. |
| Fieldkit positioning? | First-class top-level section at `/fieldkit/`. Co-equal with `/platform/` (renamed from `/docs/`). | Symmetric to the writing properties — Book pairs with Platform; Field Notes pairs with Fieldkit. Two products, two writing properties, one brand. |
| Visual treatment for `/field-notes/`? | Editorial UI transplanted from ai-field-notes (templates, components, typography, color tokens). Parent `ai-native-logo.png` stays. Marked Field wordmark retired. | Borrow what's better-designed; preserve what carries equity. Both palettes are oklch hue 250 — no collision. |
| Newsletter integration? | Single list, single stream. Renamed to "AI Native Field Notes." Drip-feed cadence from launch (zero subscribers today = no migration debt). Site-wide RSS at `/feed.xml`. | RSS gives builders a frictionless route; newsletter remains the leader-friendly path. Single list keeps operational drag low. |

---

## Final architecture

### Navigation

```
[Logo→/]   Book   Field Notes   Fieldkit   Platform   GitHub
```

- **5 nav items.** Logo links to `/`.
- Polish gradient L→R: canonical (Book) → field (Field Notes) → tooling (Fieldkit) → platform (Platform) → source (GitHub).
- About moves to footer.
- API demoted from top nav; becomes the *first item* in the `/platform/` sidebar (renamed "Platform API" within Platform).

### Brand identity

- **Logo:** `ai-native-logo.png` (parent). Marked Field wordmark retired entirely.
- **Editorial UI ported from ai-field-notes:** templates, layout primitives, content schema with stages/series/tags/ordinal, monospace metadata treatment (Geist Mono), Geist Sans for body and headers, color tokens, micro-interactions.
- **Naming pattern:** AI Native Business (book), AI Native Field Notes (editorial section + newsletter), AI Native Platform (series within Field Notes + the open-source platform product).
- **Palettes reconciled:** both sites use oklch hue 250; merge into one canonical token set during the port.

### Content model

- One `field-notes` Astro content collection at `src/content/field-notes/<slug>/article.md`.
- Frontmatter: `stage`, `series`, `tags`, `ordinal`, `publishedAt`, `summary`, `evidence`.
- Stage taxonomy carries from the existing blog: Foundations, Inference, Agentic, Training, Fine-tuning, Observability, Deployment, Dev-tools.
- New series: **AI Native Platform** — threads across stages and absorbs the two existing research papers as ordinals 1 and 2.
  - Ordinal 1: *AI Transformation Research* (Mar 2026, market analysis, $52.62B agent market)
  - Ordinal 2: *Case Study: One Day, One Builder* (Apr 2026, applied case study)
- Article *titles* of the two reframed pieces stay serious (preserve authority signal); only the *section name* changes from Research to Field Notes. The "AI Native Platform" series name carries the business-architectural authority cue for the leader audience.

### Newsletter & RSS

- Newsletter: **"AI Native Field Notes"** (renamed from "AI Native research"). Single list. Research-paper-equivalent content + field notes flow through one stream.
- Drip-feed launch cadence — Stage 1 ships 2026-05-01 with zero existing subscribers, so day-one expectations get set as "papers + weekly digest." No migration debt.
- Site-wide RSS at `/feed.xml/` via Astro's RSS integration. Linked from footer + each section's footer.
- `WaitlistForm` source tag: `field-notes-newsletter` (was `research-newsletter`). Supabase function unchanged for single-list strategy.

### Authoring & publishing workflow

- **DGX Spark** continues hosting the canonical authoring environment in `/Users/manavsehgal/Developer/ai-field-notes/`. Claude Code, tech-writer skill, fieldkit evidence folders unchanged.
- Articles drafted on Spark, pushed to the `ai-field-notes` GitHub repo (unchanged).
- **MacBook** pulls the repo locally to `/Users/manavsehgal/Developer/ai-field-notes/`.
- Integration into `ainative-business.github.io` happens by reading from the local clone and writing to the Astro content collection — manual `cp` + commit, a small `fieldkit publish` CLI command, or a sync script. Mechanism decided at integration time.

### Existing blog decommission

- On `ai-field-notes` GitHub repo: **Settings → Pages → Source: None** (or delete `.github/workflows/deploy.yml`). URLs at `manavsehgal.github.io/ai-field-notes/*` serve 404 within minutes.
- No redirect stubs. Site is 4 weeks old with no analytics, no submitted sitemap, no backlinks worth preserving.
- Update `ai-field-notes/README.md` with archive banner: *"Archived. Content now published at https://ainative.business/field-notes/. This repo continues as the DGX Spark drafting environment."*
- Update GitHub repo description to match.
- **Don't archive the repo via GitHub settings** — keep it active as the authoring environment.

---

## Migration roadmap

### Phase 1 — Foundation (port editorial substrate)

- Port content schema to `ainative-business.github.io/src/content.config.ts` (`stage`, `series`, `tags`, `ordinal`, `evidence` shape).
- Port editorial components from ai-field-notes: `ArticleHeader`, `ArticleFooter`, `SeriesCard`, `StageCard`, `TagPill`, `OrdinalLabel`.
- Integrate Geist Sans + Geist Mono fonts.
- Reconcile two oklch hue 250 palettes into one canonical design-token set in `src/styles/global.css`.
- Set up new `/field-notes/` collection scaffolding.
- Set up site-wide RSS feed at `/feed.xml/` using `@astrojs/rss`.

### Phase 2 — Content migration

- Read from local clone of `/Users/manavsehgal/Developer/ai-field-notes/`.
- Copy 29 published + 4 upcoming articles into `src/content/field-notes/<slug>/article.md`.
- Adapt frontmatter to the new collection schema.
- Decide on evidence-folder migration: port public-friendly excerpts; link out to GitHub for raw evidence where appropriate.
- Verify stages, series, tags resolve in their respective index pages.

### Phase 3 — Research reframe

- Move existing `/research/ai-transformation.mdx` and `/research/solo-builder-case-study.mdx` into the field-notes collection with series `ai-native-platform`, ordinals 1 and 2.
- Add 301 redirects in `astro.config.mjs`: `/research/*` → `/field-notes/*`.
- Preserve article titles unchanged.

### Phase 4 — Nav + brand cleanup

- Update `Nav.astro`: drop Home/About/Research/API; add Field Notes/Fieldkit; rename Docs → Platform.
- Move About to footer.
- Promote API Reference to first item in `/platform/` sidebar; rename "Platform API" within.
- Add 301 redirects in `astro.config.mjs`: `/docs/*` → `/platform/*`.
- Update homepage with "From the Field — latest" rail (3 most recent articles).
- Update all CTA copy and OG metadata from "Research" to "Field Notes" where appropriate.

### Phase 5 — Newsletter + decommission

- Update `WaitlistForm` source tag and CTA copy.
- Rename newsletter brand to "AI Native Field Notes" across all UI.
- On `ai-field-notes` GitHub repo: Settings → Pages → Source: None.
- Update `ai-field-notes/README.md` with archive banner.
- Update GitHub repo description.

### Phase 6 — Verification

End-to-end checks (per plan file):

1. `npm run build` succeeds without errors or broken links.
2. `/field-notes/` lists all 33 articles correctly.
3. `/field-notes/series/ai-native-platform/` shows both reframed research papers in correct ordinal sequence.
4. `/field-notes/stages/<stage>/` pages render for each stage.
5. `/field-notes/tags/<tag>/` pages render with correct article lists.
6. `/feed.xml/` includes all field-notes articles in publication order.
7. `/research/ai-transformation/` returns 301 to `/field-notes/ai-transformation/`.
8. `/docs/api/` returns 301 to `/platform/api/`.
9. Homepage Field Notes rail renders 3 most recent articles; all CTAs read "Subscribe to AI Native Field Notes"; no "Research" references remain in nav, hero, or footer.
10. Footer contains About link and RSS link.
11. `manavsehgal.github.io/ai-field-notes/` returns 404 post-decommission.
12. Spot-check 5 random `/field-notes/` articles — monospace metadata, stage badge, series badge, ordinal label all render.
13. `ai-native-logo.png` (parent) appears on all pages; Marked Field wordmark appears nowhere on `ainative.business`.

---

## Open tactical decisions (deferred to integration time)

These don't block strategy approval. Decide at the relevant phase.

- **Evidence-folder migration scope.** Each ai-field-notes article has an `evidence/` folder with working code (~30k Python). Options: port public-friendly subsets into `/public/evidence/<slug>/`, link out to GitHub for raw evidence, or omit. Likely a per-article call.
- **Sync mechanism between Spark and MacBook.** Manual `cp`+commit on each integration is fine to start. If volume grows, a `fieldkit publish` CLI subcommand or rsync-based script can formalize it later.
- **Newsletter sender platform.** Currently the Supabase function captures emails to a list; the actual sending tool (Buttondown, Substack, or DIY via Resend) isn't decided. Independent of this strategy.
- **Tag canonicalization.** ai-field-notes has tags like `dgx-spark`, `nim`, `nemo-framework`. Decide whether to add platform-leaning tags (`ainative-platform`, `agent-orchestration`) for the AI Native Platform series articles to aid cross-discovery.
- **OG card design for Field Notes articles.** ai-field-notes has per-article OG fallbacks; ainative.business may want a unified Field Notes template. Defer to Phase 4.

---

## Rejected paths (for future-self reference)

These were considered and explicitly chosen against. Captured here so we don't relitigate accidentally.

| Rejected | Why it was rejected |
|---|---|
| Subdomain (`notes.ainative.business`) | Adds a separate Astro project to maintain; "one brand, one URL property" is cleaner. |
| Cross-publish with `rel=canonical` | Operational drag for marginal benefit; Google honors canonicals ~95%, not 100%. |
| Syndicate excerpts only, keep ai-field-notes as canonical | Contradicts the "one brand" mandate. |
| Three-tier hybrid (notes → research → book footnotes) | Real promotion-pipeline drag. Series-level segmentation is simpler and equally expressive. |
| Volume 2 of the book | Heaviest editorial lift; restructuring 29 articles into chapters would break their original editorial intent. |
| Two newsletters (research-only + field-notes-only) | Doubles list-management overhead; dilutes the brand. |
| Spark glyph as a section icon | Decided to retire the Marked Field visual identity entirely for cleaner consolidation. |
| Notes nested under Research | Buries the bridge — leaders only feel the halo if they happen to navigate to /research/. |
| Dual-track homepage hero ("For builders / For leaders") | Forces a binary choice on first visit; nav-based self-routing is gentler. |

---

## References

- Plan file: `/Users/manavsehgal/.claude/plans/explore-the-ainative-business-http-ainat-agile-graham.md`
- Source repo (target): `/Users/manavsehgal/Developer/ainative-business.github.io/`
- Source repo (content origin): `/Users/manavsehgal/Developer/ai-field-notes/` (local MacBook clone of Spark-resident authoring repo)
- Existing blog (to be decommissioned): `https://manavsehgal.github.io/ai-field-notes/`
- Companion package: `fieldkit` (Python, currently in `ai-field-notes/fieldkit/`, v0.1.0)
