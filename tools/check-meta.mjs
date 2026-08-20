#!/usr/bin/env node
/**
 * tools/check-meta.mjs
 * Verifies that <title> and <meta name="description"> in dist/*.html
 * match the frozen snapshot in tools/legacy-meta.json.
 * Exits with code 1 if mismatches are found.
 */
import { readFileSync, existsSync, readdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');
const distDir = resolve(rootDir, 'dist');
const snapshotPath = resolve(__dirname, 'legacy-meta.json');

if (!existsSync(distDir)) {
  console.error('dist/ not found — run npm run build first');
  process.exit(1);
}

const snapshot = JSON.parse(readFileSync(snapshotPath, 'utf8'));

function extractTitle(html) {
  const m = html.match(/<title>([^<]*)<\/title>/i);
  return m ? m[1].replace(/&amp;/g, '&').trim() : null;
}

function extractDescription(html) {
  const m = html.match(/<meta\s+name="description"\s+content="([^"]*)"/i)
    ?? html.match(/<meta\s+content="([^"]*)"\s+name="description"/i);
  return m ? m[1].replace(/&amp;/g, '&').trim() : null;
}

const SKIP = new Set(['404.html']);

const distFiles = readdirSync(distDir)
  .filter(f => f.endsWith('.html') && !SKIP.has(f));

let mismatches = 0;
const errors = [];

for (const file of distFiles.sort()) {
  const expected = snapshot[file];
  if (!expected) {
    console.warn(`  SKIP: no snapshot entry for ${file}`);
    continue;
  }

  const distHtml = readFileSync(resolve(distDir, file), 'utf8');
  const distTitle = extractTitle(distHtml);
  const distDesc = extractDescription(distHtml);

  if (distTitle !== expected.title) {
    errors.push(`  TITLE MISMATCH in ${file}:`);
    errors.push(`    expected: ${expected.title}`);
    errors.push(`    dist:     ${distTitle}`);
    mismatches++;
  }
  if (distDesc !== expected.description) {
    errors.push(`  DESC MISMATCH in ${file}:`);
    errors.push(`    expected: ${expected.description}`);
    errors.push(`    dist:     ${distDesc}`);
    mismatches++;
  }
}

if (mismatches > 0) {
  console.error(`\n❌ ${mismatches} meta mismatch(es):\n`);
  for (const e of errors) console.error(e);
  process.exit(1);
} else {
  console.log(`✅ All meta tags match snapshot (${distFiles.length} pages checked, 404.html excluded)`);
  process.exit(0);
}
