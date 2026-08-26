#!/usr/bin/env node
/**
 * tools/font-metrics.mjs — misst Fallback-Metriken pro Schriftschnitt.
 *
 * Der verbleibende CLS entstand beim Font-Swap. Ein einzelner Fallback je
 * Familie reicht dafür nicht: Space Grotesk 400 ist rund 10 % schmaler als
 * Arial, Space Grotesk 700 dagegen 0,5 % breiter. Ein gemeinsames
 * size-adjust kann nur einen der beiden Schnitte treffen — der andere
 * springt weiter. Deshalb wird je genutztem Gewicht eine eigene
 * Fallback-Face erzeugt.
 *
 * Gemessen wird auf der laufenden Preview-Seite, weil dort dieselben
 * @font-face-Regeln gelten wie in Produktion.
 *
 * Voraussetzung: `npm run preview` läuft.
 *   node tools/font-metrics.mjs            # nur messen
 *   node tools/font-metrics.mjs --write    # global.css aktualisieren
 */
import { chromium } from 'playwright';
import { readFileSync, writeFileSync } from 'fs';

const ORIGIN = process.env.LH_ORIGIN ?? 'http://localhost:4321';
const BASE   = process.env.LH_BASE ?? '/';
const CSS    = 'src/styles/global.css';

/** Seiten, aus denen der Messkorpus stammt — quer über die Textsorten. */
const CORPUS_PAGES = ['', 'seo-geo.html', 'bfsg-wordpress-website-agentur.html', 'ueber-uns.html'];

/** Notnagel, falls für einen Schnitt kein echter Text gefunden wird. */
const FALLBACK_PROBE =
  'Barrierefreie Websites aus Köln, die bei Google und in KI-Antworten gefunden werden.';

/** Nur die Schnitte, die die Seite tatsächlich verwendet. */
const TARGETS = [
  { name: 'Manrope',       fallback: 'Arial',       weights: [400, 500, 600, 700] },
  { name: 'Space Grotesk', fallback: 'Arial',       weights: [400, 500, 700] },
];

const browser = await chromium.launch();
const page = await browser.newPage();

/**
 * Messkorpus: der tatsächliche Text der Seite, gruppiert nach
 * Familie+Gewicht. Ein synthetischer Prüfstring führt in die Irre —
 * Ziffern und Geviertstriche laufen in Manrope und Space Grotesk deutlich
 * breiter als in Arial und verzerren das Verhältnis um mehrere Prozent.
 */
