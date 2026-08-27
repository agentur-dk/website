/**
 * Kundenliste für die Vertrauensleiste auf der Startseite.
 *
 * Vorher standen die sechs Namen zwölfmal von Hand im HTML (einmal sichtbar,
 * einmal für den zweiten Durchlauf der Schleife). Zwei Listen, die niemand
 * synchron hält, sind die gleiche Fehlerquelle, die zuletzt drei Kopien
 * desselben CTA-Blocks entstehen ließ — deshalb hier eine Quelle.
 *
 * Bildmarken kommen als SVG nach `public/logos/`. Fehlt die Datei, setzt die
 * Leiste den Namen als Wortmarke — die Seite bleibt also vollständig, auch
 * solange noch nicht alle Dateien da sind. Siehe public/logos/README.md.
 */

export interface Kunde {
  /** Sichtbarer Name. Steht als alt-Text, sobald eine Bildmarke da ist. */
  name: string;

  /**
   * Dateiname unter `public/logos/`, z. B. 'bfw-dueren.svg'.
   * Einfarbige SVGs funktionieren am besten: die Leiste färbt sie weiß.
   */
  logo?: string;

  /**
   * Optische Höhe in rem, Vorgabe 1.75.
   * Eine breite Wortmarke wirkt bei gleicher Höhe größer als ein
   * quadratisches Signet — das gleicht dieser Wert aus.
   */
  hoehe?: number;

  /**
   * Gesetzt, wenn hier bewusst nie eine Bildmarke stehen soll.
   * Der Text ist die Begründung und wird beim Build ausgegeben, damit
   * die Entscheidung nicht später versehentlich zurückgedreht wird.
   */
  ohneLogo?: string;
}

export const kunden: readonly Kunde[] = [
  {
    name: 'TARGOBANK AG',
  },
  {
    name: 'Bundesministerium BMBFSFJ',
    ohneLogo:
      'Das Corporate Design des Bundes erlaubt keine Einfärbung oder sonstige ' +
      'Veränderung des Behördenlogos, und eine Referenznennung mit Logo ' +
      'erweckt den Anschein einer amtlichen Empfehlung. Hier bleibt es beim Namen.',
  },
  {
    name: 'Berufsförderungswerk Düren',
  },
  {
    name: 'Berufsförderungswerk Mainz',
  },
  {
    name: 'DU BIST GRIECHE',
  },
  {
    name: 'aposocial',
  },
] as const;
