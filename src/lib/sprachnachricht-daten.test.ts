/**
 * Hält Aufnahme und Transkript zusammen.
 *
 * ── Der Anlass ───────────────────────────────────────────────────────
 * Am 23.09.2026 wurde die Datei auf „Über uns“ gegen eine andere
 * getauscht — 8 Sekunden statt 33 —, und der Text darunter blieb
 * stehen. Fünf Absätze aus einer Aufnahme, die dort niemand mehr hört.
 * Aufgefallen ist es, weil jemand zufällig hinsah.
 *
 * ── Was dieser Test kann und was nicht ───────────────────────────────
 * Er kann NICHT prüfen, ob ein Transkript wiedergibt, was gesprochen
 * wird. Das kann nur ein Mensch.
 *
 * Er kann erzwingen, dass ein Mensch hinsieht: Wer eine Datei tauscht,
 * ändert ihre Größe, und die steht im Datensatz daneben. Ein Tausch
 * ohne Blick aufs Transkript wird rot statt still falsch.
 */
import { describe, it, expect } from 'vitest';
import { statSync, existsSync } from 'node:fs';
import { LANG, KURZ, WELLENFORM, type Aufnahme } from '../data/sprachnachricht';

const AUFNAHMEN: ReadonlyArray<readonly [string, Aufnahme]> = [
  ['LANG', LANG],
  ['KURZ', KURZ],
];

describe('Sprachnachrichten', () => {
  for (const [name, a] of AUFNAHMEN) {
    describe(name, () => {
      it('die Datei liegt da, wo der Datensatz sie angibt', () => {
        expect(existsSync(`public/${a.datei}`)).toBe(true);
      });

      it('die Datei ist noch dieselbe wie beim Eintragen des Transkripts', () => {
        const ist = statSync(`public/${a.datei}`).size;
        expect(
          ist,
          `public/${a.datei} hat jetzt ${ist} Bytes statt ${a.bytes}.\n\n` +
          `Die Aufnahme wurde getauscht. Dann gehoert auch das Transkript\n` +
          `in src/data/sprachnachricht.ts (${name}.transkript) neu geschrieben\n` +
          `— sonst steht unter der neuen Aufnahme der Wortlaut der alten.\n` +
          `Danach hier ${name}.bytes auf ${ist} setzen.\n\n` +
          `Bei LANG kommt die Wellenform dazu: neu erzeugen, sonst zeigen\n` +
          `die Balken eine Stimme, die nicht mehr spricht.`,
        ).toBe(a.bytes);
      });

      it('die angegebene Dauer ist plausibel', () => {
        /* Grobe Gegenprobe ueber die Bitrate: Eine MP3 mit rund 150 kbit/s
           traegt etwa 19 kB je Sekunde. Das faengt eine Dauer ab, die um
           eine Groessenordnung danebenliegt — genauer muss es nicht sein,
           denn die Dauer steuert nur die Anzeige. */
        const geschaetzt = a.bytes / 19_000;
        expect(a.dauerSekunden).toBeGreaterThan(geschaetzt * 0.5);
        expect(a.dauerSekunden).toBeLessThan(geschaetzt * 2);
      });
    });
  }

  /*
   * Die Sperre gegen eine Aufnahme ohne Wortlaut.
   *
   * WCAG 1.2.1 ist Stufe A: Zu reinem Ton MUSS eine gleichwertige
   * Textalternative da sein. Etwas, das nicht ausgeliefert werden darf,
   * gehoert nicht in die Zustaendigkeit der Aufmerksamkeit, sondern in
   * einen Test.
   *
   * „Ueber uns" zeigt zusaetzlich einen ehrlichen Zwischenstand, wenn
   * die Liste leer ist. Das ist keine Dopplung: Der Test greift beim
   * Ausliefern, der Zwischenstand beim Entwickeln — `npm run dev`
   * fuehrt keine Tests aus, und in der Minute zwischen neuer Datei und
   * eingetragenem Text soll die Seite trotzdem nichts Falsches sagen.
   */
  for (const [name, a] of AUFNAHMEN) {
    it(`${name} hat eine Textalternative (WCAG 1.2.1, Stufe A)`, () => {
      expect(
        a.transkript.length,
        `${name} (${a.datei}) hat kein Transkript.\n\n` +
        `Zu einer reinen Tonaufnahme verlangt WCAG 1.2.1 eine\n` +
        `gleichwertige Textalternative — Stufe A, also das Mindeste.\n` +
        `Wortlaut in src/data/sprachnachricht.ts bei ${name}.transkript\n` +
        `eintragen. Nicht sinngemaess: abgeschrieben, wie gesprochen.`,
      ).toBeGreaterThan(0);
    });

    it(`${name}: das Transkript ist fuer diese Laenge plausibel`, () => {
      /* Grobe Gegenprobe gegen das Versehen, das Transkript der einen
         Aufnahme unter die andere zu setzen. Deutsche Rede liegt bei
         rund 100-180 Wort je Minute; die Grenzen hier sind weit genug,
         dass langsames oder schnelles Sprechen nicht anschlaegt, und
         eng genug, dass 33 Sekunden Text unter 8 Sekunden Ton
         auffallen. */
      const woerter = a.transkript.join(' ').split(/\s+/).filter(Boolean).length;
      const jeMinute = (woerter / a.dauerSekunden) * 60;
      expect(
        jeMinute,
        `${name}: ${woerter} Woerter auf ${a.dauerSekunden} s sind ` +
        `${Math.round(jeMinute)} Woerter je Minute.\n\n` +
        `Das liegt ausserhalb dessen, was ein Mensch spricht (60-260).\n` +
        `Wahrscheinlich steht hier das Transkript einer anderen Aufnahme.`,
      ).toBeGreaterThan(60);
      expect(jeMinute).toBeLessThan(260);
    });
  }

  it('die Wellenform hat 25 Balken, jeder zwischen 20 und 100', () => {
    expect(WELLENFORM).toHaveLength(25);
    for (const h of WELLENFORM) {
      expect(h).toBeGreaterThanOrEqual(20);
      expect(h).toBeLessThanOrEqual(100);
    }
  });
});
