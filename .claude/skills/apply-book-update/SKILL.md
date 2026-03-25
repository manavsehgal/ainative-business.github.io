---
name: apply-book-update
description: Sync book content from the Stagent product to the stagent.io website. Compares chapter markdown files and images, copies changed content, and verifies the build. Use when the user says "update book", "sync book", "refresh book content", "apply book update", "sync book chapters", "update book content", "book content is stale", "new book chapters", "refresh book from product", "copy book chapters", "update book images", or any request to update, sync, or refresh the AI Native book content on the website from the source product repository. Also trigger after "apply product release" if the user mentions book content.
---

# Apply Book Update Skill

Syncs the "AI Native" book content (9 chapter markdown files + images) from the Stagent product repository to the stagent.io marketing website. The book lives as a React island reader at `/book/[chapter-slug]` and content is parsed at Astro build time.

## Source and Target Paths

| Content | Source | Target |
|---------|--------|--------|
| Chapters | `/Users/manavsehgal/Developer/stagent/book/chapters/*.md` | `src/data/book/chapters/` |
| Images | `/Users/manavsehgal/Developer/stagent/book/images/*` | `public/book/images/` |

The website project root is `/Users/manavsehgal/Developer/stagent.github.io/`.

## 5-Step Workflow

### Step 1: Compare Chapter Files

Check which chapter files have changed between source and target using file checksums. This avoids unnecessary copies and gives a clear change report.

```bash
cd /Users/manavsehgal/Developer/stagent.github.io
for src in /Users/manavsehgal/Developer/stagent/book/chapters/*.md; do
  name=$(basename "$src")
  tgt="src/data/book/chapters/$name"
  if [ ! -f "$tgt" ]; then
    echo "NEW: $name"
  elif ! diff -q "$src" "$tgt" > /dev/null 2>&1; then
    echo "CHANGED: $name"
  fi
done
echo "---"
echo "Checking images..."
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

If nothing changed, report "Book content is up to date" and stop.

### Step 2: Copy Changed Chapters

Copy only the changed or new markdown files from source to target:

```bash
cp /path/to/changed/files src/data/book/chapters/
```

For each changed chapter, briefly read the diff to understand what changed (new sections, updated content, fixes). This context is useful for the change report.

### Step 3: Copy Changed Images

Copy only changed or new image files:

```bash
cp /path/to/changed/images public/book/images/
```

### Step 4: Verify Build

Run the Astro build to confirm all chapter pages generate correctly:

```bash
npm run build 2>&1 | tail -20
```

The build should produce pages under `/book/` for each chapter. Check for:
- All 9 chapter routes generated (or however many exist in source)
- No build errors
- Book index page generated at `/book/index.html`

If the build fails, investigate the error. Common issues:
- Frontmatter format changes in chapter markdown (the parser expects YAML frontmatter with `title`, `subtitle`, `chapter`, `part`, `readingTime` fields)
- New content block syntax not supported by the markdown parser at `src/lib/book/markdown-parser.ts`
- Image references in chapters pointing to files that weren't copied

### Step 5: Report Changes

Summarize what was updated in a clear report:

```
## Book Content Updated

### Chapters Changed
- ch-1-project-management.md — [brief description of changes]
- ch-5-scheduled-intelligence.md — [brief description of changes]

### Images Changed
- workflow-progress.png — [new/updated]

### Build Status
✓ All 9 chapter pages generated successfully
```

## Content Architecture Notes

Understanding how the book content flows through the system helps diagnose issues:

1. **Markdown files** in `src/data/book/chapters/` contain YAML frontmatter + markdown body
2. **At build time**, `src/pages/book/[...slug].astro` reads each file via `fs.readFileSync`
3. **Frontmatter is parsed** to extract metadata (title, subtitle, chapter number, part, reading time)
4. **Body is parsed** by `src/lib/book/markdown-parser.ts` into structured `ContentBlock[]` (text, code, callout, image, interactive blocks)
5. **All 9 chapters** are serialized as JSON props to the React `BookReader` component
6. **Images** are referenced as `/book/images/filename.png` in the markdown and served from `public/book/images/`

## Chapter File Format

Each chapter markdown file uses this frontmatter format:

```yaml
---
title: "Chapter Title"
subtitle: "Chapter Subtitle"
chapter: 1
part: 1
readingTime: 12
relatedDocs: ["docs-slug-1", "docs-slug-2"]
relatedJourney: "journey-slug"
---
```

The body uses standard markdown with these extensions:
- `> [!tip]`, `> [!warning]`, `> [!info]`, `> [!lesson]`, `> [!authors-note]` for callout blocks
- `<!-- filename: path -->` before code fences for filename headers
- `[Try: label](href)` for interactive link blocks
- `<details><summary>label</summary>...</details>` for collapsible sections

## When Source Structure Changes

If the source adds new chapters (beyond ch-1 through ch-9), you also need to update:
- `src/lib/book/content.ts` — Add the new chapter to `CHAPTERS` array and `CHAPTER_SLUG_MAP`
- `src/lib/book/reading-paths.ts` — Optionally add the chapter to reading paths
- `src/pages/book/index.astro` — The landing page auto-renders from `CHAPTERS`, so it picks up new entries automatically
