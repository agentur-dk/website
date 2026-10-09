import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

/**
 * Was auf der Karriereseite nicht behauptet werden darf. Eine Arbeits-
 * bedingung, die zu weit geht, liest eine Bewerberin als Zusage — und
 * kündigt womöglich dafür. Deshalb steht dort nur, was im Projekt belegt
 * ist; alles Übrige bleibt ein sichtbarer Platzhalter. Wird eine Angabe
 * bestätigt, gehört sie mit ihrer Quelle aus dieser Liste auf die Seite.
 */
const SEITE = readFileSync('src/pages/jobs.astro', 'utf8');

/** Ohne Kommentare — dort steht ja gerade, warum etwas fehlt. */
const text = SEITE.replace(/\/\*[\s\S]*?\*\//g, '').replace(/<!--[\s\S]*?-->/g, '');

/**
 * In den Kästen „Fehlt: …" stehen die gesuchten Wörter zu Recht — der Satz
 * bestreitet sie, statt sie zu versprechen. Dass die Kästen als Lücke
 * gekennzeichnet sind, prüft ein eigener Test.
 */
const ohneLuecken = text.replace(
  /<div class="marke__nachtrag[^"]*">[\s\S]*?<\/div>/g,
  '',
);

const VERBOTEN: ReadonlyArray<readonly [string, string]> = [
  ['Vier-Tage-Woche',   'nirgends im Projekt belegt'],
  ['4-Tage-Woche',      'dasselbe'],
  ['Homeoffice',        'ob und wie, sagt das Projekt nicht'],
  ['Remote',            'dasselbe'],
  ['mobiles Arbeiten',  'dasselbe'],
  ['Urlaubstage',       'keine Zahl belegt'],
  ['unbefristet',       'die Vertragsart ist nicht belegt'],
  ['Jobticket',         'nicht belegt'],
  ['Jobrad',            'nicht belegt'],
  ['Gehalt',            'keine Spanne belegt — und eine erfundene ist eine Zusage'],
  ['überdurchschnittlich', 'wertende Zusage ohne Beleg'],
  ['familiäre Atmosphäre',  'Floskel, und eine Aussage über das Klima, die niemand geprüft hat'],
  ['flache Hierarchien',    'steht so nirgends; belegt ist „kurze Wege"'],
  ['Probetag',          'der Ablauf der Bewerbung ist nicht belegt'],
  ['Duzkultur',         'nicht belegt'],
];

describe('Karriereseite: keine unbelegten Zusagen', () => {
  for (const [wendung, grund] of VERBOTEN) {
    it(`sagt nicht „${wendung}" — ${grund}`, () => {
      expect(ohneLuecken.toLowerCase()).not.toContain(wendung.toLowerCase());
    });
  }

  it('nennt keine konkrete Stelle, solange keine benannt ist', () => {
    // Eine Stellenanzeige ist der einzige Text auf dieser Website, auf
    // den sich jemand bewirbt. Bis echte Stellen vorliegen, darf hier
    // keine stehen — auch keine „beispielhafte".
    expect(text).toMatch(/Fehlt: die offenen Stellen/);
    expect(text).not.toMatch(/\(m\/w\/d\)/);
  });

  it('führt die Lücken sichtbar, statt sie zu füllen', () => {
    const luecken = [...text.matchAll(/class="luecke"/g)];
    expect(luecken.length).toBeGreaterThanOrEqual(3);
  });

  it('jeder Lücken-Kasten ist als Lücke überschrieben', () => {
    // Sonst wäre der Kasten ein Versteck: Die Wortprüfung oben lässt
    // ihn aus, also muss sichtbar sein, dass darin etwas FEHLT.
    const kaesten = [...text.matchAll(/<div class="marke__nachtrag[^"]*">([\s\S]*?)<\/div>/g)];
    expect(kaesten.length).toBeGreaterThan(0);
    for (const [, inhalt] of kaesten) {
      expect(inhalt).toMatch(/class="luecke"/);
    }
  });

  it('duzt durchgehend und siezt nicht versehentlich', () => {
    // Die Seite duzt mit Absicht; ein „Sie" dazwischen wäre ein Versehen.
    const nurText = text.replace(/<[^>]+>/g, ' ');
    expect(nurText).not.toMatch(/\bIhre Bewerbung\b/);
    expect(nurText).not.toMatch(/\bSie sich\b/);
  });
});
