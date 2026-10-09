#!/usr/bin/env node
/**
 * Prüft, dass jedes interne href/src im gebauten dist/ auflöst.
 * Exit-Code 1 bei kaputten Links.
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'fs';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = resolve(__dirname, '../dist');

if (!existsSync(distDir)) {
  console.error('dist/ not found — run npm run build first');
  process.exit(1);
}

function walkDir(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walkDir(full, files);
    else files.push(full);
  }
  return files;
}

const allFiles = new Set(walkDir(distDir));

function extractLinks(html) {
  const links = [];
  const patterns = [
    /href="([^"#?]+)"/g,
    /src="([^"?]+)"/g,
    /action="([^"?]+)"/g,
  ];
  for (const re of patterns) {
    let m;
    re.lastIndex = 0;
    while ((m = re.exec(html)) !== null) {
      links.push(m[1]);
    }
  }
  return links;
}

function resolveLink(link, htmlFilePath) {
  if (/^(https?:|mailto:|tel:|#|data:|javascript:)/i.test(link)) return null;

  if (link.startsWith('/')) {
    const stripped = link.replace(/^\/website(?=\/|$)/, '') || '/';
    return join(distDir, stripped);
  }
  return resolve(dirname(htmlFilePath), link);
}

const SKIP_FILES = new Set(['komponenten-vorschau.html']);
const htmlFiles = walkDir(distDir).filter(f => f.endsWith('.html') && !SKIP_FILES.has(f.split('/').pop()));
let broken = 0;
const errors = [];

for (const htmlFile of htmlFiles) {
  const html = readFileSync(htmlFile, 'utf8');
  const links = extractLinks(html);
  const relHtml = htmlFile.replace(distDir, '');

  for (const link of links) {
    const resolved = resolveLink(link, htmlFile);
    if (!resolved) continue;

    const candidates = [
      resolved,
      resolved + '/index.html',
      resolved.replace(/\/$/, '') + '/index.html',
    ];

    const exists = candidates.some(c => allFiles.has(c) || existsSync(c));
    if (!exists) {
      errors.push(`  BROKEN: ${relHtml} → ${link} (resolved: ${resolved.replace(distDir, '')})`);
      broken++;
    }
  }
}

if (broken > 0) {
  console.error(`\n❌ ${broken} broken internal link(s):\n`);
  for (const e of errors) console.error(e);
  process.exit(1);
} else {
  console.log(`✅ All internal links OK (${htmlFiles.length} HTML files checked)`);
  process.exit(0);
}
