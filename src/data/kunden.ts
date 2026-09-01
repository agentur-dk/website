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
   * Gesetzt, wenn die Datei ihre eigenen Farben behalten soll.
   *
   * Die Leiste färbt sonst jede Bildmarke weiß. Bei einer zweifarbigen
   * Marke, deren Form an dem Unterschied hängt — Schrift auf einer
   * Fläche —, macht dieser Filter aus beiden Tönen einen weißen Klotz.
   * Der Text ist die Begründung und steht hier, damit niemand den
   * Filter später „wieder geradezieht" und die Marke damit zerstört.
   */
  eigeneFarben?: string;

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
    logo: 'targobank.svg',
    // Mit 6,67:1 die breiteste Marke der Reihe — entsprechend flach.
    hoehe: 1.932,
  },
  {
    name: 'Bundesministerium für Bildung, Familie, Senioren, Frauen und Jugend',
    logo: 'bmbfsfj.svg',
    hoehe: 4.186,
    // Hier stand bis zum 01.09.2026 `ohneLogo` mit zwei Einwänden: Das
    // Corporate Design des Bundes lässt keine Einfärbung zu, und eine
    // Referenznennung mit Behördenlogo erweckt den Anschein einer
    // amtlichen Empfehlung. Beides wurde vorgetragen; die Aufnahme ist
    // eine ausdrückliche Entscheidung des Inhabers, nicht ein Versehen.
    // Verwendet wird die offizielle Datei von bmbfsfj.bund.de, aus der
    // nur die weiße Grundfläche entfernt wurde.
  },
  {
    name: 'Berufsförderungswerk Mainz',
    logo: 'bfw-mainz.svg',
    // Jubiläumszeichen „60 Jahre“. Kompakter als eine Wortmarke, deshalb höher.
    hoehe: 3.105,
  },
  {
    name: 'DU BIST GRIECHE',
    logo: 'du-bist-grieche.svg',
    // Kein reines Signet, sondern Schrift im Quadrat: Bei den 2.0–2.2 der
    // Hausregel steht »DU BIST GRIECHE« auf 34 px und ist ein grauer Fleck.
    // Ab 45 px ist es lesbar, und die Fläche hat damit ungefähr dieselbe
    // optische Masse wie die breiten Wortmarken daneben.
    hoehe: 3.864,
    eigeneFarben:
      'Quadratisches Signet: weiße Schrift auf einer Fläche. Weiß gefiltert ' +
      'bliebe davon ein weißes Quadrat. Die Fläche steht deshalb auf ' +
      '#4a4a4a — dunkel genug, um sich nicht vorzudrängen, hell genug, ' +
      'damit die quadratische Form auf #101010 zu sehen ist.',
  },
  {
    name: 'Generalkonsulat der Hellenischen Republik in Düsseldorf',
    logo: 'generalkonsulat-hellenische-republik.png',
    // Fast quadratisch (0,94:1) und feine Strichzeichnung — unter etwa
    // 45 px wird der Schild zum Fleck. Deshalb die größte Höhe der Reihe.
    hoehe: 5.083,
    // Staatswappen eines anderen Landes. Derselbe Einwand wie beim
    // Ministerium wurde vorgetragen, die Aufnahme ist eine ausdrückliche
    // Entscheidung des Inhabers.
  },
  {
    name: 'Deutsche Handelskammer für Spanien',
    logo: 'ahk-spanien.png',
    hoehe: 3.974,
    eigeneFarben:
      'Der Bildteil ist eine Fläche mit weißem Stern und weißem „AHK“ darauf. ' +
      'Weiß gefiltert bliebe ein weißes Rechteck. Die Fläche liegt deshalb ' +
      'auf #4a4a4a, die hellen Teile darin auf einer Graustufenrampe bis Weiß — ' +
      'so bleiben Stern und Schriftzug erkennbar.',
  },
  {
    name: 'Bundesverband der Pneumologie, Schlaf- und Beatmungsmedizin',
    logo: 'pneumologenverband.svg',
    hoehe: 5.127,
  },
  {
    name: 'COCO-MAT',
    logo: 'coco-mat.svg',
    hoehe: 2.208,
  },
  {
    name: 'Aristo Pharma',
    logo: 'aristo-pharma.svg',
    hoehe: 2.208,
  },
  {
    name: 'Orthomol',
    logo: 'orthomol.svg',
    hoehe: 2.07,
  },
  {
    name: 'aposocial',
    logo: 'aposocial.svg',
    // Breite Wortmarke, 4,54:1. Bei der Vorgabe von 1.75rem wäre sie fast
    // 8rem breit und würde die Reihe dominieren.
    hoehe: 2.07,
  },
] as const;
