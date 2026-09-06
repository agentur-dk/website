import { describe, it, expect } from 'vitest';
import { NOINDEX_ALL, pages, indexablePages } from '../config/site.config';

/**
 * Diese Tests halten den Zustand der Indexierungssperre fest.
 *
 * Sie sind bewusst so geschrieben, dass sie in beiden Zuständen laufen:
 * solange die Sperre steht, prüfen sie ihre Vollständigkeit; nach dem
 * Live-Schalten prüfen sie, dass keine Reste zurückbleiben. Der Wechsel
 * verlangt damit eine bewusste Entscheidung, statt still zu passieren.
 */
/**
 * Die Seiten, die auch nach dem Live-Schalten aus dem Index bleiben.
 *
 * 404 ist eine Fehlerseite. „Danke" und „Formular-Fehler" haben nur nach
 * einer abgeschickten Anfrage einen Sinn — im Suchergebnis wären sie
 * Sackgassen, und die Dankeseite verspräche etwas, das nicht passiert ist.
 */
const DAUERHAFT_OHNE_INDEX = ['404', 'danke', 'formular-fehler'];

const dauerhaftAusgenommen = (liste: typeof pages): string[] =>
  liste.filter((p) => p.noindex).map((p) => p.slug).sort();

describe('Indexierungssperre', () => {
  it('ist ein eindeutiger boolescher Zustand', () => {
    expect(typeof NOINDEX_ALL).toBe('boolean');
  });

  if (NOINDEX_ALL) {
    it('gilt zurzeit — die Seite wird aus Suchergebnissen herausgehalten', () => {
      expect(NOINDEX_ALL).toBe(true);
    });

    it('lässt das Seitenregister unangetastet, damit das Aufheben ein Einzeiler bleibt', () => {
      // Die Sperre wirkt in der Ausgabe, nicht in den Daten. Wären hier
      // Seiten entfernt worden, müsste man sie beim Live-Schalten
      // wieder von Hand eintragen.
      //
      // Geprüft wird deshalb nicht die Anzahl — die ändert sich mit jeder
      // neuen Seite und sagt nichts —, sondern die Substanz: Es gibt
      // indexierbare Seiten im Register, und die einzigen Ausnahmen sind
      // die, die auch nach dem Live-Schalten welche bleiben.
      expect(indexablePages.length).toBeGreaterThan(0);
      expect(pages.length).toBeGreaterThan(indexablePages.length);
      expect(dauerhaftAusgenommen(pages)).toEqual(DAUERHAFT_OHNE_INDEX);
    });
  } else {
    it('ist aufgehoben — ausgenommen bleiben nur die Seiten ohne Suchwert', () => {
      expect(dauerhaftAusgenommen(pages)).toEqual(DAUERHAFT_OHNE_INDEX);
    });
  }
});
