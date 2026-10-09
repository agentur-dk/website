#!/usr/bin/env node
/**
 * Hält die Typoleiter als einzige Quelle für Schriftgrade, Abschnittspolster
 * und Rinnen. Geprüft wird der Quelltext, nicht der Browser:
 *
 *   1. jede font-size, die keinen Token nennt,
 *   2. jedes padding-block an einem Abschnitt, das keinen Takt nennt,
 *   3. jede gap, die keine Rinne nennt,
 *   4. eigene clamp() für Schriftgrade — die Leiter bringt ihre mit,
 *   5. unbekannte Token-Namen, die CSS sonst stillschweigend ignoriert.
 *
 * Ausnahmen stehen in AUSNAHMEN und brauchen eine Begründung im CSS.
 *
 *   node tools/check-typo.mjs
 */
import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const SRC = 'src';

/** Die Leiter. Wer einen Grad braucht, nennt einen dieser Namen. */
const GRADE = [
  '--dk-schrift-klein',
  '--dk-schrift-karte',
  '--dk-schrift-text',
  '--dk-schrift-vorspann',
  '--dk-schrift-titel-3',
  '--dk-schrift-titel-2',
  '--dk-schrift-titel-1',
  '--dk-schrift-hero',
  // Die alten Namen zeigen auf dieselbe Leiter und bleiben zulässig,
  // solange Tailwind-Klassen wie text-lg darüber laufen.
  '--dk-font-size-xs', '--dk-font-size-sm', '--dk-font-size-base',
  '--dk-font-size-md', '--dk-font-size-lg', '--dk-font-size-xl',
  '--dk-font-size-2xl', '--dk-font-size-3xl',
  '--font-size-klein', '--font-size-karte', '--font-size-text',
  '--font-size-vorspann', '--font-size-titel-3', '--font-size-titel-2',
  '--font-size-titel-1', '--font-size-hero',
  '--font-size-xs', '--font-size-sm', '--font-size-base', '--font-size-md',
  '--font-size-lg', '--font-size-xl', '--font-size-2xl', '--font-size-3xl',
];

const TAKTE  = ['--raum-abschnitt', '--raum-abschnitt-weit', '--dk-raum-abschnitt', '--dk-raum-abschnitt-weit'];
const RINNEN = ['--rinne-1', '--rinne-2', '--rinne-3', '--rinne-4', '--rinne-5', '--rinne-6',
                '--rinne-spalte', '--dk-rinne-1', '--dk-rinne-2', '--dk-rinne-3',
                '--dk-rinne-4', '--dk-rinne-5', '--dk-rinne-6', '--dk-rinne-spalte'];

/**
 * Die eine erlaubte Ausnahme: die WhatsApp-Nachbildung (.sn…), die auf
 * Vorgabe die Grade des Originals trägt. Jeder neue Eintrag braucht eine
 * Begründung in der CSS-Datei, sonst ist er eine stille Ausnahme.
 */
const AUSNAHMEN = [
  { selektor: /\.sn(__|\b)/, grund: 'WhatsApp-Nachbildung, Grade aus der Vorgabe (siehe mono.css)' },
];

/** Relative Einheiten beschreiben ein Verhältnis, keinen Grad. */
const VERHAELTNIS = /^\s*(\d*\.?\d+)(em|%)\s*$/;

/**
 * Unter 2rem polstert ein Bauteil sich selbst (Zelle, Leiste, Brotkrume);
 * darüber trennt jemand Abschnitte, und das gehört in den Takt.
 */
function kleinesPolster(wert) {
  const zahlen = wert.match(/(\d*\.?\d+)(rem|em|px)/g) || [];
  if (!zahlen.length) return wert.trim() === '0';
  return zahlen.every((z) => {
    const n = parseFloat(z);
    return z.endsWith('px') ? n < 32 : n < 2;
  });
}

const befunde = [];

function dateien(wurzel, endungen) {
  const treffer = [];
  for (const eintrag of readdirSync(wurzel)) {
    const pfad = join(wurzel, eintrag);
    if (statSync(pfad).isDirectory()) treffer.push(...dateien(pfad, endungen));
    else if (endungen.some((e) => eintrag.endsWith(e))) treffer.push(pfad);
  }
  return treffer;
}

