/**
 * Das Datenmodell des Lead-Formulars — die Kontrolle, nicht die Quelle der
 * Darstellung. Die Feldnamen stehen auch im Markup (`LeadForm.astro`) und im
 * Endpunkt (`formular/send.php`); `schema.test.ts` hält alle drei zusammen.
 * Ein umbenanntes Feld landete sonst unbemerkt als „Sonstiges" in der Mail.
 *
 * Das Formular wird nicht daraus erzeugt: Bei einem einzigen Formular mit
 * Beschreibungen, Fehlermeldungen und Rechenprobe wäre ein Erzeuger schwerer
 * zu lesen als das Markup.
 */

/** Die drei Schritte, in der Reihenfolge des Formulars. */
export const SCHRITTE = [1, 2, 3] as const;
export type Schritt = (typeof SCHRITTE)[number];

/**
 * Wozu ein Feld da ist.
 *
 * `angabe`   — was der Besucher schreibt und was in der Mail landet.
 * `technik`  — was das Skript setzt: Zeitstempel, Bedienungsnachweis,
 *              Weiterleitungsziele. Ohne JavaScript fehlen einige davon,
 *              und der Endpunkt lässt sie dann bewusst durchgehen.
 * `falle`    — Honigtöpfe. Sie sind für Menschen unsichtbar; wer sie füllt,
 *              bekommt einen gespielten Erfolg und wird nicht zugestellt.
 */
export type Art = 'angabe' | 'technik' | 'falle';

export interface Feld {
  /** Das `name`-Attribut — so kommt es beim Endpunkt an. */
  readonly name: string;
  readonly art: Art;
  /** In welchem Schritt es steht. Technikfelder stehen ausserhalb: `null`. */
  readonly schritt: Schritt | null;
  /** Pflicht im Sinne des Endpunkts (`send.php`, Stufe 5). */
  readonly pflicht: boolean;
}

export const FELDER: readonly Feld[] = [
  { name: 'interesse[]', art: 'angabe', schritt: 1, pflicht: false },
  { name: 'anliegen_text', art: 'angabe', schritt: 1, pflicht: false },

  { name: 'message', art: 'angabe', schritt: 2, pflicht: true },

  { name: 'vorname', art: 'angabe', schritt: 3, pflicht: true },
  { name: 'nachname', art: 'angabe', schritt: 3, pflicht: true },
  { name: 'email', art: 'angabe', schritt: 3, pflicht: true },
  { name: 'firma', art: 'angabe', schritt: 3, pflicht: false },
  { name: 'website_url', art: 'angabe', schritt: 3, pflicht: false },

  /* Aus Vor- und Nachname zusammengesetzt, damit der Endpunkt unverändert
     bleiben konnte, als das Formular die beiden trennte. */
  { name: 'name', art: 'technik', schritt: null, pflicht: false },
  { name: 'page', art: 'technik', schritt: null, pflicht: false },
  { name: 'page_url', art: 'technik', schritt: null, pflicht: false },
  { name: 'form_started', art: 'technik', schritt: null, pflicht: false },
  { name: 'ts_server', art: 'technik', schritt: null, pflicht: false },
  { name: 'ts_sig', art: 'technik', schritt: null, pflicht: false },
  { name: 'interaktion', art: 'technik', schritt: null, pflicht: false },
  /* Nur für den Weg ohne JavaScript: Wohin der Endpunkt weiterleitet. */
  { name: 'weiter', art: 'technik', schritt: null, pflicht: false },
  { name: 'weiter_fehler', art: 'technik', schritt: null, pflicht: false },

  { name: 'hp_email', art: 'falle', schritt: null, pflicht: false },
  { name: '_gotcha', art: 'falle', schritt: null, pflicht: false },
];

/** Alle `name`-Attribute — die Liste, die der Endpunkt sieht. */
export const feldnamen = (): readonly string[] => FELDER.map((f) => f.name);

/** Die Felder einer Art. */
export const felderMit = (art: Art): readonly Feld[] => FELDER.filter((f) => f.art === art);

/**
 * Die Zeitschranke des Endpunkts, in Millisekunden.
 *
 * Steht auch in `src/lib/form-validation.ts` (`SPAM_MIN_MS`) und in
 * `formular/send.php`. Wer sie ändert, muss alle drei anfassen — der Test
 * hält sie zusammen.
 */
export const ZEITSCHRANKE_MS = 3000;
