#!/usr/bin/env node
/**
 * SEO-Regeln, geprüft auf dem gebauten dist/ — gegen Regeln statt gegen einen
 * Schnappschuss, der auch dessen Fehler festschreiben würde. Je Seite:
 *   · Title vorhanden, eindeutig, ≤ 60 Zeichen
 *   · Description vorhanden, eindeutig, 70–155 Zeichen
 *   · genau ein <h1>, nicht leer
 *   · Canonical absolut und auf die eigene URL zeigend
 *   · Open Graph vollständig, eigene Adressen zeigen auf Dateien im Build
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
/** Seiten, die auch nach der Veröffentlichung nicht indexiert werden. */
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

/**
 * Am Build abgelesen statt aus der Konfiguration, weil geprüft wird, was
 * ausgeliefert wird. Während der Sperre kehrt sich die Prüfrichtung um:
 * Dann ist eine Seite ohne `noindex` der Fehler.
 */
const staging = /name="robots" content="noindex/.test(readFileSync(join(DIST, 'index.html'), 'utf8'));

/** Die gebaute Startadresse samt Basispfad, abgelesen am Canonical — nicht aus der Konfiguration, weil geprüft wird, was ausgeliefert wird. */
const HEIM = readFileSync(join(DIST, 'index.html'), 'utf8')
  .match(/<link rel="canonical" href="([^"]*)"/i)?.[1] ?? '';

/** Liefert den Grund, wenn eine eigene absolute Adresse auf nichts im Build zeigt — sonst null. Gesetzt heißt nicht erreichbar. */
function zeigtInsLeere(url) {
  if (!HEIM || !url.startsWith('http')) return null;
  const heimHost = new URL(HEIM).origin;
  if (!url.startsWith(heimHost)) return null;
  if (!url.startsWith(HEIM)) return `liegt außerhalb der Website (${HEIM})`;
  let rest = decodeURIComponent(url.slice(HEIM.length).split('#')[0].split('?')[0]);
  if (rest === '' || rest.endsWith('/')) rest += 'index.html';
  return existsSync(join(DIST, rest)) ? null : `Datei fehlt im Build (${rest})`;
}
if (staging) {
  console.log('Indexierungssperre ist aktiv — es wird geprüft, dass sie lückenlos greift.\n');
}

