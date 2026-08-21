/**
 * check-css.mjs — CSS Class Regression Check
 *
 * Walks all dist/*.html files, extracts class tokens, reads all dist/_astro/*.css,
 * and reports classes that appear in HTML but not in built CSS.
 *
 * Skips:
 *  - Tailwind variant prefixes (hover:, focus:, md:, etc.)
 *  - Arbitrary values (classes containing [ or ])
 *  - Known JS-only dynamic classes added at runtime
 *
 * Exit code 1 if any missing classes are found.
 */

import { readFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const distDir = join(rootDir, 'dist');
const astroDir = join(distDir, '_astro');

// Tailwind variant prefixes to strip before checking
const VARIANT_PREFIXES = [
  'hover', 'focus', 'focus-visible', 'active', 'disabled',
  'sm', 'md', 'lg', 'xl', '2xl',
  'dark', 'group-hover', 'peer-hover',
  'aria-expanded', 'data-state', 'before', 'after', 'placeholder',
  'first', 'last', 'odd', 'even', 'not',
];

// Classes that are added dynamically by JavaScript at runtime (not in HTML source)
const RUNTIME_ONLY_CLASSES = new Set([
  'is-open',            // nav mobile menu toggle
  'lf-status--success', // form status success
  'lf-status--error',   // form status error
  'lf-steps__item--active', // already in HTML as static class on first item but also toggled
]);

// Classes that are legitimately defined only in scoped component <style> blocks
// (Astro scopes these so they won't appear in global CSS)
const SCOPED_COMPONENT_CLASSES = new Set([
  // Header (scoped)
  'site-header', 'site-header__inner', 'site-logo', 'site-logo__name', 'site-logo__tagline',
  'nav-toggle', 'nav-list', 'nav-link', 'nav-link--dropdown', 'nav-chevron',
  'nav-item--dropdown', 'nav-dropdown', 'nav-dropdown__link', 'nav-cta',
  // Footer (scoped)
  'site-footer', 'site-footer__inner', 'site-footer__grid', 'site-footer__bottom', 'site-footer__bottom-inner',
  'footer-logo', 'footer-logo__name', 'footer-logo__tagline', 'footer-desc', 'footer-address',
  'footer-heading', 'footer-nav-list', 'footer-link', 'footer-link--sm', 'footer-text',
  'footer-copyright', 'footer-legal-list',
  // ServiceCard (scoped)
  'service-card', 'service-card__number', 'service-card__icon', 'service-card__title',
  'service-card__text', 'service-card__link',
  // ReferenceCard (scoped)
  'ref-card', 'ref-card__header', 'ref-card__logo', 'ref-card__logo--blue', 'ref-card__logo--green',
  'ref-card__logo--purple', 'ref-card__logo--teal', 'ref-card__logo--default',
  'ref-card__meta', 'ref-card__client', 'ref-card__industry', 'ref-card__text',
  'ref-card__tags', 'ref-card__tag', 'ref-card__link',
  // LogoStrip (scoped)
  'logo-strip', 'logo-strip__label', 'logo-strip__track-wrapper', 'logo-strip__track',
  'logo-strip__item', 'logo-strip__img', 'logo-strip__placeholder',
  // StatsStrip (scoped)
  'stats-strip', 'stats-inner', 'stats-heading', 'stats-list', 'stats-item',
  'stats-number', 'stats-suffix', 'stats-label',
  // FaqAccordion (scoped)
  'faq-section', 'faq-inner', 'faq-heading', 'faq-list', 'faq-item', 'faq-term',
  'faq-btn', 'faq-btn__text', 'faq-btn__icon', 'faq-panel', 'faq-panel__inner',
  // CtaSection (scoped)
  'cta-section', 'cta-inner', 'cta-content', 'cta-title', 'cta-text', 'cta-actions', 'cta-btn',
  // TabNav (scoped)
  'tabnav', 'tabnav__list', 'tabnav__item', 'tabnav__link',
  // LeadForm (scoped — lf-* prefix)
  'lf-section', 'lf-inner', 'lf-heading', 'lf-honeypot', 'lf-steps', 'lf-steps__item',
  'lf-steps__num', 'lf-step', 'lf-step__title', 'lf-step__nav', 'lf-step__nav--end',
  'lf-fieldset', 'lf-legend', 'lf-optional', 'lf-topics', 'lf-topic', 'lf-topic__input',
  'lf-topic__box', 'lf-topic__label', 'lf-other', 'lf-row', 'lf-group', 'lf-label',
  'lf-control', 'lf-textarea', 'lf-error', 'lf-privacy', 'lf-privacy__link',
  'lf-btn', 'lf-btn--primary', 'lf-btn--ghost', 'lf-status', 'lf-form',
  // BfsgCheck (scoped — bfsg-* prefix)
  'bfsg-quiz', 'bfsg-step', 'bfsg-step--hidden', 'bfsg-step__legend', 'bfsg-step__question',
  'bfsg-step__options', 'bfsg-yn-grid', 'bfsg-step__nav', 'bfsg-option', 'bfsg-option__radio',
  'bfsg-option__label', 'bfsg-next-btn', 'bfsg-back-btn', 'bfsg-result', 'bfsg-result--hidden',
  'bfsg-result__title', 'bfsg-result__text', 'bfsg-result__actions',
  'bfsg-disclaimer', 'bfsg-footnotes', 'bfsg-footnotes__update', 'bfsg-check-section',
  // 404 page (scoped)
  'error-page', 'error-page__inner', 'error-page__code', 'error-page__title',
  'error-page__desc', 'error-page__actions', 'error-page__divider', 'error-page__links',
  // index.astro logo strip (inline is:global but self-contained)
  'logo-strip__track-wrap',
  // index.astro service-card featured (inline is:global)
  'service-card--featured',
]);

// ------------------------------------------------------------------

function extractClasses(html) {
  const classes = new Set();
  const re = /class="([^"]*)"/g;
  let m;
  while ((m = re.exec(html)) !== null) {
    m[1].split(/\s+/).filter(Boolean).forEach(cls => classes.add(cls));
  }
  return classes;
}

