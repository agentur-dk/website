#!/usr/bin/env node
/**
 * tools/check-seo.mjs — SEO-Regressionsprüfung auf dem gebauten dist/.
 *
 * Ersetzt das frühere check-meta.mjs, das Titel und Beschreibungen nur
 * gegen einen eingefrorenen Snapshot der Altsite verglich. Der Snapshot
 * konservierte damit auch dessen Fehler — unter anderem acht Titel über
 * der SERP-Grenze. Hier wird stattdessen gegen Regeln geprüft.
 *
 * Geprüft wird je Seite:
 *   · Title vorhanden, eindeutig, ≤ 60 Zeichen
 *   · Description vorhanden, eindeutig, 70–155 Zeichen
 *   · genau ein <h1>, nicht leer
 *   · Canonical absolut und auf die eigene URL zeigend
 *   · og:title/description/url/image vollständig
 *   · JSON-LD parsebar, mit @graph, ohne unaufgelöste @id-Referenzen
 *   · keine doppelten Überschriftentexte derselben Ebene
 *
 * Exit-Code 1 bei jedem Verstoß.
 */
import { readFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';

const DIST = 'dist';
const MAX_TITLE = 60;
const DESC_MIN = 70, DESC_MAX = 155;
/** Seiten, die bewusst nicht indexiert werden. */
const NOINDEX = new Set(['404.html']);

if (!existsSync(DIST)) {
  console.error('dist/ fehlt — zuerst `npm run build` ausführen.');
  process.exit(1);
}

const unescape = (s) => s
  .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ');

const text = (html) => unescape(html.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();

const problems = [];
const fail = (page, msg) => problems.push(`${page}: ${msg}`);

const files = readdirSync(DIST).filter((f) => f.endsWith('.html'));
const titles = new Map(), descs = new Map();

for (const file of files) {
  const html = readFileSync(join(DIST, file), 'utf8');
  const noindex = NOINDEX.has(file);

  // ---- Title ----
  const title = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1];
  if (!title) fail(file, 'kein <title>');
  else {
    const t = unescape(title).trim();
    if (t.length > MAX_TITLE) fail(file, `Title ${t.length} Zeichen (max ${MAX_TITLE}): "${t}"`);
    if (titles.has(t)) fail(file, `Title identisch mit ${titles.get(t)}`);
    titles.set(t, file);
  }

  // ---- Description ----
  const desc = html.match(/<meta name="description" content="([^"]*)"/i)?.[1];
  if (!desc) fail(file, 'keine meta description');
  else {
    const d = unescape(desc).trim();
    if (d.length > DESC_MAX) fail(file, `Description ${d.length} Zeichen (max ${DESC_MAX})`);
    if (d.length < DESC_MIN) fail(file, `Description nur ${d.length} Zeichen (min ${DESC_MIN})`);
    if (descs.has(d)) fail(file, `Description identisch mit ${descs.get(d)}`);
    descs.set(d, file);
  }

  // ---- H1 ----
  const h1s = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)].map((m) => text(m[1]));
  if (h1s.length !== 1) fail(file, `${h1s.length} <h1> (genau 1 erwartet)`);
  if (h1s[0] !== undefined && h1s[0].length < 3) fail(file, 'leeres <h1>');

  // ---- Doppelte Überschriften gleicher Ebene ----
  for (const level of ['h2', 'h3']) {
    const seen = new Map();
    for (const m of html.matchAll(new RegExp(`<${level}[^>]*>([\\s\\S]*?)</${level}>`, 'gi'))) {
      const t = text(m[1]);
      if (!t) continue;
      if (seen.has(t)) fail(file, `<${level}> "${t}" kommt mehrfach vor`);
      seen.set(t, true);
    }
  }

  // ---- Canonical ----
  const canonical = html.match(/<link rel="canonical" href="([^"]*)"/i)?.[1];
  if (!canonical) fail(file, 'kein Canonical');
  else {
    if (!canonical.startsWith('https://')) fail(file, `Canonical nicht absolut: ${canonical}`);
    const expected = file === 'index.html' ? '/' : `/${file}`;
    if (!canonical.endsWith(expected)) fail(file, `Canonical zeigt auf ${canonical}, erwartet …${expected}`);
  }

  // ---- Open Graph ----
  for (const prop of ['og:title', 'og:description', 'og:url', 'og:image', 'og:site_name']) {
    if (!html.includes(`property="${prop}"`)) fail(file, `${prop} fehlt`);
  }

  // ---- robots ----
  const robots = html.match(/<meta name="robots" content="([^"]*)"/i)?.[1] ?? '';
  if (noindex && !robots.includes('noindex')) fail(file, 'sollte noindex sein, ist es aber nicht');
  if (!noindex && robots.includes('noindex')) fail(file, 'ist versehentlich auf noindex gesetzt');

  // ---- JSON-LD ----
  const ld = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/i)?.[1];
  if (!ld) fail(file, 'kein JSON-LD');
  else {
    let data;
    try { data = JSON.parse(ld); }
    catch (e) { fail(file, `JSON-LD nicht parsebar: ${e.message}`); }
    if (data) {
      if (!Array.isArray(data['@graph'])) fail(file, 'JSON-LD ohne @graph');
      else {
        const ids = new Set(data['@graph'].map((n) => n['@id']).filter(Boolean));
        const refs = [];
        const walk = (v) => {
          if (Array.isArray(v)) return v.forEach(walk);
          if (v && typeof v === 'object') {
            const keys = Object.keys(v);
            if (keys.length === 1 && keys[0] === '@id') refs.push(v['@id']);
            else Object.values(v).forEach(walk);
          }
        };
        walk(data['@graph']);
        for (const ref of refs) if (!ids.has(ref)) fail(file, `JSON-LD: @id ${ref} nicht im Graphen`);
      }
    }
  }
}

// ---- Sitemap deckt alle indexierbaren Seiten ab ----
const sitemap = existsSync(join(DIST, 'sitemap.xml')) ? readFileSync(join(DIST, 'sitemap.xml'), 'utf8') : '';
if (!sitemap) problems.push('sitemap.xml fehlt');
else {
  for (const file of files) {
    if (NOINDEX.has(file)) {
      if (sitemap.includes(`/${file}`)) problems.push(`sitemap.xml enthält die noindex-Seite ${file}`);
      continue;
    }
    const loc = file === 'index.html' ? '</loc>' : `/${file}</loc>`;
    if (!sitemap.includes(loc)) problems.push(`sitemap.xml fehlt ${file}`);
  }
}

if (problems.length) {
  console.error(`SEO-Prüfung: ${problems.length} Verstöße\n`);
  for (const p of problems) console.error(`  ✗ ${p}`);
  process.exit(1);
}
console.log(`✓ SEO-Prüfung: ${files.length} Seiten ohne Beanstandung`);
