#!/usr/bin/env node
/**
 * tools/lighthouse.mjs — Lighthouse-Gate für Performance / A11y / Best Practices / SEO
 *
 * Startet keinen Server: erwartet einen laufenden `npm run preview`
 * (Default http://localhost:4321/).
 *
 * Aufruf:
 *   node tools/lighthouse.mjs                 # alle Seiten, mobile + desktop
 *   node tools/lighthouse.mjs --pages=index   # nur einzelne Seiten
 *   node tools/lighthouse.mjs --form=desktop  # nur ein Formfaktor
 *
 * Exit-Code 1, sobald eine Kategorie unter THRESHOLD liegt.
 */
import { launch } from 'chrome-launcher';
import lighthouse from 'lighthouse';
import { writeFileSync, mkdirSync } from 'fs';

const THRESHOLD = Number(process.env.LH_THRESHOLD ?? 100);
const ORIGIN = process.env.LH_ORIGIN ?? 'http://localhost:4321';
const BASE = process.env.LH_BASE ?? '/';

const ALL_PAGES = [
  'index', 'leistungen', 'bfsg-wordpress-website-agentur', 'wordpress-entwicklung',
  'website-leasing', 'seo-geo', 'online-marketing', 'social-recruiting',
  'corporate-design', 'ki-services', 'projekte', 'ueber-uns',
  'barrierefreiheit', 'impressum', 'datenschutz', '404',
];

/**
 * Kategorien, die auf einzelnen Seiten begründet nicht 100 erreichen können.
 * Die 404-Seite trägt bewusst `noindex` — Lighthouse wertet das als
 * `is-crawlable`-Fehler und zieht die SEO-Wertung auf 66. Das ist korrektes
 * Verhalten, kein Mangel, und darf das Gate nicht blockieren.
 */
const EXEMPT = { '404': ['seo'] };

const arg = (k, d) => {
  const hit = process.argv.find((a) => a.startsWith(`--${k}=`));
  return hit ? hit.split('=').slice(1).join('=') : d;
};

const pages = arg('pages', '').trim() ? arg('pages', '').split(',') : ALL_PAGES;
const forms = arg('form', 'mobile,desktop').split(',');
const CATEGORIES = ['performance', 'accessibility', 'best-practices', 'seo'];

const DESKTOP = {
  formFactor: 'desktop',
  screenEmulation: { mobile: false, width: 1350, height: 940, deviceScaleFactor: 1, disabled: false },
  throttling: { rttMs: 40, throughputKbps: 10 * 1024, cpuSlowdownMultiplier: 1,
                requestLatencyMs: 0, downloadThroughputKbps: 0, uploadThroughputKbps: 0 },
};

const chrome = await launch({ chromeFlags: ['--headless=new', '--no-sandbox', '--disable-gpu'] });
mkdirSync('.lighthouse', { recursive: true });

const rows = [];
let failed = 0;

for (const form of forms) {
  for (const page of pages) {
    const url = `${ORIGIN}${BASE}${page}.html`;
    const settings = form === 'desktop' ? DESKTOP : {};
    const res = await lighthouse(url, { port: chrome.port, output: 'json', logLevel: 'error' },
      { extends: 'lighthouse:default', settings: { onlyCategories: CATEGORIES, ...settings } });

    const scores = Object.fromEntries(
      CATEGORIES.map((c) => [c, Math.round((res.lhr.categories[c].score ?? 0) * 100)]),
    );
    rows.push({ page, form, ...scores });

    const exempt = EXEMPT[page] ?? [];
    const bad = CATEGORIES.filter((c) => scores[c] < THRESHOLD && !exempt.includes(c));
    if (bad.length) {
      failed++;
      // Nur die tatsächlich fehlgeschlagenen Audits ausgeben — das ist die Arbeitsliste.
      for (const cat of bad) {
        const audits = res.lhr.categories[cat].auditRefs
          .map((ref) => res.lhr.audits[ref.id])
          .filter((a) => a && a.score !== null && a.score < 0.9)
          .map((a) => `      · ${a.id}${a.displayValue ? ` (${a.displayValue})` : ''}`);
        if (audits.length) console.log(`  ${page} [${form}] ${cat}=${scores[cat]}\n${audits.join('\n')}`);
      }
    }
    writeFileSync(`.lighthouse/${page}.${form}.json`, JSON.stringify(res.lhr));
  }
}

await chrome.kill();

console.log('\npage                              form     perf  a11y  bp   seo');
console.log('-'.repeat(66));
for (const r of rows) {
  console.log(
    `${r.page.padEnd(33)} ${r.form.padEnd(8)} ${String(r.performance).padStart(4)} ` +
    `${String(r.accessibility).padStart(5)} ${String(r['best-practices']).padStart(4)} ${String(r.seo).padStart(4)}`,
  );
}
console.log(`\n${rows.length - failed}/${rows.length} Runs erreichen ${THRESHOLD} in allen Kategorien.`);
process.exit(failed ? 1 : 0);
