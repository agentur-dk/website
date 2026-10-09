#!/usr/bin/env node
/**
 * Findet in den Shell-Skripten Konstrukte, die bash 3.2 nicht kennt. macOS
 * liefert bash 3.2 aus, und die Skripte laufen als `bash formular/…` genau
 * dort; `${var,,}` etwa scheitert erst zur Laufzeit, und `bash -n` lässt es
 * durch.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const ORDNER = 'formular';

const VERBOTEN = [
  [/\$\{[A-Za-z_]\w*(\[[^\]]*\])?,,?\}/, 'Kleinschreibung ${var,,} — erst ab bash 4'],
  [/\$\{[A-Za-z_]\w*(\[[^\]]*\])?\^\^?\}/, 'Großschreibung ${var^^} — erst ab bash 4'],
  [/\bdeclare\s+-A\b/, 'assoziatives Array (declare -A) — erst ab bash 4'],
  [/\b(mapfile|readarray)\b/, 'mapfile/readarray — erst ab bash 4'],
  [/&>>/, '&>> — erst ab bash 4'],
  [/;;&/, ';;& in case — erst ab bash 4'],
];

let fehler = 0;
for (const name of readdirSync(ORDNER).filter((f) => f.endsWith('.sh'))) {
  const pfad = join(ORDNER, name);
  readFileSync(pfad, 'utf8').split('\n').forEach((zeile, i) => {
    if (/^\s*#/.test(zeile)) return;   // Kommentare dürfen es benennen
    for (const [muster, grund] of VERBOTEN) {
      if (muster.test(zeile)) {
        console.error(`${pfad}:${i + 1}  ${grund}`);
        fehler++;
      }
    }
  });
}

if (fehler > 0) {
  console.error(`\ncheck-shell: ${fehler} Stelle(n), die auf macOS scheitern.`);
  process.exit(1);
}
console.log('check-shell: alle Skripte laufen auf bash 3.2.');
