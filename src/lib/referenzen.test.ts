/**
 * Der Freigabevorbehalt muss auch halten.
 *
 * ── Warum es diesen Test gibt ─────────────────────────────────────────
 * „website-referenzen.docx" warnt in der dritten Zeile: Keine Referenz
 * ist vom Kunden freigegeben, und ein Name auf unserer Website ist eine
 * Veröffentlichung über ihn. Ein Kommentar dazu hilft nicht — er wird
 * überlesen, spätestens von dem, der in einem halben Jahr die
 * Indexierungssperre aufhebt.
 *
 * Deshalb prüft dieser Test die Mechanik selbst: Sobald die Seite live
 * geht, darf kein unfreigegebener Kundenname mehr im HTML stehen.
 */
import { describe, it, expect } from 'vitest';
import { referenzen, sichtbareReferenzen, zeigtUnfreigegebenes } from '../data/referenzen';
import { NOINDEX_ALL } from '../config/site.config';

describe('Referenzen stehen unter Freigabevorbehalt', () => {
  it('jeder Eintrag sagt, ob er freigegeben ist', () => {
    for (const r of referenzen) {
      expect(typeof r.freigegeben, `${r.kunde}: freigegeben fehlt`).toBe('boolean');
    }
  });

  it('jeder Eintrag nennt Kunde, Ergebnis und Link', () => {
    for (const r of referenzen) {
      expect(r.kunde.length, 'Kundenname fehlt').toBeGreaterThan(2);
      expect(r.ergebnis.length, `${r.kunde}: kein Ergebnis`).toBeGreaterThan(40);
      expect(r.link, `${r.kunde}: Link ohne https`).toMatch(/^https:\/\//);
    }
  });

  it('live erscheinen ausschließlich freigegebene Fälle', () => {
    /* Die Funktion hängt an NOINDEX_ALL. Statt den Schalter umzubiegen,
       wird hier die Bedingung selbst geprüft — sie ist die eigentliche
       Zusage. */
    const sichtbar = sichtbareReferenzen();
    if (NOINDEX_ALL) {
      expect(sichtbar.length, 'in der Vorschau werden alle gezeigt').toBe(referenzen.length);
    } else {
      const unfrei = sichtbar.filter((r) => !r.freigegeben);
      expect(
        unfrei.map((r) => r.kunde),
        'Diese Kundennamen stünden ohne Freigabe öffentlich im Netz',
      ).toEqual([]);
    }
  });

  it('die Vorschau markiert, was noch nicht freigegeben ist', () => {
    const gibtUnfreie = referenzen.some((r) => !r.freigegeben);
    expect(zeigtUnfreigegebenes()).toBe(NOINDEX_ALL && gibtUnfreie);
  });

  it('kein unfreigegebener Kundenname steht im gebauten HTML, wenn die Seite live ist', async () => {
    if (NOINDEX_ALL) return; // Vorschau: dort ist es ausdrücklich erlaubt.
    const { readFileSync } = await import('node:fs');
    const html = readFileSync(new URL('../../dist/index.html', import.meta.url), 'utf8');
    for (const r of referenzen.filter((x) => !x.freigegeben)) {
      expect(html, `${r.kunde} steht im HTML, ohne freigegeben zu sein`).not.toContain(r.kunde);
    }
  });
});
