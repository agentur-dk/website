#!/usr/bin/env node
/**
 * Der Verlauf gehört allein dem Footer: Trägt der Abschnitt unmittelbar
 * darüber denselben Verlauf, läuft er über beide Flächen und beginnt an der
 * Grenze neu — eine sichtbare Naht quer über die Seite. Gemeldet wird, wenn
 * der letzte Abschnitt vor <footer> ihn trägt; weiter oben bleibt er
 * erlaubt, dort stoßen die Flächen nicht aneinander.
 */
import { readFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';

const DIST = 'dist';

if (!existsSync(DIST)) {
  console.error('✗ dist/ fehlt — bitte zuerst "npm run build" ausführen.');
  process.exit(1);
}

function cssVonSeite(html) {
  let css = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)]
    .map((m) => m[1])
    .join('\n');

  const astroDir = join(DIST, '_astro');
  if (existsSync(astroDir)) {
    for (const datei of readdirSync(astroDir).filter((f) => f.endsWith('.css'))) {
      css += '\n' + readFileSync(join(astroDir, datei), 'utf8');
    }
  }
  return css;
}

function verlaufsKlassen(css) {
  const treffer = new Set();
  for (const m of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const [, selektor, block] = m;
    if (!/--gradient-footer|--dk-gradient-footer/.test(block)) continue;
    for (const k of selektor.matchAll(/\.([A-Za-z0-9_-]+)/g)) treffer.add(k[1]);
  }
  return treffer;
}

function letzterAbschnitt(html) {
  const grenze = html.search(/<footer[\s>]/i);
  if (grenze < 0) return null;
  const davor = html.slice(0, grenze);

  const offen = [...davor.matchAll(/<section\b([^>]*)>/gi)];
  if (offen.length === 0) return null;

  const attribute = offen[offen.length - 1][1];
  const klasse = attribute.match(/\bclass\s*=\s*"([^"]*)"/i);
  return klasse ? klasse[1].split(/\s+/).filter(Boolean) : [];
}

const seiten = readdirSync(DIST).filter((f) => f.endsWith('.html'));
if (seiten.length === 0) {
  console.error('✗ Keine HTML-Dateien in dist/ — Build unvollständig?');
  process.exit(1);
}

const befunde = [];
let footerMitVerlauf = 0;

for (const seite of seiten) {
  const html = readFileSync(join(DIST, seite), 'utf8');
  const css = cssVonSeite(html);
  const verlauf = verlaufsKlassen(css);

  // Gegenprobe: der Footer selbst muss den Verlauf behalten.
  const footerKlassen = html.match(/<footer\b[^>]*\bclass\s*=\s*"([^"]*)"/i);
  if (footerKlassen && footerKlassen[1].split(/\s+/).some((k) => verlauf.has(k))) {
    footerMitVerlauf++;
  } else {
    befunde.push(`${seite}: der Footer trägt den Verlauf nicht mehr`);
  }

  const klassen = letzterAbschnitt(html);
  if (klassen === null) continue;

  const doppelt = klassen.filter((k) => verlauf.has(k));
  if (doppelt.length > 0) {
    befunde.push(
      `${seite}: der Abschnitt direkt über dem Footer trägt denselben Verlauf ` +
      `(.${doppelt.join(', .')}) — zwei Verlaufsflächen auf Stoß`
    );
  }
}

if (befunde.length > 0) {
  console.error('✗ CTA-Prüfung:');
  for (const b of befunde) console.error(`  - ${b}`);
  process.exit(1);
}

console.log(
  `✓ CTA-Prüfung: auf ${seiten.length} Seiten stößt kein Verlauf an den Footer, ` +
  `und alle ${footerMitVerlauf} Footer tragen ihn noch.`
);
