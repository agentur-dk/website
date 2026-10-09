#!/usr/bin/env node
/**
 * Erzeugt public/fonts/ aus fonts-src/: verkleinert jeden Schnitt auf die
 * Zeichen im gebauten dist/ plus einen Grundvorrat. Die vollen Latin-Subsets
 * konkurrieren auf langsamen Verbindungen mit dem HTML und verzögern den
 * ersten Inhalt; der Grundvorrat ist die Reserve für künftige Texte, damit
 * ein neues Zeichen nicht im Fallback erscheint.
 *
 * public/fonts/ wird mitversioniert, damit CI ohne diesen Schritt baut.
 *
 *   npm run build && node tools/subset-fonts.mjs
 */
import subsetFont from 'subset-font';
import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync, statSync } from 'fs';
import { join } from 'path';

const SRC = 'fonts-src';
const OUT = 'public/fonts';
const DIST = 'dist';

/** Grundvorrat — unabhängig vom aktuellen Seiteninhalt immer enthalten. */
const BASELINE =
  // ASCII druckbar
  Array.from({ length: 95 }, (_, i) => String.fromCharCode(32 + i)).join('') +
  // Deutsch
  'ÄÖÜäöüß' +
  // Weitere Latin-1-Buchstaben, die in Namen und Zitaten vorkommen
  'ÀÁÂÃÅÆÇÈÉÊËÌÍÎÏÑÒÓÔÕØÙÚÛÝàáâãåæçèéêëìíîïñòóôõøùúûýÿŒœŠšŽžÐðÞþ' +
  // Typografie und Symbole
  '–—―‚„‘’“”…•·†‡‰′″‹›«»€£¥¢§¶©®™°±×÷≈≠≤≥←→↑↓✓✔✕✗№';

if (!existsSync(SRC)) {
  console.error(`${SRC}/ fehlt — dort liegen die Originalschriften.`);
  process.exit(1);
}
if (!existsSync(DIST)) {
  console.error('dist/ fehlt — zuerst `npm run build` ausführen.');
  process.exit(1);
}

const chars = new Set(BASELINE);
for (const f of readdirSync(DIST).filter((f) => /\.(html|txt|xml)$/.test(f))) {
  for (const ch of readFileSync(join(DIST, f), 'utf8')) chars.add(ch);
}
const text = [...chars].join('');

mkdirSync(OUT, { recursive: true });

let before = 0, after = 0;
for (const file of readdirSync(SRC).filter((f) => f.endsWith('.woff2'))) {
  const src = readFileSync(join(SRC, file));
  const out = await subsetFont(src, text, { targetFormat: 'woff2' });
  writeFileSync(join(OUT, file), out);
  before += src.length;
  after += out.length;
  console.log(`  ${file.padEnd(38)} ${(src.length / 1024).toFixed(1)} → ${(out.length / 1024).toFixed(1)} kB`);
}

console.log(`\nSchriften gesamt: ${(before / 1024).toFixed(0)} → ${(after / 1024).toFixed(0)} kB ` +
            `(−${(100 - (after / before) * 100).toFixed(0)} %), ${chars.size} Zeichen im Vorrat`);
