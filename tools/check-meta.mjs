#!/usr/bin/env node
/**
 * tools/check-meta.mjs
 * Verifies that <title> and <meta name="description"> in dist/website/*.html
 * match the corresponding legacy *.html files at the repo root.
 * Exits with code 1 if mismatches are found.
 */
import { readFileSync, existsSync, readdirSync } from 'fs';
import { resolve, dirname, basename } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');
const distDir = resolve(rootDir, 'dist');

if (!existsSync(distDir)) {
  console.error('dist/ not found — run npm run build first');
  process.exit(1);
}

function extractTitle(html) {
  const m = html.match(/<title>([^<]*)<\/title>/i);
  return m ? m[1].replace(/&amp;/g, '&').trim() : null;
}

function extractDescription(html) {
  const m = html.match(/<meta\s+name="description"\s+content="([^"]*)"/i)
    ?? html.match(/<meta\s+content="([^"]*)"\s+name="description"/i);
  return m ? m[1].replace(/&amp;/g, '&').trim() : null;
}

const SKIP = new Set(['komponenten-vorschau.html']);

const distFiles = readdirSync(distDir)
  .filter(f => f.endsWith('.html') && !SKIP.has(f));

let mismatches = 0;
const errors = [];

for (const file of distFiles.sort()) {
  const legacyPath = resolve(rootDir, file);
  if (!existsSync(legacyPath)) {
    console.warn(`  SKIP: no legacy file for ${file}`);
    continue;
  }

  const distHtml = readFileSync(resolve(distDir, file), 'utf8');
  const legacyHtml = readFileSync(legacyPath, 'utf8');

  const distTitle = extractTitle(distHtml);
  const legacyTitle = extractTitle(legacyHtml);
  const distDesc = extractDescription(distHtml);
  const legacyDesc = extractDescription(legacyHtml);

  if (distTitle !== legacyTitle) {
    errors.push(`  TITLE MISMATCH in ${file}:`);
    errors.push(`    legacy: ${legacyTitle}`);
    errors.push(`    dist:   ${distTitle}`);
    mismatches++;
  }
  if (distDesc !== legacyDesc) {
    errors.push(`  DESC MISMATCH in ${file}:`);
    errors.push(`    legacy: ${legacyDesc}`);
    errors.push(`    dist:   ${distDesc}`);
    mismatches++;
  }
}

if (mismatches > 0) {
  console.error(`\n❌ ${mismatches} meta mismatch(es):\n`);
  for (const e of errors) console.error(e);
  process.exit(1);
} else {
  console.log(`✅ All meta tags match legacy (${distFiles.length} pages checked)`);
  process.exit(0);
}
