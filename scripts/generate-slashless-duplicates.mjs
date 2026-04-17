/**
 * Post-build step: for every dist/<path>/index.html, write a byte-identical
 * sibling at dist/<path>.html so GitHub Pages serves the slashless URL with
 * 200 OK instead of a 301 redirect to the trailing-slash variant.
 *
 * Why: Google Search Console flags any URL it discovered (via backlinks, old
 * sitemaps, AI crawler mirrors, etc.) that returns a 301 as "Page with
 * redirect", and reports those pages as failing indexing. GitHub Pages always
 * 301s `/foo` -> `/foo/` when only `foo/index.html` exists, and that redirect
 * cannot be disabled in any GH Pages setting. Placing a sibling `foo.html`
 * file short-circuits the redirect: the file is served directly with 200 OK.
 *
 * The site emits root-absolute URLs (`/_astro/...`, `/docs/foo/`, `/img.png`)
 * for every asset and link, so the same HTML works correctly when served from
 * either the slash or non-slash URL. The canonical tag in the duplicated HTML
 * still points to the trailing-slash variant, so Google consolidates to the
 * canonical form on its next crawl and the GSC warning clears.
 *
 * Excluded paths mirror the sitemap filter in astro.config.mjs:
 *   - dist/index.html (root has no non-slash variant)
 *   - any path containing /confirmed (post-checkout success page, noindex)
 *   - any path containing /og (Open Graph image renderers, noindex)
 */
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const distDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist');

const EXCLUDED_PATH_SEGMENTS = ['/confirmed', '/og', '/book/print'];

let created = 0;
let skipped = 0;
let bytes = 0;

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(full);
    } else if (entry.name === 'index.html') {
      await maybeDuplicate(full);
    }
  }
}

async function maybeDuplicate(indexHtmlPath) {
  // Skip the root dist/index.html — `/` has no non-slash form.
  if (indexHtmlPath === join(distDir, 'index.html')) return;

  // Path of the parent directory relative to dist, with leading slash.
  // e.g. dist/docs/monitoring/index.html -> /docs/monitoring
  const parentDir = dirname(indexHtmlPath);
  const relFromDist = '/' + parentDir.slice(distDir.length + 1).split('\\').join('/');

  if (EXCLUDED_PATH_SEGMENTS.some((seg) => relFromDist.includes(seg))) {
    skipped++;
    return;
  }

  // Sibling target: dist/docs/monitoring.html
  const targetPath = join(dirname(parentDir), basename(parentDir) + '.html');

  if (existsSync(targetPath)) {
    console.warn(
      `[slashless-duplicates] WARN: ${targetPath} already exists, skipping`,
    );
    skipped++;
    return;
  }

  const content = await readFile(indexHtmlPath);
  await writeFile(targetPath, content);
  created++;
  bytes += content.length;
}

await walk(distDir);

const mb = (bytes / 1024 / 1024).toFixed(2);
console.log(
  `[slashless-duplicates] Wrote ${created} sibling .html files (+${mb} MB), skipped ${skipped}`,
);