function selektorBei(text, pos) {
  const treffer = text.slice(0, pos).match(/([^{};]*)\{[^{}]*$/);
  return treffer ? treffer[1].trim() : '';
}

function istAusgenommen(selektor) {
  return AUSNAHMEN.some((a) => a.selektor.test(selektor));
}

function zeileBei(text, pos) {
  return text.slice(0, pos).split('\n').length;
}

function pruefen({ text, datei, muster, erlaubt, was, ueberspringen }) {
  for (const m of text.matchAll(muster)) {
    const wert = m[m.length - 1].trim();
    const selektor = selektorBei(text, m.index);
    if (istAusgenommen(selektor)) continue;
    if (ueberspringen && ueberspringen(wert)) continue;
    const nennt = erlaubt.some((t) => wert.includes(`var(${t}`));
    if (nennt) continue;
    befunde.push(
      `${datei}:${zeileBei(text, m.index)} — ${was} ohne Token: ${wert.slice(0, 54)}` +
      (selektor ? `   (${selektor.slice(0, 44)})` : '')
    );
  }
}

for (const datei of dateien(SRC, ['.css', '.astro'])) {
  const text = readFileSync(datei, 'utf8');

  pruefen({
    text, datei,
    muster: /font-size:\s*([^;}\n]+);/g,
    erlaubt: GRADE,
    was: 'Schriftgrad',
    // Ein em-Wert an einem <sup> ist ein Verhältnis zum Elterngrad, kein eigener Grad.
    ueberspringen: (w) => VERHAELTNIS.test(w) || w === 'inherit',
  });

  pruefen({
    text, datei,
    muster: /padding-block:\s*([^;}\n]+);/g,
    erlaubt: TAKTE,
    was: 'Abschnittspolster',
    ueberspringen: (w) => kleinesPolster(w) || w.includes('calc(') || w.includes('--rinne'),
  });

  pruefen({
    text, datei,
    muster: /\b(?:gap|column-gap|row-gap):\s*([^;}\n]+);/g,
    erlaubt: RINNEN,
    was: 'Rinne',
    ueberspringen: (w) => w === '0' || w === 'inherit' || w.endsWith('px') && parseFloat(w) <= 4,
  });

  // Die Leiter bringt ihre fließenden Grade selbst mit; ein weiteres clamp()
  // wäre eine zweite Meinung darüber, wie Schrift mitwächst.
  for (const m of text.matchAll(/font-size:\s*clamp\(/g)) {
    const selektor = selektorBei(text, m.index);
    if (istAusgenommen(selektor)) continue;
    if (datei.endsWith('tokens/typography.css')) continue;
    befunde.push(`${datei}:${zeileBei(text, m.index)} — eigenes clamp() für einen Schriftgrad; die Leiter hat drei fließende Grade`);
  }

  // CSS ignoriert eine unbekannte Variable stillschweigend — ein Tippfehler
  // fiele sonst nie auf.
  const bekannt = new Set([...GRADE, ...TAKTE, ...RINNEN]);
  for (const m of text.matchAll(/var\((--(?:dk-)?(?:schrift|raum|rinne|font-size)[a-z0-9-]*)/g)) {
    if (bekannt.has(m[1])) continue;
    befunde.push(`${datei}:${zeileBei(text, m.index)} — unbekannter Token: var(${m[1]})`);
  }
}

if (befunde.length) {
  console.error(`\n✗ check-typo: ${befunde.length} Stelle(n) außerhalb der Leiter\n`);
  for (const b of befunde) console.error('  ' + b);
  console.error(
    '\n  Jeder Grad, Takt und jede Rinne hat einen Namen — siehe' +
    '\n  src/styles/tokens/typography.css und tokens/spacing.css.' +
    '\n  Passt keiner, ist das eine Entscheidung über das System,' +
    '\n  nicht über diese eine Stelle: Token ergänzen und begründen.\n'
  );
  process.exit(1);
}

console.log('✓ check-typo: jede Schriftgröße, jedes Abschnittspolster und jede Rinne nennt einen Token');
console.log(`  ${AUSNAHMEN.length} benannte Ausnahme: ${AUSNAHMEN.map((a) => a.grund).join(' · ')}`);
