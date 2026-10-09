#!/usr/bin/env node
/**
 * Hält src/lib/icons.ts als einzige Quelle für Icons, ausgegeben über
 * Icon.astro — damit ein Symbol an einer Stelle geändert wird und jedes
 * gebaute <svg> aria-hidden trägt. Gemeldet werden
 *   1. jedes <svg> außerhalb von Icon.astro,
 *   2. Einträge, die kein reiner Pfad-String sind,
 *   3. eine nicht alphabetische Reihenfolge,
 *   4. Icons, die niemand benutzt,
 *   5. <Icon name="..."> ohne Eintrag im Verzeichnis,
 * und, wenn dist/ vorliegt, jedes gebaute <svg> ohne aria-hidden.
 */
import { readFileSync, readdirSync, existsSync, statSync } from 'fs';
import { join, relative } from 'path';

const SRC        = 'src';
const DIST       = 'dist';
const VERZEICHNIS = 'src/lib/icons.ts';
const KOMPONENTE  = 'src/components/ui/Icon.astro';

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

if (!existsSync(VERZEICHNIS)) {
  console.error(`✗ ${VERZEICHNIS} fehlt.`);
  process.exit(1);
}
if (!existsSync(KOMPONENTE)) {
  console.error(`✗ ${KOMPONENTE} fehlt.`);
  process.exit(1);
}

const verzeichnisQuelle = readFileSync(VERZEICHNIS, 'utf8');
const eintraege = [...verzeichnisQuelle.matchAll(/^  '([a-z0-9-]+)':\s*\n?\s*'([^']*)',$/gm)]
  .map(([, name, d]) => ({ name, d }));

if (eintraege.length === 0) {
  befunde.push(`${VERZEICHNIS}: keine Icon-Einträge gefunden — Format geändert?`);
}

for (const { name, d } of eintraege) {
  if (!/^[Mm]/.test(d)) {
    befunde.push(`${VERZEICHNIS}: "${name}" beginnt nicht mit einem Moveto (M/m)`);
  }
  if (/[<>"]/.test(d)) {
    befunde.push(`${VERZEICHNIS}: "${name}" enthält Markup statt eines reinen Pfades`);
  }
  if (!/^[MmLlHhVvCcSsQqTtAaZz0-9\s.,-]+$/.test(d)) {
    befunde.push(`${VERZEICHNIS}: "${name}" enthält unerlaubte Zeichen im Pfad`);
  }
}

const namen = eintraege.map((e) => e.name);
const sortiert = [...namen].sort();
for (let i = 0; i < namen.length; i++) {
  if (namen[i] !== sortiert[i]) {
    befunde.push(
      `${VERZEICHNIS}: nicht alphabetisch — "${namen[i]}" steht, wo "${sortiert[i]}" stehen müsste`
    );
    break;
  }
}

/*
 * Testdateien bleiben draußen: Sie enthalten Muster wie `<Icon name="…">`
 * als Zeichenkette und würden sonst als Verwendung zählen.
 */
const quellen = dateien(SRC, ['.astro', '.ts']).filter((d) => !d.endsWith('.test.ts'));
const benutzt = new Set();

for (const datei of quellen) {
  const inhalt = readFileSync(datei, 'utf8');
  const rel = relative('.', datei);

  // Kommentare zählen weder als <svg> noch als Icon-Verwendung.
  const ohneKommentare = inhalt
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '')
    .replace(/<!--[\s\S]*?-->/g, '');

  if (rel !== KOMPONENTE) {
    if (/<svg[\s>]/.test(ohneKommentare)) {
      const zeile = inhalt.split('\n').findIndex((z) => /<svg[\s>]/.test(z)) + 1;
      befunde.push(`${rel}:${zeile}: <svg> im Markup — gehört als Pfad nach ${VERZEICHNIS}`);
    }
  }

  for (const m of ohneKommentare.matchAll(/<Icon\b[^>]*\bname="([^"]+)"/g)) benutzt.add(m[1]);
}

for (const name of benutzt) {
  if (!namen.includes(name)) {
    befunde.push(`<Icon name="${name}" /> hat keinen Eintrag in ${VERZEICHNIS}`);
  }
}

/*
 * Dynamisch gesetzte Namen (`<Icon name={o.ikon} />`) findet die Suche oben
 * nicht. Verlässlich ist nur das gebaute HTML: Steht der Pfad eines Icons
 * darin, wird es benutzt. Nur hinzufügen, nie wegnehmen — ein veraltetes
 * dist/ soll keine Verwendung vortäuschen. Tippfehler im dynamischen Namen
 * fängt die Typisierung auf `IconName`.
 */
if (existsSync(DIST)) {
  const gebaut = readdirSync(DIST)
    .filter((f) => f.endsWith('.html'))
    .map((f) => readFileSync(join(DIST, f), 'utf8'))
    .join('');
  for (const { name, d } of eintraege) {
    if (!benutzt.has(name) && gebaut.includes(d)) benutzt.add(name);
  }
}

for (const name of namen) {
  if (!benutzt.has(name)) {
    befunde.push(`${VERZEICHNIS}: "${name}" wird nirgends benutzt`);
  }
}

let gebauteIcons = 0;
if (existsSync(DIST)) {
  for (const seite of readdirSync(DIST).filter((f) => f.endsWith('.html'))) {
    const html = readFileSync(join(DIST, seite), 'utf8');
    for (const m of html.matchAll(/<svg\b[^>]*>/g)) {
      gebauteIcons++;
      if (!/aria-hidden="true"/.test(m[0])) {
        befunde.push(`dist/${seite}: <svg> ohne aria-hidden="true"`);
      }
    }
  }
}

if (befunde.length > 0) {
  console.error('✗ Icon-Prüfung:');
  for (const b of befunde) console.error(`  - ${b}`);
  process.exit(1);
}

console.log(
  `✓ Icon-Prüfung: ${eintraege.length} Pfade in ${VERZEICHNIS}, alle benutzt, ` +
  `kein <svg> außerhalb von Icon.astro` +
  (gebauteIcons ? `, ${gebauteIcons} gebaute Icons alle aria-hidden.` : '.')
);
