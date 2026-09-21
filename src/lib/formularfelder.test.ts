/**
 * Jedes Formular muss die Feldnamen benutzen, die der Endpunkt kennt.
 *
 * ── Warum es diesen Test gibt ─────────────────────────────────────────
 * Am 21.09.2026 bekam der Beratungs-Funnel ein Feld `gestartet` statt
 * `form_started`. Der Endpunkt wertet nur den zweiten Namen aus — und
 * wenn er bei einer JSON-Anfrage fehlt, ruft er `stillVerwerfen()`.
 * Kein Fehler, kein Protokolleintrag, keine Rückmeldung: Die Anfrage
 * wäre einfach verschwunden. Aufgefallen ist es beim Lesen von
 * `send.php`, nicht beim Testen — und genau das soll sich nicht
 * wiederholen.
 *
 * Geprüft wird gegen die Namen, die in `formular/send.php` selbst
 * stehen. Ändert sich dort etwas, schlägt dieser Test an, statt dass
 * Anfragen still ausbleiben.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';

const bauOrdner = new URL('../../dist/', import.meta.url);

/** Alle gebauten Seiten, die ein Formular enthalten. */
function seitenMitFormular(): { datei: string; html: string }[] {
  return readdirSync(bauOrdner)
    .filter((d) => d.endsWith('.html'))
    .map((datei) => ({
      datei,
      html: readFileSync(new URL(datei, bauOrdner), 'utf8'),
    }))
    .filter((s) => /<form[\s>]/.test(s.html));
}

/** Feldnamen innerhalb der <form>-Bereiche einer Seite. */
function felderVon(html: string): Set<string> {
  const namen = new Set<string>();
  for (const block of html.match(/<form[\s\S]*?<\/form>/g) ?? []) {
    for (const m of block.matchAll(/name="([a-zA-Z_][a-zA-Z0-9_[\]]*)"/g)) {
      /* `noUncheckedIndexedAccess` im strictest-Profil: m[1] ist
         `string | undefined`, obwohl die Gruppe im Muster steht. */
      if (m[1]) namen.add(m[1]);
    }
  }
  return namen;
}

/* Ohne diese beiden kommt nichts an: `form_started` entscheidet über die
   Zeitschranke, `page` darüber, ob in der Mail steht, woher die Anfrage
   kam. Beide sind in send.php namentlich verdrahtet. */
const PFLICHT = ['form_started', 'page'];

describe('Formularfelder passen zum Endpunkt', () => {
  const seiten = seitenMitFormular();

  it('es gibt überhaupt Seiten mit Formular', () => {
    expect(seiten.length).toBeGreaterThan(0);
  });

  for (const { datei, html } of seiten) {
    it(`${datei} schickt die Pflichtfelder`, () => {
      const felder = felderVon(html);
      const fehlend = PFLICHT.filter((f) => !felder.has(f));
      expect(
        fehlend,
        `${datei}: Ohne diese Felder verwirft send.php die Anfrage stillschweigend`,
      ).toEqual([]);
    });

    it(`${datei} trägt mindestens einen Honigtopf`, () => {
      const felder = felderVon(html);
      const hat = felder.has('hp_email') || felder.has('_gotcha');
      expect(hat, `${datei}: kein Honigtopf im Formular`).toBe(true);
    });
  }

  it('send.php kennt die Pflichtfelder noch unter diesen Namen', () => {
    const php = readFileSync(new URL('../../formular/send.php', import.meta.url), 'utf8');
    for (const feld of PFLICHT) {
      expect(php, `send.php erwähnt '${feld}' nicht mehr`).toContain(`'${feld}'`);
    }
  });
});
