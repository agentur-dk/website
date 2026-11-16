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
   * Die Aufnahmen sind mit Daniels Stimmklon bei ElevenLabs erzeugt und
   * darum auf der Seite als KI-Stimme gekennzeichnet (Art. 50 Abs. 4
   * KI-Verordnung).
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
  bytes: 392463,
  dauerSekunden: 32,
  transkript: [
    'Hallo, hier ist Daniel Kontelis von der agentur dk in Köln.',
    'Ich mache das seit über zwanzig Jahren, und eines hat sich nie geändert: Gute Arbeit fängt mit Zuhören an. Erst wenn wir verstehen, was Ihr Betrieb braucht und wen Sie erreichen wollen, setzen wir etwas um.',
    'Wir planen, gestalten und bauen alles aus einer Hand, mit einem festen Ansprechpartner. Viele unserer Kunden sind seit Jahren bei uns.',
    'Wenn Sie wissen möchten, wie sichtbar Ihr Unternehmen heute ist, rufen Sie an, oder vereinbaren Sie den Sichtbarkeits-Check.',
  ],
};

/**
 * Die kurze Begrüßung — „Über uns", am Knopf neben dem Porträt. Sie nennt
 * die Beschriftung des Knopfes direkt darunter, „Termin vereinbaren".
 */
export const KURZ: Aufnahme = {
  datei: 'audio/daniel-kontelis-begruessung-kurz.mp3',
  bytes: 99369,
  dauerSekunden: 8,
  transkript: [
    'Danke, dass Sie sich die Zeit nehmen. Wenn Sie uns kennenlernen möchten: Ein Klick auf „Termin vereinbaren“, und wir sprechen uns in den nächsten Tagen.',
  ],
};

/**
 * Die Einladung zum Sichtbarkeits-Check — Startseite, am Porträt im Kopf.
 * Sie sagt dasselbe wie der Hinweis unter dem Knopf daneben, damit Stimme
 * und Text einander nicht widersprechen.
 */
export const CHECK: Aufnahme = {
  datei: 'audio/daniel-kontelis-sichtbarkeits-check.mp3',
  bytes: 148898,
  dauerSekunden: 12,
  transkript: [
    'Hallo, ich bin Daniel Kontelis. Im Sichtbarkeits-Check sehen wir uns gemeinsam an, wie man Ihr Unternehmen heute findet. Sie gehen mit mindestens zwei Dingen heraus, die Sie sofort ändern können. Dreißig Minuten, kostenfrei.',
  ],
};

/**
 * Die Wellenform der langen Aufnahme, aus der Datei erzeugt (ffmpeg, 8 kHz,
 * mono, 16 Bit). Je Balken der Effektivwert seines Abschnitts — das
 * entspricht dem Gehörten —, abgebildet auf 20–100 % der Spurhöhe, damit
 * eine Pause als schmaler Strich sichtbar bleibt. Bei einer neuen Aufnahme
 * neu erzeugen; der Test hält das fest.
 */
export const WELLENFORM = [87, 86, 89, 84, 78, 84, 87, 94, 88, 89, 85, 83, 85, 79, 79, 71, 80, 88, 83, 89, 92, 91, 100, 84, 60] as const;