function normalizeClass(cls) {
  // Strip Tailwind variants
  for (const prefix of VARIANT_PREFIXES) {
    if (cls.startsWith(prefix + ':')) {
      cls = cls.slice(prefix.length + 1);
    }
  }
  return cls;
}

function shouldSkip(cls) {
  // Skip arbitrary values
  if (cls.includes('[') || cls.includes(']')) return true;
  // Skip classes containing colons (Tailwind utilities)
  if (cls.includes(':')) return true;
  // Skip pure Tailwind utility classes (patterns like p-4, mt-8, etc.)
  // These are legitimate utilities — we only care about BEM/semantic classes
  return false;
}

// ------------------------------------------------------------------

if (!existsSync(distDir)) {
  console.error('❌ dist/ directory not found. Run `npm run build` first.');
  process.exit(1);
}

// Load all CSS
let allCss = '';
if (existsSync(astroDir)) {
  const cssFiles = readdirSync(astroDir).filter(f => f.endsWith('.css'));
  for (const f of cssFiles) {
    allCss += readFileSync(join(astroDir, f), 'utf8') + '\n';
  }
}
// Also check root dist CSS files
const rootCssFiles = readdirSync(distDir).filter(f => f.endsWith('.css'));
for (const f of rootCssFiles) {
  allCss += readFileSync(join(distDir, f), 'utf8') + '\n';
}

if (!allCss) {
  console.warn('⚠️  No CSS files found in dist/. Skipping check.');
  process.exit(0);
}

// Load all HTML files
const htmlFiles = readdirSync(distDir).filter(f => f.endsWith('.html'));

let totalMissing = 0;
const report = [];

for (const htmlFile of htmlFiles.sort()) {
  const html = readFileSync(join(distDir, htmlFile), 'utf8');
  const classes = extractClasses(html);
  const missing = [];

  for (const cls of classes) {
    if (shouldSkip(cls)) continue;
    const normalized = normalizeClass(cls);
    if (shouldSkip(normalized)) continue;
    if (RUNTIME_ONLY_CLASSES.has(normalized)) continue;
    if (SCOPED_COMPONENT_CLASSES.has(normalized)) continue;

    // Check if class appears in built CSS
    // We look for the class as a selector: .classname or .classname{ or .classname.
    const pattern = '.' + normalized.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const inCss = allCss.includes('.' + normalized + '{') ||
                  allCss.includes('.' + normalized + ' ') ||
                  allCss.includes('.' + normalized + '.') ||
                  allCss.includes('.' + normalized + ':') ||
                  allCss.includes('.' + normalized + ',') ||
                  allCss.includes('.' + normalized + '\n') ||
                  allCss.includes('.' + normalized + '\r');

    if (!inCss) {
      missing.push(normalized);
    }
  }

  if (missing.length > 0) {
    report.push({ file: htmlFile, missing });
    totalMissing += missing.length;
  }
}

if (totalMissing === 0) {
  console.log(`✅ All CSS classes found in built CSS (${htmlFiles.length} HTML files checked)`);
  process.exit(0);
} else {
  console.log(`\n❌ Missing CSS classes found:\n`);
  for (const { file, missing } of report) {
    console.log(`  ${file}:`);
    for (const cls of missing) {
      console.log(`    - .${cls}`);
    }
  }
  console.log(`\nTotal: ${totalMissing} missing class(es) across ${report.length} file(s)`);
  console.log('\nTo fix: add these classes to src/styles/global.css @layer components or the relevant component <style> block.\n');
  process.exit(1);
}
