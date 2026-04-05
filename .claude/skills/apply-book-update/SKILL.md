---
name: apply-book-update
description: Sync book content from the Stagent product to the stagent.io website. Compares chapter markdown files and images, copies changed content, updates code files if structure changed, and verifies the build. Use when the user says "update book", "sync book", "refresh book content", "apply book update", "sync book chapters", "update book content", "book content is stale", "new book chapters", "refresh book from product", "copy book chapters", "update book images", or any request to update, sync, or refresh the AI Native book content on the website from the source product repository. Also trigger after "apply product release" if the user mentions book content.
---

# Apply Book Update Skill

Syncs the "AI Native" book content (12 chapter markdown files + images) from the Stagent product repository to the stagent.io marketing website. The book lives as a React island reader at `/book/[chapter-slug]` and content is parsed at Astro build time.

## Source and Target Paths

| Content | Source | Target |
|---------|--------|--------|
| Chapters | `/Users/manavsehgal/Developer/stagent/book/chapters/*.md` | `src/data/book/chapters/` |
| Images | `/Users/manavsehgal/Developer/stagent/book/images/*` | `public/book/images/` |

The website project root is `/Users/manavsehgal/Developer/stagent.github.io/`.

## Chapter Manifest

| ID | Filename | Part |
|----|----------|------|
| ch-1 | `ch-1-from-hierarchy-to-intelligence.md` | 1 |
| ch-2 | `ch-2-the-ai-native-blueprint.md` | 1 |
| ch-3 | `ch-3-the-refinery.md` | 2 |
| ch-4 | `ch-4-the-forge.md` | 2 |
| ch-5 | `ch-5-blueprints.md` | 2 |
| ch-6 | `ch-6-the-arena.md` | 2 |
| ch-7 | `ch-7-institutional-memory.md` | 3 |
| ch-8 | `ch-8-the-swarm.md` | 3 |
| ch-9 | `ch-9-the-governance-layer.md` | 3 |
| ch-10 | `ch-10-the-world-model.md` | 4 |
| ch-11 | `ch-11-the-machine-that-builds-machines.md` | 4 |
| ch-12 | `ch-12-the-road-ahead.md` | 4 |

## Complete File Manifest

All files that may need updating during a book sync:

| # | File | When to Update |
|---|------|---------------|
| 1 | `src/data/book/chapters/*.md` | Every sync |
| 2 | `public/book/images/*` | Every sync |
| 3 | `src/lib/book/content.ts` | When chapters added/removed/reordered |
| 4 | `src/lib/book/types.ts` | When new callout variants added |
| 5 | `src/lib/book/markdown-parser.ts` | When new callout variants added |
| 6 | `src/components/book/content-blocks.tsx` | When new callout variants added |
| 7 | `src/styles/book.css` | When new callout variants added |
| 8 | `src/lib/book/reading-paths.ts` | When chapters added/removed |
| 9 | `src/pages/book/index.astro` | When parts count or description changes |

## 7-Step Workflow

### Step 1: Detect Sync Mode

Determine whether this is a **migration** (old chapter filenames still in target) or an **incremental sync** (new filenames already present):

```bash
cd /Users/manavsehgal/Developer/stagent.github.io
if [ -f "src/data/book/chapters/ch-1-project-management.md" ]; then
  echo "MODE: MIGRATION — old chapter files detected, full structural update needed"
elif [ -f "src/data/book/chapters/ch-1-from-hierarchy-to-intelligence.md" ]; then
  echo "MODE: INCREMENTAL — new chapter files already in place, checking for content changes"
else
  echo "MODE: FRESH — no chapter files found, full copy needed"
fi
```

- **Migration mode**: Delete old files, copy all new ones, update all code files in the manifest
- **Incremental mode**: Diff-based copy of changed chapters/images only
- **Fresh mode**: Same as migration but no old files to delete

### Step 2: Compare Files

Check which files have changed between source and target:

