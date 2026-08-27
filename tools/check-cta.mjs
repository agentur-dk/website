#!/usr/bin/env node
/**
 * tools/check-cta.mjs — verhindert zwei Verlaufsflaechen auf Stoss.
 *
 * Der Footer traegt --gradient-footer. Trug der Abschnitt unmittelbar
 * darueber denselben Verlauf, lief er ueber beide Flaechen durch und fing
 * an der Grenze neu an: eine sichtbare Naht quer ueber die Seite. Genau
 * das war auf index, leistungen, projekte und ueber-uns der Fall, weil
 * .closing-cta, .content-cta und CtaSection.astro alle den Footer-Verlauf
 * benutzten.
 *
 * Die Regel lautet seither: der Verlauf gehoert allein dem Footer.
 * Diese Pruefung liest das gebaute HTML, sucht den letzten Abschnitt vor
 * <footer> und meldet, wenn eine seiner Klassen den Verlauf traegt.
 * Ein Verlauf weiter oben auf der Seite (z. B. .content-cta mitten im
 * Text auf website-leasing) bleibt erlaubt -- dort stossen die Flaechen
 * nicht aneinander.
 */
import { readFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';

const DIST = 'dist';

if (!existsSync(DIST)) {
  console.error('✗ dist/ fehlt — bitte zuerst "npm run build" ausführen.');
  process.exit(1);
}

/** Gesamtes CSS einer Seite: eingebettete <style>-Blöcke und externe Dateien. */
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

/** Klassen, deren Regel den Footer-Verlauf setzt. */
function verlaufsKlassen(css) {
  const treffer = new Set();
  for (const m of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const [, selektor, block] = m;
    if (!/--gradient-footer|--dk-gradient-footer/.test(block)) continue;
    for (const k of selektor.matchAll(/\.([A-Za-z0-9_-]+)/g)) treffer.add(k[1]);
  }
  return treffer;
}

/** Klassen des letzten <section> vor </main> bzw. <footer>. */
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
