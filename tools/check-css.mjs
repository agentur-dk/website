#!/usr/bin/env node
/**
 * tools/check-css.mjs — findet Klassen im HTML, für die es keine CSS-Regel gibt.
 *
 * Solche Klassen sind fast immer Tippfehler oder Reste eines Refactorings:
 * das Element sieht dann anders aus als gedacht, ohne dass etwas kaputtgeht.
 *
 * Die frühere Fassung las nur dist/_astro/*.css und pflegte daneben eine
 * über hundert Zeilen lange Allowlist aller komponenten-scoped Klassen —
 * die veraltete zwangsläufig. Seit das CSS inline ausgeliefert wird, steht
 * ohnehin alles im HTML: hier werden externe Dateien und <style>-Blöcke
 * gemeinsam ausgewertet, wodurch die Allowlist auf das schrumpft, was
 * wirklich erst zur Laufzeit entsteht.
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
 * Klassen ohne eigene CSS-Regel, die es bewusst gibt: reine
 * JavaScript-Anker oder Strukturhaken, deren Aussehen vollständig von
 * Eltern- oder Kindregeln kommt. Jeder Eintrag braucht eine Begründung —
 * ohne die wächst so eine Liste zu dem zu, was sie hier vorher war:
 * über hundert Zeilen, die niemand mehr prüft.
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

// ---- CSS einsammeln: externe Dateien und Inline-Blöcke -------------------
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