const corpus = new Map();
for (const slug of CORPUS_PAGES) {
  await page.goto(`${ORIGIN}${BASE}${slug}`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  const found = await page.evaluate(() => {
    const out = {};
    document.querySelectorAll('main *').forEach((el) => {
      const text = [...el.childNodes]
        .filter((n) => n.nodeType === 3).map((n) => n.textContent.trim())
        .join(' ').replace(/\s+/g, ' ').trim();
      if (text.length < 12) return;
      const cs = getComputedStyle(el);
      const family = cs.fontFamily.split(',')[0].replace(/["']/g, '').trim();
      const key = `${family}|${cs.fontWeight}`;
      (out[key] ??= []).push(text);
    });
    return out;
  });
  for (const [key, texts] of Object.entries(found)) {
    const acc = corpus.get(key) ?? [];
    corpus.set(key, acc.concat(texts));
  }
}
console.log('Messkorpus:');
for (const [k, v] of [...corpus].sort()) {
  console.log(`  ${k.padEnd(26)} ${v.length} Textstellen, ${v.join(' ').length} Zeichen`);
}
console.log('');

await page.goto(`${ORIGIN}${BASE}`, { waitUntil: 'networkidle' });

// document.fonts.load() allein genügt nicht: Canvas misst weiter den
// Ersatz, solange ein Schnitt nirgends im Dokument gerendert wurde — und
// liefert dann eine Skalierung in die falsche Richtung. Deshalb jeden
// Schnitt kurz sichtbar ins DOM legen und erst danach messen.
await page.evaluate(async ({ targets, probe }) => {
  const host = document.createElement('div');
  host.style.cssText = 'position:absolute;left:-9999px;top:0;visibility:hidden';
  for (const t of targets) {
    for (const w of t.weights) {
      const el = document.createElement('span');
      el.style.cssText = `font-family:"${t.name}";font-weight:${w};font-size:100px`;
      el.textContent = probe;
      host.appendChild(el);
    }
  }
  document.body.appendChild(host);
  await Promise.all(targets.flatMap((t) =>
    t.weights.map((w) => document.fonts.load(`${w} 100px "${t.name}"`, probe))));
  await document.fonts.ready;
}, { targets: TARGETS, probe: FALLBACK_PROBE });

const corpusObj = Object.fromEntries([...corpus].map(([k, v]) => [k, v.join(' ')]));

const measured = await page.evaluate(({ targets, corpusObj, fallbackProbe }) => {
  const cv = document.createElement('canvas').getContext('2d');
  const textFor = (name, weight) =>
    corpusObj[`${name}|${weight}`] ?? fallbackProbe;
  const m = (family, weight, text) => {
    cv.font = `${weight} 100px "${family}"`;
    const t = cv.measureText(text);
    return { w: t.width, a: t.fontBoundingBoxAscent, d: t.fontBoundingBoxDescent };
  };
  // Kontrollmessung mit einer garantiert unbekannten Familie: stimmt ein
  // Webfont damit überein, wurde er nicht aufgelöst und die Messung wäre
  // wertlos.
  return targets.flatMap((t) => t.weights.map((weight) => {
    const text = textFor(t.name, weight);
    return {
      name: t.name, fallback: t.fallback, weight,
      chars: text.length,
      web: m(t.name, weight, text),
      fb:  m(t.fallback, weight, text),
      control: m('__dk_missing_font__', weight, text),
    };
  }));
}, { targets: TARGETS, corpusObj, fallbackProbe: FALLBACK_PROBE });

const unresolved = measured.filter((r) => Math.abs(r.web.w - r.control.w) < 0.5);
if (unresolved.length) {
  console.error('Nicht aufgelöste Schnitte — Messung abgebrochen:');
  for (const r of unresolved) console.error(`  ${r.name} ${r.weight}`);
  process.exit(1);
}

await browser.close();

const rows = measured.map((r) => {
  const sizeAdjust = r.web.w / r.fb.w;
  return {
    ...r,
    sizeAdjust: +(sizeAdjust * 100).toFixed(2),
    ascent:     +((r.web.a / 100 / sizeAdjust) * 100).toFixed(2),
    descent:    +((r.web.d / 100 / sizeAdjust) * 100).toFixed(2),
  };
});

for (const r of rows) {
  const off = ((1 / (r.sizeAdjust / 100) - 1) * 100).toFixed(1);
  console.log(`${(r.name + ' ' + r.weight).padEnd(20)} size-adjust ${String(r.sizeAdjust).padStart(6)}%  ` +
              `ascent ${String(r.ascent).padStart(6)}%  descent ${String(r.descent).padStart(5)}%  ` +
              `(Fallback lief ${off > 0 ? '+' : ''}${off}% daneben, ${r.chars} Zeichen gemessen)`);
}

const block = `/* ============================================================
   Metric-Fallback-Fonts — halten das Layout beim Font-Swap stabil.
   Erzeugt von \`node tools/font-metrics.mjs --write\`, nicht von Hand
   ändern. Je Schriftschnitt eine eigene Face: ein gemeinsames
   size-adjust pro Familie trifft nur ein Gewicht, die übrigen springen.
   ============================================================ */
${rows.map((r) => `@font-face {
  font-family: '${r.name} Fallback';
  src: local('${r.fallback}');
  font-weight: ${r.weight};
  ascent-override:   ${r.ascent}%;
  descent-override:  ${r.descent}%;
  line-gap-override: 0%;
  size-adjust:       ${r.sizeAdjust}%;
}`).join('\n')}`;

if (process.argv.includes('--write')) {
  const css = readFileSync(CSS, 'utf8');
  const start = css.indexOf('/* ============================================================\n   Metric-Fallback-Fonts');
  const after = css.indexOf('/* ============================================================', start + 10);
  if (start < 0 || after < 0) { console.error('Fallback-Block in global.css nicht gefunden'); process.exit(1); }
  writeFileSync(CSS, css.slice(0, start) + block + '\n\n' + css.slice(after));
  console.log(`\n→ ${CSS} aktualisiert (${rows.length} Faces).`);
}
