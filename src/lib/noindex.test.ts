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
      expect(pages.length).toBe(16);
      expect(indexablePages.length).toBe(15);
    });
  } else {
    it('ist aufgehoben — nur die 404-Seite bleibt ausgenommen', () => {
      const noindex = pages.filter((p) => p.noindex).map((p) => p.slug);
      expect(noindex).toEqual(['404']);
    });
  }
});
