// ABGELEITETE DATEI — nicht hier bearbeiten.
// Quelle: Code/dk-basis/pruefen/ausnahmen.mjs
// Nachziehen mit: bash ../dk-basis/verteilen.sh
//
// Kopiert statt als Paket eingebunden, damit ein Klon aus sich heraus baut.

/**
 * Benannte Ausnahmen eines Projekts, aus seiner package.json:
 *
 *   "dkBasis": { "ausnahmen": [
 *     { "pfad": "/admin/", "pruefung": "einwilligung", "grund": "…" }
 *   ] }
 *
 * `pruefung` weggelassen gilt für alle Prüfungen. Ohne `grund` keine Ausnahme:
 * Eine Ausnahme, die niemand begründen muss, wird zur Gewohnheit. Jede
 * genutzte Ausnahme steht in der Ausgabe, damit sie nicht in Vergessenheit gerät.
 */
import { readFileSync, existsSync } from 'node:fs';

export function ausnahmen(pruefung) {
  if (!existsSync('package.json')) return { gilt: () => false, melden: () => {} };
  const liste = (JSON.parse(readFileSync('package.json', 'utf8')).dkBasis?.ausnahmen ?? [])
    .filter((a) => !a.pruefung || a.pruefung === pruefung);
  for (const a of liste) {
    if (!a.grund?.trim()) {
      console.error(`✗ Ausnahme für ${a.pfad} ohne Begründung — in package.json unter dkBasis.ausnahmen nachtragen`);
      process.exit(1);
    }
  }
  const genutzt = new Set();
  return {
    gilt(url) {
      const a = liste.find((x) => url === x.pfad || url.startsWith(x.pfad.endsWith('/') ? x.pfad : `${x.pfad}/`));
      if (a) genutzt.add(a);
      return Boolean(a);
    },
    melden() {
      for (const a of genutzt) console.log(`  Ausnahme ${a.pfad}: ${a.grund}`);
    },
  };
}