for (const file of files) {
  const html = readFileSync(join(DIST, file), 'utf8');
  const noindex = staging || NOINDEX.has(file);

  const title = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1];
  if (!title) fail(file, 'kein <title>');
  else {
    const t = unescape(title).trim();
    if (t.length > MAX_TITLE) fail(file, `Title ${t.length} Zeichen (max ${MAX_TITLE}): "${t}"`);
    if (titles.has(t)) fail(file, `Title identisch mit ${titles.get(t)}`);
    titles.set(t, file);
  }

  const desc = html.match(/<meta name="description" content="([^"]*)"/i)?.[1];
  if (!desc) fail(file, 'keine meta description');
  else {
    const d = unescape(desc).trim();
    if (d.length > DESC_MAX) fail(file, `Description ${d.length} Zeichen (max ${DESC_MAX})`);
    if (d.length < DESC_MIN) fail(file, `Description nur ${d.length} Zeichen (min ${DESC_MIN})`);
    if (descs.has(d)) fail(file, `Description identisch mit ${descs.get(d)}`);
    descs.set(d, file);
  }

  const h1s = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)].map((m) => text(m[1]));
  if (h1s.length !== 1) fail(file, `${h1s.length} <h1> (genau 1 erwartet)`);
  if (h1s[0] !== undefined && h1s[0].length < 3) fail(file, 'leeres <h1>');

  for (const level of ['h2', 'h3']) {
    const seen = new Map();
    for (const m of html.matchAll(new RegExp(`<${level}[^>]*>([\\s\\S]*?)</${level}>`, 'gi'))) {
      const t = text(m[1]);
      if (!t) continue;
      if (seen.has(t)) fail(file, `<${level}> "${t}" kommt mehrfach vor`);
      seen.set(t, true);
    }
  }

  const canonical = html.match(/<link rel="canonical" href="([^"]*)"/i)?.[1];
  if (!canonical) fail(file, 'kein Canonical');
  else {
    if (!canonical.startsWith('https://')) fail(file, `Canonical nicht absolut: ${canonical}`);
    const expected = file === 'index.html' ? '/' : `/${file}`;
    if (!canonical.endsWith(expected)) fail(file, `Canonical zeigt auf ${canonical}, erwartet …${expected}`);
  }

  for (const prop of ['og:title', 'og:description', 'og:url', 'og:image', 'og:site_name']) {
    if (!html.includes(`property="${prop}"`)) fail(file, `${prop} fehlt`);
  }
  for (const m of html.matchAll(/<meta (?:property|name)="(og:image|twitter:image|og:url)" content="([^"]*)"/gi)) {
    const grund = zeigtInsLeere(unescape(m[2]));
    if (grund) fail(file, `${m[1]} ${m[2]} — ${grund}`);
  }

  const robots = html.match(/<meta name="robots" content="([^"]*)"/i)?.[1] ?? '';
  if (noindex && !robots.includes('noindex')) fail(file, 'sollte noindex sein, ist es aber nicht');
  if (!noindex && robots.includes('noindex')) fail(file, 'ist versehentlich auf noindex gesetzt');
  if (staging && !robots.includes('nofollow')) fail(file, 'noindex ohne nofollow während der Sperre');

  const ld = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/i)?.[1];
  if (!ld) fail(file, 'kein JSON-LD');
  else {
    let data;
    try { data = JSON.parse(ld); }
    catch (e) { fail(file, `JSON-LD nicht parsebar: ${e.message}`); }
    if (data) {
      for (const m of ld.matchAll(/"(url|item|image|contentUrl)":\s*"([^"]+)"/g)) {
        const grund = zeigtInsLeere(m[2]);
        if (grund) fail(file, `JSON-LD ${m[1]} ${m[2]} — ${grund}`);
      }
      for (const m of ld.matchAll(/"@id":\s*"([^"#]+)#/g)) {
        if (m[1].startsWith(new URL(HEIM || 'https://x').origin) && !m[1].startsWith(HEIM)) {
          fail(file, `JSON-LD @id ${m[1]} liegt außerhalb der Website (${HEIM})`);
        }
      }
    }
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

const sitemap = existsSync(join(DIST, 'sitemap.xml')) ? readFileSync(join(DIST, 'sitemap.xml'), 'utf8') : '';
const robotsTxt = existsSync(join(DIST, 'robots.txt')) ? readFileSync(join(DIST, 'robots.txt'), 'utf8') : '';
const llmsTxt = existsSync(join(DIST, 'llms.txt')) ? readFileSync(join(DIST, 'llms.txt'), 'utf8') : '';

/*
 * Der Marker `[KI]` steuert die Kennzeichnung KI-erzeugter Bilder und wird
 * beim Rendern abgetrennt. Steht er im HTML, ist ein Bild an der nach
 * Art. 50 KI-Verordnung nötigen Kennzeichnung vorbeigelaufen.
 */
for (const seite of readdirSync(DIST, { recursive: true })) {
  if (typeof seite !== 'string' || !seite.endsWith('.html')) continue;
  if (readFileSync(join(DIST, seite), 'utf8').includes('[KI]')) {
    problems.push(`${seite}: der Marker [KI] steht im HTML — das Bild lief an der Kennzeichnung vorbei`);
  }
}

if (!sitemap) problems.push('sitemap.xml fehlt');
else if (staging) {
  // Während der Sperre müssen alle vier Kanäle dichthalten, nicht nur das
  // Meta-Tag. Jede einzelne Lücke reicht, damit Inhalte doch auftauchen.
  if (/<loc>/.test(sitemap)) problems.push('sitemap.xml listet URLs, obwohl die Sperre aktiv ist');
  if (/^\s*Sitemap:/m.test(robotsTxt)) problems.push('robots.txt verweist auf die Sitemap, obwohl die Sperre aktiv ist');
  for (const ua of ['GPTBot', 'ClaudeBot', 'PerplexityBot', 'Google-Extended', 'CCBot']) {
    const block = robotsTxt.split(/\n\s*\n/).find((b) => b.includes(`User-agent: ${ua}`));
    if (!block) problems.push(`robots.txt nennt ${ua} nicht`);
    else if (!/Disallow: \//.test(block)) problems.push(`robots.txt sperrt ${ua} nicht aus`);
  }
  if (!/nicht veröffentlicht/i.test(llmsTxt)) problems.push('llms.txt liefert weiterhin Inhalte aus');
  if (/## Leistungen/.test(llmsTxt)) problems.push('llms.txt enthält die vollständige Faktensammlung');
} else {
  for (const file of files) {
    if (NOINDEX.has(file)) {
      if (sitemap.includes(`/${file}`)) problems.push(`sitemap.xml enthält die noindex-Seite ${file}`);
      continue;
    }
    const loc = file === 'index.html' ? '</loc>' : `/${file}</loc>`;
    if (!sitemap.includes(loc)) problems.push(`sitemap.xml fehlt ${file}`);
  }
}

// Pflichtliste vor dem Livegang (CLAUDE.md): was jede Seite rechtlich und
// technisch tragen muss und sich am ausgelieferten HTML prüfen lässt.
for (const pflicht of ['impressum.html', 'datenschutz.html', '404.html']) {
  if (!files.includes(pflicht)) problems.push(`${pflicht} fehlt`);
}
for (const file of files) {
  const html = readFileSync(join(DIST, file), 'utf8');

  // Impressum und Datenschutz müssen von jeder Seite aus erreichbar sein (§ 5 DDG).
  for (const ziel of ['impressum.html', 'datenschutz.html']) {
    if (file !== ziel && !new RegExp(`href="[^"]*${ziel}"`).test(html)) fail(file, `kein Verweis auf ${ziel}`);
  }

  // Ein Formular, das etwas verschickt, nennt die Datenschutzerklärung (Art. 13 DSGVO).
  for (const [form] of html.matchAll(/<form\b[^>]*method="post"[\s\S]*?<\/form>/gi)) {
    if (!/href="[^"]*datenschutz\.html"/.test(form)) {
      const id = form.match(/\bid="([^"]+)"/)?.[1] ?? 'ohne id';
      fail(file, `Formular #${id} verschickt Daten, verweist aber nicht auf die Datenschutzerklärung`);
    }
  }

  // Ein Aufruf an Googles Schriftserver überträgt die IP-Adresse vor jeder Einwilligung.
  if (/fonts\.(googleapis|gstatic)\.com/.test(html)) fail(file, 'lädt Schriften von Google statt vom eigenen Server');

  const icon = html.match(/<link rel="icon"[^>]*href="([^"]+)"/)?.[1];
  if (!icon) fail(file, 'kein Favicon');
  else {
    const basis = HEIM ? new URL(HEIM).pathname : '/';
    const pfad = icon.startsWith(basis) ? icon.slice(basis.length) : icon.replace(/^\/+/, '');
    if (!existsSync(join(DIST, pfad))) fail(file, `Favicon ${icon} fehlt im Build`);
  }
}

if (problems.length) {
  console.error(`SEO-Prüfung: ${problems.length} Verstöße\n`);
  for (const p of problems) console.error(`  ✗ ${p}`);
  process.exit(1);
}
console.log(`✓ SEO-Prüfung: ${files.length} Seiten ohne Beanstandung` +
            (staging ? ' — Indexierungssperre greift auf allen vier Kanälen' : ''));
