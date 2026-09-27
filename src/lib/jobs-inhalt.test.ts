import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

/**
 * Was auf der Karriereseite nicht behauptet werden darf.
 *
 * Übernommen aus dem s-k-Projekt (freut-sich-auf-mich.de), wo dieselbe
 * Prüfung neun Wendungen führt. Dort steht auch der Grund, und er wiegt
 * hier schwerer als auf jeder anderen Seite dieser Website:
 *
 *   „Solche Sätze sind gefährlicher als offensichtlich Erfundenes:
 *    Sie klingen wie eine Zusage, und eine Bewerberin liest sie als
 *    Versprechen."
 *
 * Eine Marketingaussage, die zu weit geht, kostet Glaubwürdigkeit. Eine
 * Arbeitsbedingung, die zu weit geht, bringt jemanden dazu, seine
 * Stelle zu kündigen. Deshalb steht auf der Seite nur, was im Projekt
 * belegt ist — Anschrift, Teamgröße, Erreichbarkeit, Leistungen,
 * Auftraggeber — und alles Übrige bleibt ein sichtbarer Platzhalter.
 *
 * Wird eine dieser Angaben bestätigt, gehört sie aus dieser Liste
 * heraus und mit ihrer Quelle auf die Seite. Der Test ist die Hürde
 * davor, nicht ein Verbot für immer.
 */
const SEITE = readFileSync('src/pages/jobs.astro', 'utf8');

/** Ohne Kommentare — dort steht ja gerade, warum etwas fehlt. */
const text = SEITE.replace(/\/\*[\s\S]*?\*\//g, '').replace(/<!--[\s\S]*?-->/g, '');

/**
 * Der Text ohne die Lücken-Kästen.
 *
 * In einem Kasten mit der Überschrift „Fehlt: …" stehen die Wörter, die
 * auf der Seite fehlen — „Homeoffice", „Urlaubstage", „Gehaltsspanne".
 * Genau dort sind sie richtig: Der Satz bestreitet sie, er verspricht
 * sie nicht. Die Wortprüfung läuft deshalb gegen alles AUSSER diesen
 * Kästen; dass die Kästen als solche gekennzeichnet sind, prüft der
 * Test darunter.
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
    // Der Registerwechsel gegenüber dem Rest der Website ist Absicht
    // (siehe Kopfkommentar). Ein „Sie" dazwischen wäre keiner.
    const nurText = text.replace(/<[^>]+>/g, ' ');
    expect(nurText).not.toMatch(/\bIhre Bewerbung\b/);
    expect(nurText).not.toMatch(/\bSie sich\b/);
  });
});
