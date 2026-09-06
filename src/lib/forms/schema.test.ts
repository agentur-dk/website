import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { FELDER, ZEITSCHRANKE_MS, felderMit, feldnamen } from './schema';

/**
 * Drei Stellen, eine Wahrheit.
 *
 * Die Feldnamen stehen im Markup, im Endpunkt und im Modell. Diese Prüfungen
 * halten sie zusammen — nicht weil eine Liste hübscher wäre, sondern weil ein
 * umbenanntes Feld sonst erst dem auffällt, der die Mail liest.
 */
const markup = readFileSync(new URL('../../components/LeadForm.astro', import.meta.url), 'utf8');
const endpunkt = readFileSync(new URL('../../../formular/send.php', import.meta.url), 'utf8');

/* Nur das Formular selbst, ohne Skript und Stylesheet darunter. */
const formular = markup.slice(markup.indexOf('<form'), markup.indexOf('</form>'));

/* `<Icon name="check">` ist kein Formularfeld. Die Komponente steht mitten im
   Formular, und ihr `name` sähe sonst aus wie eines. */
const imMarkup = new Set(
  [...formular.matchAll(/(?<!<Icon )name="([a-zA-Z_][a-zA-Z0-9_[\]]*)"/g)].map((treffer) =>
    String(treffer[1]),
  ),
);

/** Die Liste `INTERN` aus send.php — die Felder mit eigener Zeile in der Mail. */
const imEndpunkt = new Set(
  (/const INTERN = \[([\s\S]*?)\];/.exec(endpunkt)?.[1] ?? '')
    .split(',')
    .map((teil) => teil.trim().replace(/^'|'$/g, ''))
    .filter(Boolean),
);

describe('Formularmodell', () => {
  it('kennt jedes Feld, das im Markup steht', () => {
    for (const name of imMarkup) {
      expect(feldnamen(), `im Formular, nicht im Modell: ${name}`).toContain(name);
    }
  });

  it('hat für jedes Feld im Modell auch eines im Markup', () => {
    for (const name of feldnamen()) {
      expect(imMarkup.has(name), `im Modell, nicht im Formular: ${name}`).toBe(true);
    }
  });

  it('deckt sich mit der Liste im Endpunkt', () => {
    /* `INTERN` sagt send.php, welche Felder eine eigene Zeile in der Mail
       bekommen. Was dort fehlt, landet als „Sonstiges" — sichtbar erst in
       einer echten Anfrage. */
    for (const name of feldnamen()) {
      expect(imEndpunkt.has(name), `im Modell, nicht in send.php INTERN: ${name}`).toBe(true);
    }
    for (const name of imEndpunkt) {
      expect(feldnamen(), `in send.php, nicht im Modell: ${name}`).toContain(name);
    }
  });

  it('ordnet jedes Angabefeld einem Schritt zu', () => {
    for (const feld of felderMit('angabe')) {
      expect(feld.schritt, `${feld.name} hat keinen Schritt`).not.toBeNull();
    }
    for (const feld of [...felderMit('technik'), ...felderMit('falle')]) {
      expect(feld.schritt, `${feld.name} soll ausserhalb der Schritte stehen`).toBeNull();
    }
  });

  it('verlangt genau das, was der Endpunkt verlangt', () => {
    /* Stufe 5 in send.php: Vorname, Nachname und Nachricht müssen da sein.
       Steht im Modell mehr, verspricht es etwas, das niemand prüft; steht
       weniger, geht eine Anfrage durch, die der Endpunkt abweist. */
    const pflicht = FELDER.filter((f) => f.pflicht).map((f) => f.name).sort();
    expect(pflicht).toEqual(['email', 'message', 'nachname', 'vorname']);
    expect(endpunkt).toMatch(/if \(\$vorname === '' \|\| \$nachname === '' \|\| \$nachricht === ''\)/);
  });

  it('hält die Zeitschranke an drei Stellen gleich', () => {
    const validierung = readFileSync(new URL('../form-validation.ts', import.meta.url), 'utf8');
    expect(validierung).toContain(`const SPAM_MIN_MS = ${ZEITSCHRANKE_MS}`);
    expect(endpunkt).toContain(`< ${ZEITSCHRANKE_MS}`);
  });
});

describe('Der Weg ohne JavaScript', () => {
  it('hat ein echtes Ziel im Markup', () => {
    /* Ohne `action` und `method` ist das Formular ein Skript-Anhängsel: Wer
       kein JavaScript hat, drückt auf einen Knopf, der nichts tut. */
    expect(formular).toMatch(/method="post"/);
    expect(formular).toMatch(/action=\{FORM_ENDPOINT\}/);
  });

  it('sagt dem Endpunkt, wohin er weiterleiten soll', () => {
    expect(formular).toContain('name="weiter"');
    expect(formular).toContain('name="weiter_fehler"');
    expect(formular).toContain('danke.html');
    expect(formular).toContain('formular-fehler.html');
  });

  it('lässt die Prüfung des Browsers zu, solange kein Skript da ist', () => {
    /* `novalidate` im Markup schaltet die einzige Prüfung ab, die es ohne
       Skript gibt. Es wird deshalb erst vom Skript gesetzt. */
    expect(formular).not.toContain('novalidate');
    expect(markup).toContain("form.setAttribute('novalidate', 'novalidate')");
  });

  it('verwirft ein klassisches Formular nicht wegen fehlender Skriptfelder', () => {
    /* `interaktion` und `form_started` setzt erst ein Skript. Der Endpunkt
       darf daran nicht scheitern — sonst ist der Weg ohne JavaScript
       abgeschaltet, ohne dass es jemand merkt: Er antwortet mit einem
       gespielten Erfolg. */
    const stufe3 = /Stufe 3: Bedienungsnachweis[\s\S]{0,1400}?Stufe 4/.exec(endpunkt)?.[0] ?? '';
    expect(stufe3).toContain('if ($istJson)');
  });

  it('leitet absolut weiter, nicht auf den Endpunkt selbst', () => {
    /* Ein reiner Pfad im `Location` löst sich gegen den Rechnernamen des
       Endpunkts auf. Der Besucher landete auf einer Dankeseite, die es dort
       nicht gibt. */
    expect(endpunkt).toMatch(/\$ziel = \$herkunft \. \$ziel;/);
  });
});
