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

  it('die lange Aufnahme hat ihr Transkript', () => {
    expect(LANG.transkript.length).toBeGreaterThan(0);
  });

  it('die Wellenform hat 25 Balken, jeder zwischen 20 und 100', () => {
    expect(WELLENFORM).toHaveLength(25);
    for (const h of WELLENFORM) {
      expect(h).toBeGreaterThanOrEqual(20);
      expect(h).toBeLessThanOrEqual(100);
    }
  });
});
