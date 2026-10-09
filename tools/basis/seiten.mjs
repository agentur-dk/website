// ABGELEITETE DATEI — nicht hier bearbeiten.
// Quelle: Code/dk-basis/pruefen/seiten.mjs
// Nachziehen mit: bash ../dk-basis/verteilen.sh
//
// Kopiert statt als Paket eingebunden, damit ein Klon aus sich heraus baut.

/**
 * Die zu prüfenden Seiten eines Builds — als URL-Pfade, wie ein Besucher sie aufruft.
 */
import { readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

function alleHtml(wurzel, ordner = wurzel) {
  const aus = [];
  for (const eintrag of readdirSync(ordner)) {
    const voll = join(ordner, eintrag);
    if (statSync(voll).isDirectory()) aus.push(...alleHtml(wurzel, voll));
    else if (eintrag.endsWith('.html')) aus.push(relative(wurzel, voll).split(sep).join('/'));
  }
  return aus.sort();
}

/** `de/impressum/index.html` → `/de/impressum/`, `impressum.html` → `/impressum.html`. */
export const alsUrl = (datei) => '/' + datei.replace(/(^|\/)index\.html$/, '$1');

/**
 * Seiten je Vorlage statt aller Seiten. Städteseiten und Varianten teilen
 * eine Vorlage; drei Browserläufe für jede der 540 Seiten von AGORA dauerten
 * eine halbe Stunde, und ein Gate, das so lange läuft, wird übersprungen.
 * Gleiche Pfadform ab der dritten Ebene gilt als gleiche Vorlage.
 * `BASIS_ALLE=1` prüft trotzdem alles.
 */
export function seiten(wurzel, { jeVorlage = 3 } = {}) {
  const dateien = alleHtml(wurzel);
  if (process.env.BASIS_ALLE === '1') return { auswahl: dateien, gesamt: dateien.length };
  const gruppen = new Map();
  for (const d of dateien) {
    const teile = d.split('/');
    const vorlage = teile.map((t, i) => (i >= 2 && i < teile.length - 1 ? '*' : t)).join('/');
    if (!gruppen.has(vorlage)) gruppen.set(vorlage, []);
    gruppen.get(vorlage).push(d);
  }
  const auswahl = [...gruppen.values()].flatMap((g) => g.slice(0, jeVorlage));
  return { auswahl: auswahl.sort(), gesamt: dateien.length };
}

/** Führt `arbeit` für alle Einträge mit begrenzter Parallelität aus. */
export async function nebeneinander(liste, anzahl, arbeit) {
  const ergebnisse = new Array(liste.length);
  let naechster = 0;
  await Promise.all(Array.from({ length: Math.min(anzahl, liste.length) }, async () => {
    while (naechster < liste.length) {
      const i = naechster++;
      ergebnisse[i] = await arbeit(liste[i], i);
    }
  }));
  return ergebnisse;
}