```bash
cd /Users/manavsehgal/Developer/stagent.github.io
echo "=== Chapters ==="
for src in /Users/manavsehgal/Developer/stagent/book/chapters/*.md; do
  name=$(basename "$src")
  tgt="src/data/book/chapters/$name"
  if [ ! -f "$tgt" ]; then
    echo "NEW: $name"
  elif ! diff -q "$src" "$tgt" > /dev/null 2>&1; then
    echo "CHANGED: $name"
  fi
done
echo "--- Stale target files ---"
for tgt in src/data/book/chapters/ch-*.md; do
  name=$(basename "$tgt")
  src="/Users/manavsehgal/Developer/stagent/book/chapters/$name"
  if [ ! -f "$src" ]; then
    echo "STALE (delete): $name"
  fi
done
echo "=== Images ==="
for src in /Users/manavsehgal/Developer/stagent/book/images/*; do
  name=$(basename "$src")
  tgt="public/book/images/$name"
  if [ ! -f "$tgt" ]; then
    echo "NEW IMAGE: $name"
  elif ! diff -q "$src" "$tgt" > /dev/null 2>&1; then
    echo "CHANGED IMAGE: $name"
  fi
done
```

If nothing changed and mode is incremental, report "Book content is up to date" and stop.

### Step 3: Copy Chapters

**Migration/Fresh mode**: Delete all old chapter files, then copy all 12 new ones:

```bash
rm -f src/data/book/chapters/ch-*.md
cp /Users/manavsehgal/Developer/stagent/book/chapters/*.md src/data/book/chapters/
```

**Incremental mode**: Copy only changed or new files:

```bash
cp /path/to/changed/files src/data/book/chapters/
```

Delete any stale target files that no longer exist in source.

For each changed chapter, briefly read the diff to understand what changed (new sections, updated content, fixes). This context is useful for the change report.

### Step 4: Copy Changed Images

Copy only changed or new image files:

```bash
cp /path/to/changed/images public/book/images/
```

Remove any stale image files that no longer exist in source.

### Step 5: Update Code Files (Structural Changes)

**This step runs in migration/fresh mode, or when source adds/removes chapters or introduces new callout types.** In incremental mode with no structural changes, skip this step.

Update each file as needed:

#### 5a. `src/lib/book/content.ts`

Update `CHAPTER_SLUG_MAP` to map all 12 chapter IDs to their filenames. Update `PARTS` array to 4 parts. Update `CHAPTERS` array with all 12 entries — read frontmatter from each source chapter file to populate `title`, `subtitle`, `readingTime`, `relatedDocs`, and `relatedJourney`.

Part assignments:
- Part 1: ch-1, ch-2
- Part 2: ch-3, ch-4, ch-5, ch-6
- Part 3: ch-7, ch-8, ch-9
- Part 4: ch-10, ch-11, ch-12

Read the source chapter frontmatter for part titles/descriptions if available, otherwise derive from chapter themes.

#### 5b. `src/lib/book/types.ts`

Add `"case-study"` to the `CalloutBlock` variant union type. Keep existing variants for backward compatibility:

```typescript
variant: "tip" | "warning" | "info" | "lesson" | "authors-note" | "case-study";
```

#### 5c. `src/lib/book/markdown-parser.ts`

Add `case-study` to the callout regex pattern on the line matching `calloutMatch`:

```typescript
const calloutMatch = line.match(/^>\s*\[!(tip|warning|info|lesson|authors-note|case-study)\]\s*$/);
```

#### 5d. `src/components/book/content-blocks.tsx`

Add `case-study` entry to the `calloutConfig` object. Import an appropriate icon (e.g., `FileText` from lucide-react):

```typescript
"case-study": { icon: FileText, className: "book-callout-case-study" },
```

Update the `CalloutBlockView` variant type prop to include `"case-study"`.

#### 5e. `src/styles/book.css`

Add CSS rules for the new callout variant after the existing callout styles:

