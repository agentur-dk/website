#!/usr/bin/env node
/**
 * tools/a11y.mjs — axe-core Accessibility-Gate (WCAG 2.2 A/AA)
 *
 * Erwartet einen laufenden `npm run preview`.
 * Prüft jede Seite in drei Zuständen: Ausgangszustand, mobiles Menü offen,
 * erstes Accordion offen — statische Scans übersehen sonst genau die
 * Komponenten, die per JS eingeblendet werden.
 *
 *   node tools/a11y.mjs [--pages=index,leistungen]
 */
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';

const ORIGIN = process.env.LH_ORIGIN ?? 'http://localhost:4321';
const BASE = process.env.LH_BASE ?? '/';
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22a', 'wcag22aa', 'best-practice'];

const ALL_PAGES = [
  'index', 'leistungen', 'bfsg-wordpress-website-agentur', 'wordpress-entwicklung',
  'website-leasing', 'seo-geo', 'online-marketing', 'social-recruiting',
  'corporate-design', 'ki-services', 'projekte', 'ueber-uns',
  'barrierefreiheit', 'impressum', 'datenschutz', '404',
];

const argPages = process.argv.find((a) => a.startsWith('--pages='));
const pages = argPages ? argPages.split('=')[1].split(',') : ALL_PAGES;

/**
 * Die Seite blendet Abschnitte beim Scrollen mit einer Opazitäts-Transition
 * ein. Misst axe mitten in dieser Transition, liest es Mischfarben statt der
 * tatsächlichen und meldet Kontrastwerte wie 1,02 — Text, der in Wahrheit bei
 * 7,4 : 1 liegt. Das ist nicht nur Fehlalarm: eine Prüfung, die zufällig
 * anschlägt, verdeckt irgendwann einen echten Befund.
 *
 * Deshalb vor jeder Messung: Bewegung abschalten, Einblendungen sofort in den
 * Endzustand versetzen, Transitionen auf null.
 */
const SETTLE = `
  *, *::before, *::after {
    transition-duration: 0s !important;
    animation-duration: 0s !important;
    animation-delay: 0s !important;
  }
`;

async function settle(page) {
  await page.addStyleTag({ content: SETTLE });
  await page.evaluate(() => {
    document.documentElement.dataset.motion = 'paused';
    document.querySelectorAll('[data-reveal]').forEach((el) => el.classList.add('is-visible'));
  });
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
}

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
const page = await ctx.newPage();

let total = 0;
const byRule = new Map();

for (const name of pages) {
  await page.goto(`${ORIGIN}${BASE}${name}.html`, { waitUntil: 'networkidle' });

  const states = [
    ['default', async () => {}],
    ['nav-open', async () => {
      const t = page.locator('.nav__toggle, [aria-controls][aria-expanded]').first();
      if (await t.count()) await t.click({ timeout: 1500 }).catch(() => {});
    }],
    ['accordion-open', async () => {
      const t = page.locator('.accordion__trigger, .faq__trigger').first();
      if (await t.count()) await t.click({ timeout: 1500 }).catch(() => {});
    }],
  ];

  for (const [state, setup] of states) {
    if (state !== 'default') await page.reload({ waitUntil: 'networkidle' });
    await settle(page);
    await setup();
    await settle(page);
    const { violations } = await new AxeBuilder({ page }).withTags(TAGS).analyze();
    for (const v of violations) {
      total += v.nodes.length;
      const key = `${v.id} [${v.impact}]`;
      if (!byRule.has(key)) byRule.set(key, { help: v.help, hits: [] });
      byRule.get(key).hits.push(
        ...v.nodes.map((n) => `${name}/${state}: ${n.target.join(' ')} — ${n.failureSummary?.split('\n')[1]?.trim() ?? ''}`),
      );
    }
  }
}

await browser.close();

if (!byRule.size) {
  console.log(`✓ axe-core: 0 Verstöße auf ${pages.length} Seiten (${TAGS.join(', ')})`);
  process.exit(0);
}

for (const [rule, { help, hits }] of [...byRule].sort((a, b) => b[1].hits.length - a[1].hits.length)) {
  console.log(`\n${rule} — ${help}  (${hits.length}x)`);
  for (const h of hits.slice(0, 8)) console.log(`   ${h}`);
  if (hits.length > 8) console.log(`   … +${hits.length - 8} weitere`);
}
console.log(`\n${total} Verstöße gesamt auf ${pages.length} Seiten.`);
process.exit(1);
