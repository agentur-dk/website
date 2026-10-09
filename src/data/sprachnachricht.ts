/**
 * Die Sprachnachrichten: Datei, Wellenform und Wortlaut an einer Stelle. Eine
 * Aufnahme ohne Transkript ist nach WCAG 1.2.1 unvollständig, ein Transkript
 * ohne seine Aufnahme eine Behauptung. `bytes` hält beides zusammen:
 * `sprachnachricht-daten.test.ts` vergleicht mit der echten Datei, und wer
 * eine Aufnahme tauscht, ohne das Transkript anzufassen, bekommt einen roten
 * Test. Ob der Text das Gesprochene wiedergibt, prüft nur ein Mensch — der
 * Test erzwingt, dass jemand hinsieht.
 */

export interface Aufnahme {
  /** Pfad unter `public/`, zugleich die Adresse relativ zur Basis-URL. */
  readonly datei: string;
  /**
   * Dateigröße in Bytes als Fingerabdruck, damit ein Tausch der Datei
   * auffällt. Ein Hash wäre nicht besser: Zwei Aufnahmen treffen einander
   * nicht auf das Byte.
   */
  readonly bytes: number;
  /** Länge in Sekunden, aus der Datei gelesen (`ffprobe`), abgerundet. */
  readonly dauerSekunden: number;
  /**
   * Der Wortlaut, wie gesprochen — die Textalternative nach WCAG 1.2.1.
   *
   * Nicht geglättet: Die kleinen Unebenheiten gesprochener Sprache sind
   * der Grund, warum man einer Aufnahme mehr glaubt als einem Werbetext.
   */
  readonly transkript: readonly string[];
}

/**
 * Die lange Begrüßung — Startseite, in der Chatblase.
 *
 * Die Wellenform gehört zu ihr und steht deshalb nicht im Objekt: Nur
 * dieser eine Auftritt zeichnet Balken.
 */
export const LANG: Aufnahme = {
  datei: 'audio/daniel-kontelis-begruessung.mp3',
  bytes: 653759,
  dauerSekunden: 32,
  transkript: [
    'Hallo, ich bin Daniel Kontelis – Gründer der agentur dk in Köln.',
    'In den Medien bin ich seit über 20 Jahren. In der Zeit lernt man vor allem eins: Die Erfahrung liegt nicht in der Art der Umsetzung, sondern in der Kommunikation – tiefes Verständnis von Kundenwünschen und Zielgruppen.',
    'Technisch sind wir auch vorne dabei. Beratung, Planung, Umsetzung — alles aus einer Hand.',
    'Und wer einmal da ist, bleibt meistens. Fast alle Kunden schon seit vielen Jahren.',
    'Rufen Sie einfach an – wir laden Sie gerne zu einem unverbindlichen Beratungsgespräch ein.',
  ],
};

/**
 * Die kurze Begrüßung — „Über uns", am Knopf neben dem Porträt. Eine eigene
 * Aufnahme, keine Kürzung der langen (8,3 gegen 32,8 Sekunden, die
 * Lautstärkeprofile korrelieren nicht), und braucht darum ihr eigenes
 * Transkript.
 */
export const KURZ: Aufnahme = {
  datei: 'audio/daniel-kontelis-begruessung-kurz.mp3',
  bytes: 155279,
  dauerSekunden: 8,
  /*
   * Ein Atemzug, deshalb ein Absatz. Die Anführungszeichen um „Termin
   * vereinbaren" machen sichtbar, was die Stimme betont: die Beschriftung
   * des Knopfes direkt darunter.
   */
  transkript: [
    'Danke, dass Sie sich über uns informieren. Wir freuen uns, Sie kennenzulernen. Ein Klick auf „Termin vereinbaren“ und wir hören uns in den kommenden Tagen.',
  ],
};

/**
 * Die Wellenform der langen Aufnahme, aus der Datei erzeugt (ffmpeg, 8 kHz,
 * mono, 16 Bit). Je Balken der Effektivwert seines Abschnitts — das
 * entspricht dem Gehörten —, abgebildet auf 20–100 % der Spurhöhe, damit
 * eine Pause als schmaler Strich sichtbar bleibt. Bei einer neuen Aufnahme
 * neu erzeugen; der Test hält das fest.
 */
export const WELLENFORM = [100, 94, 73, 86, 81, 82, 64, 83, 83, 86, 75, 79, 63, 82, 66, 94, 75, 67, 95, 68, 89, 85, 95, 91, 54] as const;