```css
.book-callout-case-study {
  border-color: oklch(0.55 0.12 230);
}
.book-callout-case-study .book-callout-icon {
  color: oklch(0.55 0.12 230);
}
```

#### 5f. `src/lib/book/reading-paths.ts`

Update reading path `chapterIds` arrays to reference the new chapter IDs (ch-1 through ch-12). Redesign paths to match the new chapter themes:

- **Getting Started**: ch-1, ch-2 (foundation/blueprint chapters)
- **Personal Use**: ch-3, ch-5, ch-6 (chapters with `relatedJourney: "personal-use"` or `"power-user"`)
- **Work Use**: ch-4, ch-7, ch-8, ch-9 (chapters with `relatedJourney: "work-use"` or `developer`)
- **Complete**: ch-1 through ch-12

Adjust based on the `relatedJourney` values in chapter frontmatter.

#### 5g. `src/pages/book/index.astro`

- Update the meta description to reference 12 chapters and 4 parts
- Change the hardcoded `3 parts` text in the hero stats to `{PARTS.length} parts`
- Update any other hardcoded references to chapter counts

### Step 6: Verify Build

Run the Astro build to confirm all chapter pages generate correctly:

```bash
npm run build 2>&1 | tail -20
```

The build should produce pages under `/book/` for each chapter. Check for:
- All 12 chapter routes generated
- No build errors
- Book index page generated at `/book/index.html`

If the build fails, investigate the error. Common issues:
- Frontmatter format changes in chapter markdown (the parser expects YAML frontmatter with `title`, `subtitle`, `chapter`, `part`, `readingTime` fields)
- New callout type not added to the parser regex, types, or component
- Missing icon import in `content-blocks.tsx`
- CSS class not defined for a new callout variant

### Step 7: Report Changes

Summarize what was updated in a clear report:

```
## Book Content Updated

### Sync Mode
Migration / Incremental

### Chapters Changed
- ch-1-from-hierarchy-to-intelligence.md — [brief description]
- ch-5-blueprints.md — [brief description]

### Images Changed
- workflow-progress.png — [new/updated]

### Code Files Updated
- content.ts — updated CHAPTERS, PARTS, CHAPTER_SLUG_MAP
- types.ts — added case-study variant
- [etc.]

### Build Status
✓ All 12 chapter pages generated successfully
```

## Content Architecture Notes

Understanding how the book content flows through the system helps diagnose issues:

1. **Markdown files** in `src/data/book/chapters/` contain YAML frontmatter + markdown body
2. **At build time**, `src/pages/book/[...slug].astro` reads each file via `fs.readFileSync`
3. **Frontmatter is parsed** to extract metadata (title, subtitle, chapter number, part, reading time, lastGeneratedBy)
4. **Body is parsed** by `src/lib/book/markdown-parser.ts` into structured `ContentBlock[]` (text, code, callout blocks)
5. **All 12 chapters** across **4 parts** are serialized as JSON props to the React `BookReader` component
6. **Images** are referenced as `/book/images/filename.png` in the markdown and served from `public/book/images/`

## Chapter File Format

Each chapter markdown file uses this frontmatter format:

```yaml
---
title: "Chapter Title"
subtitle: "Chapter Subtitle"
chapter: 1
part: 1
readingTime: 14
lastGeneratedBy: "2026-04-05T00:00:00.000Z"
relatedDocs: ["docs-slug-1", "docs-slug-2"]
relatedJourney: "personal-use"
---
```

Required fields: `title`, `subtitle`, `chapter`, `part`, `readingTime`, `lastGeneratedBy`
Optional fields: `relatedDocs` (array of doc page slugs), `relatedJourney` (one of: `"personal-use"`, `"work-use"`, `"power-user"`, `"developer"`)

The body uses standard markdown with these patterns:
- `## Section Title` for major sections (no deeper nesting)
- `> [!case-study]` for case study callout blocks (the only callout type used)
- ` ```typescript ` for code blocks (TypeScript only)
- Standard bold, italic, inline code, and blockquote formatting
