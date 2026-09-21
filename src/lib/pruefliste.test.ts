/**
 * Die Prüfwerkzeuge dürfen keine Seite übersehen.
 *
 * ── Warum es diesen Test gibt ─────────────────────────────────────────
 * `a11y.mjs`, `wcag-manual.mjs` und `lighthouse.mjs` führen je eine
 * eigene, von Hand gepflegte Seitenliste. Das sind drei Wahrheiten neben
 * der einen in `site.config.ts` — und als am 21.09.2026 die Seite
 * „beratung" dazukam, fehlte sie in allen dreien. Die Prüfungen liefen
 * weiter grün und meldeten „0 Verstöße auf 16 Seiten", während 19 Seiten
 * gebaut wurden. Eine grüne Prüfung, die eine Seite gar nicht ansieht,
 * ist schlimmer als eine rote: Sie erzeugt Vertrauen, das sie nicht
 * einlöst.
 *
 * Der Test vergleicht deshalb die drei Listen gegen das Seitenregister.
 * Ausgenommen sind nur Seiten, die absichtlich nicht im Index stehen und
 * keinen eigenen Inhalt tragen (Danke-, Fehler-Seiten).
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { pages } from '../config/site.config';

const WERKZEUGE = ['tools/a11y.mjs', 'tools/wcag-manual.mjs', 'tools/lighthouse.mjs'];

/** Seiten ohne eigenen Inhalt, die keine Prüfung brauchen. */
const AUSGENOMMEN = new Set(['danke', 'formular-fehler']);

/** Liest das ALL_PAGES-Array aus einer Werkzeugdatei. */
function listeAus(datei: string): string[] {
  const quelle = readFileSync(new URL(`../../${datei}`, import.meta.url), 'utf8');
  const start = quelle.indexOf('const ALL_PAGES = [');
  if (start < 0) throw new Error(`ALL_PAGES nicht in ${datei} gefunden`);
  const ende = quelle.indexOf('];', start);
  const block = quelle.slice(start, ende);
  return [...block.matchAll(/'([^']+)'/g)]
    .map((m) => m[1])
    .filter((s): s is string => Boolean(s));
}

const erwartet = pages
  .map((p) => (p.slug === '' ? 'index' : p.slug))
  .filter((s) => !AUSGENOMMEN.has(s));

describe('Prüfwerkzeuge kennen jede Seite', () => {
  for (const datei of WERKZEUGE) {
    it(`${datei} listet alle Seiten aus site.config`, () => {
      const vorhanden = new Set(listeAus(datei));
      const fehlend = erwartet.filter((s) => !vorhanden.has(s));
      expect(
        fehlend,
        `Fehlt in ${datei} — die Prüfung liefe grün, ohne diese Seite anzusehen`,
      ).toEqual([]);
    });
  }

  it('listet keine Seite, die es nicht mehr gibt', () => {
    const bekannt = new Set([...erwartet, ...AUSGENOMMEN]);
    for (const datei of WERKZEUGE) {
      const tote = listeAus(datei).filter((s) => !bekannt.has(s));
      expect(tote, `Unbekannte Einträge in ${datei}`).toEqual([]);
    }
  });
});
