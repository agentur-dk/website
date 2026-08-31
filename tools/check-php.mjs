#!/usr/bin/env node
/**
 * Findet Funktionsaufrufe in den PHP-Dateien des Formulars, für die es
 * keine Definition gibt.
 *
 * Warum es diese Prüfung gibt: `php -l` prüft nur die Syntax. Ein Aufruf
 * einer nicht existierenden Funktion ist syntaktisch tadellos und fällt
 * erst zur Laufzeit auf — dort dann als fataler Abbruch mit leerer
 * Antwort und HTTP 500. Genau das ist passiert: Ein Umbau hat die
 * Definition von `protokolliere()` mitgelöscht, weil sie zwischen den
 * beiden ersetzten Anweisungen stand. Vier Aufrufe liefen ins Leere,
 * darunter der im Haken für fatale Fehler — der Ausfall konnte sich
 * also nicht einmal selbst protokollieren.
 *
 * Die Liste der eingebauten Funktionen kommt von PHP selbst, damit sie
 * nicht gepflegt werden muss.
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const ORDNER = 'formular';

let eingebaut;
try {
  eingebaut = new Set(
    JSON.parse(
      execFileSync('php', ['-r', 'echo json_encode(array_merge(get_defined_functions()["internal"], ["exit","die","isset","unset","empty","list","echo","print","require","include","require_once","include_once"]));'],
        { encoding: 'utf8' })
    ).map((n) => n.toLowerCase())
  );
} catch {
  console.log('check-php: kein PHP verfügbar — übersprungen.');
  process.exit(0);
}

// Sprachkonstrukte und Methodenaufrufe sollen nicht als Funktion zählen.
const SCHLUESSELWORT = new Set([
  'if', 'elseif', 'else', 'while', 'for', 'foreach', 'switch', 'match',
  'catch', 'fn', 'function', 'return', 'array', 'static', 'use', 'new',
  'and', 'or', 'xor', 'clone', 'yield', 'throw', 'declare', 'namespace',
]);

let fehler = 0;
for (const name of readdirSync(ORDNER).filter((f) => f.endsWith('.php'))) {
  const pfad = join(ORDNER, name);
  const quelle = readFileSync(pfad, 'utf8');

  const definiert = new Set(
    [...quelle.matchAll(/\bfunction\s+([A-Za-z_]\w*)\s*\(/g)].map((m) => m[1].toLowerCase())
  );

  // Zeichenketten leeren, aber die Zeilenstruktur erhalten. Ohne das
  // meldete der Prüfer deutschen Fließtext: »übernommen (Grenze« sieht
  // nach einem Aufruf von bernommen() aus, weil das ü kein \w ist.
  const entschaerft = quelle.replace(
    /'(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*"/gs,
    (treffer) => treffer.replace(/[^\n]/g, ' ')
  );

  const zeilen = entschaerft.split('\n');
  zeilen.forEach((zeile, i) => {
    // Kommentarzeilen überspringen, dort stehen Funktionsnamen als Prosa.
    if (/^\s*(\*|\/\/|#)/.test(zeile)) return;
    for (const treffer of zeile.matchAll(/(^|[^\w$>:])([A-Za-z_]\w*)\s*\(/g)) {
      const ruf = treffer[2].toLowerCase();
      if (SCHLUESSELWORT.has(ruf) || eingebaut.has(ruf) || definiert.has(ruf)) continue;
      // `new finfo(…)` ist ein Konstruktor, keine Funktion.
      const davor = zeile.slice(0, treffer.index + treffer[1].length);
      if (/\bnew\s+$/.test(davor)) continue;
      console.error(`${pfad}:${i + 1}  Aufruf von ${treffer[2]}() — nirgends definiert`);
      fehler++;
    }
  });
}

if (fehler > 0) {
  console.error(`\ncheck-php: ${fehler} Aufruf(e) ohne Definition.`);
  process.exit(1);
}
console.log('check-php: alle Funktionsaufrufe haben eine Definition.');
