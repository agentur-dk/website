#!/usr/bin/env node
/**
 * Findet Klassen im HTML, für die es keine CSS-Regel gibt — meist Tippfehler
 * oder Reste eines Umbaus, die ein Element still anders aussehen lassen.
 * Externe Dateien und <style>-Blöcke werden gemeinsam ausgewertet, weil das
 * CSS inline ausgeliefert wird.
 */
import { readFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';

const DIST = 'dist';

/** Klassen, die erst JavaScript setzt und die deshalb nie im HTML stehen. */
const RUNTIME_ONLY = new Set([
  'is-open',                 // mobiles Menü
  'is-visible',              // Scroll-Reveal
  'lf-status--success',      // Formular-Rückmeldung
  'lf-status--error',
  'lf-steps__item--active',
  'bfsg-step--hidden',
  'bfsg-result--hidden',
]);

/**
 * Klassen ohne eigene Regel, die es bewusst gibt: JavaScript-Anker oder
 * Strukturhaken, deren Aussehen von Eltern- oder Kindregeln kommt. Jeder
 * Eintrag braucht eine Begründung, sonst wächst die Liste unbemerkt.
 */
const NO_STYLE_BY_DESIGN = new Map([
  ['bfsg-back-btn',      'JS-Anker: Zurück-Navigation im BFSG-Check'],
  ['lf-step',            'JS-Anker: Schrittwechsel im Lead-Formular'],
  ['bfsg-quiz',          'Strukturhaken neben #bfsg-quiz'],
  ['lf-form',            'Strukturhaken neben #lf-form'],
  ['bfsg-check-section', 'Abschnittshaken, Optik kommt von .section'],
  ['bfsg-step__options', 'Layout kommt von .bfsg-yn-grid auf demselben Element'],
  ['ueber-grid__text',   'Layout kommt von .ueber-grid'],
  ['cta-section__text',   'Rasterzelle, Optik kommt von .cta-section__grid'],
  ['cta-section__direct', 'Gruppiert die drei Telefonzeilen, Optik kommt von deren Regeln'],
  // Fremdklasse, nach der der Podigee-Player selbst sucht; seine Optik bringt
  // er mit. Eine eigene Regel wäre eine Behauptung über fremden Code.
  ['podigee-podcast-player', 'Haken des Podigee-Players (Fremdcode), Optik kommt vom Player selbst'],
]);

/** Tailwind-Varianten, die vor dem Vergleich abgetrennt werden. */
const VARIANTS = new Set([
  'hover', 'focus', 'focus-visible', 'focus-within', 'active', 'disabled',
  'sm', 'md', 'lg', 'xl', '2xl', 'dark', 'group-hover', 'peer-hover',
  'aria-expanded', 'data-state', 'before', 'after', 'placeholder',
  'first', 'last', 'odd', 'even', 'not', 'motion-safe', 'motion-reduce',
]);

if (!existsSync(DIST)) {
  console.error('dist/ fehlt — zuerst `npm run build` ausführen.');
  process.exit(1);
}

const htmlFiles = readdirSync(DIST).filter((f) => f.endsWith('.html'));

let css = '';
const astroDir = join(DIST, '_astro');
if (existsSync(astroDir)) {
  for (const f of readdirSync(astroDir).filter((f) => f.endsWith('.css'))) {
    css += readFileSync(join(astroDir, f), 'utf8');
  }
}
for (const f of htmlFiles) {
  const html = readFileSync(join(DIST, f), 'utf8');
  for (const m of html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)) css += m[1];
}

if (!css.trim()) {
  console.error('Kein CSS gefunden — weder in dist/_astro/ noch inline. Build defekt?');
  process.exit(1);
}

// Alle Klassenselektoren aus dem CSS. Escapes (\:, \/, \.) werden entfernt,
// damit Tailwind-Utilities wie `md\:flex` als `md:flex` vergleichbar sind.
const defined = new Set();
for (const m of css.matchAll(/\.((?:[\w-]|\\.)+)/g)) {
  defined.add(m[1].replace(/\\(.)/g, '$1'));
}

const stripVariants = (cls) => {
  const parts = cls.split(':');
  while (parts.length > 1 && VARIANTS.has(parts[0])) parts.shift();
  return parts.join(':');
};

const missing = new Map();
for (const f of htmlFiles) {
  const html = readFileSync(join(DIST, f), 'utf8');
  for (const m of html.matchAll(/class="([^"]*)"/g)) {
    for (const raw of m[1].split(/\s+/).filter(Boolean)) {
      if (raw.includes('[') || raw.includes(']')) continue;   // beliebige Werte
      if (RUNTIME_ONLY.has(raw) || NO_STYLE_BY_DESIGN.has(raw)) continue;
      const cls = stripVariants(raw);
      if (defined.has(cls) || defined.has(raw)) continue;
      if (!missing.has(raw)) missing.set(raw, new Set());
      missing.get(raw).add(f);
    }
  }
}

if (missing.size) {
  console.error(`CSS-Prüfung: ${missing.size} Klasse(n) ohne Regel\n`);
  for (const [cls, files] of [...missing].sort()) {
    console.error(`  ✗ .${cls}  →  ${[...files].join(', ')}`);
  }
  process.exit(1);
}
console.log(`✓ CSS-Prüfung: alle Klassen aus ${htmlFiles.length} Seiten haben eine Regel ` +
            `(${defined.size} Selektoren im CSS)`);
