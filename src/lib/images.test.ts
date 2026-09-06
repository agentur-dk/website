import { readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { BILDER, bild, ungeprueft } from '../data/images';
import { KI_MARKER, istKiBild, ohneKiMarker } from './images';

/**
 * Bilder: das Verzeichnis und die Kennzeichnung.
 *
 * Zwei Dinge, die still falsch werden. Eine Kundenmarke ohne geklärte
 * Freigabe fällt niemandem auf, bis sich jemand meldet — und ein
 * KI-erzeugtes Bild ohne Kennzeichnung fällt niemandem auf, bis es jemand
 * beanstandet.
 */
describe('Bildverzeichnis', () => {
  it('nennt zu jedem Bild Verwendung, Motiv und Freigabe', () => {
    expect(BILDER.length).toBeGreaterThan(0);
    for (const eintrag of BILDER) {
      expect(eintrag.verwendung.trim(), eintrag.datei).toBeTruthy();
      expect(eintrag.zeigt.trim(), eintrag.datei).toBeTruthy();
      expect(['eigen', 'erteilt', 'ungeprueft']).toContain(eintrag.freigabe);
    }
  });

  it('verzeichnet jede Datei — und keine, die es nicht gibt', () => {
    const vorhanden = [
      ...readdirSync(new URL('../../public/logos', import.meta.url))
        .filter((d) => /\.(svg|png|jpe?g|webp)$/i.test(d))
        .map((d) => `logos/${d}`),
      ...readdirSync(new URL('../../public/images', import.meta.url))
        .filter((d) => /\.(svg|png|jpe?g|webp)$/i.test(d))
        .map((d) => `images/${d}`),
    ];

    for (const datei of vorhanden) {
      expect(bild(datei), `nicht im Verzeichnis: ${datei}`).toBeDefined();
    }
    for (const eintrag of BILDER) {
      expect(vorhanden, `Eintrag ohne Datei: ${eintrag.datei}`).toContain(eintrag.datei);
    }
  });

  it('lässt die offenen Freigaben offen stehen', () => {
    /* Elf Kundenmarken, bei keiner liegt eine schriftliche Freigabe vor. Wer
       den Wert stillschweigend auf `erteilt` setzt, ohne dass jemand gefragt
       hat, macht aus einer offenen Frage eine Falschangabe. */
    expect(ungeprueft().length).toBeGreaterThan(0);
    for (const eintrag of ungeprueft()) {
      expect(eintrag.datei.startsWith('logos/'), eintrag.datei).toBe(true);
    }
  });

  it('deckt sich mit der Kundenliste', () => {
    /* Was in der Leiste steht, muss im Verzeichnis stehen. Sonst hängt eine
       Marke auf der Startseite, über die niemand etwas weiß. */
    const kunden = readdirSync(new URL('../../public/logos', import.meta.url))
      .filter((d) => /\.(svg|png)$/i.test(d));
    for (const datei of kunden) {
      expect(bild(`logos/${datei}`)?.zeigt, `ohne Motivangabe: ${datei}`).toBeTruthy();
    }
  });
});

describe('Kennzeichnung KI-erzeugter Bilder', () => {
  it('trennt den Marker vom Alternativtext', () => {
    expect(istKiBild('[KI] Blick in ein Büro')).toBe(true);
    expect(istKiBild('Dirk Baedorf, Geschäftsführer')).toBe(false);
    expect(istKiBild(undefined)).toBe(false);

    expect(ohneKiMarker('[KI] Blick in ein Büro')).toBe('Blick in ein Büro');
    expect(ohneKiMarker('[KI]')).toBe('');
    expect(KI_MARKER).toBe('[KI]');
  });

  it('wird am fertigen dist/ geprüft, nicht nur hier', () => {
    /* Der Marker darf nie ausgeliefert werden. Ein Test über den Quelltext
       sähe das nicht — die Prüfung gehört an das Ergebnis. */
    const check = readdirSync(new URL('../../tools', import.meta.url));
    expect(check).toContain('check-seo.mjs');
  });
});
