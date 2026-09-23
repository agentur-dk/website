/**
 * Die Sprachnachrichten: Datei, Wellenform und Wortlaut — an einer Stelle.
 *
 * ── Warum das zusammen steht ──────────────────────────────────────────
 * Eine Aufnahme ohne ihr Transkript ist nach WCAG 1.2.1 unvollständig,
 * ein Transkript ohne seine Aufnahme ist eine Behauptung. Am 23.09.2026
 * ist genau das passiert: Die Datei auf „Über uns“ wurde gegen eine
 * andere getauscht, der Text darunter blieb stehen — fünf Absätze aus
 * 33 Sekunden unter einer Aufnahme von 8.
 *
 * Deshalb liegen sie jetzt in **einem** Objekt, und `bytes` hält beides
 * zusammen: `sprachnachricht.test.ts` liest die echte Datei und
 * vergleicht. Wer eine Aufnahme tauscht, ohne das Transkript anzufassen,
 * bekommt einen roten Test statt einer stillen Falschaussage.
 *
 * Was der Test NICHT kann: prüfen, ob der Text wirklich das wiedergibt,
 * was gesprochen wird. Das kann nur ein Mensch. Er kann aber erzwingen,
 * dass jemand hinsieht — und das ist der ganze Unterschied zwischen
 * einem Fehler, der auffällt, und einem, der monatelang steht.
 */

export interface Aufnahme {
  /** Pfad unter `public/`, zugleich die Adresse relativ zur Basis-URL. */
  readonly datei: string;
  /**
   * Die Dateigröße in Bytes — der Fingerabdruck.
   *
   * Nicht als Optimierung, sondern als Sperre: Sie steht hier, damit ein
   * Tausch der Datei auffällt. Ein Hash wäre genauer und für diesen Zweck
   * nicht besser — zwei verschiedene Aufnahmen treffen einander nicht auf
   * das Byte genau.
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
 * Die kurze Begrüßung — „Über uns“, am Knopf neben dem Porträt.
 *
 * Es ist **keine** Kürzung der langen Aufnahme, sondern eine eigene:
 * 8,256 Sekunden gegen 32,832, und die Lautstärkeprofile korrelieren mit
 * r = +0,11 gegen den Anfang und r = +0,26 gegen das Ende der langen
 * Fassung — also gar nicht. Gemessen mit ffmpeg über 8-kHz-Mono-PCM,
 * nicht geschätzt. Sie braucht darum ihr eigenes Transkript.
 */
export const KURZ: Aufnahme = {
  datei: 'audio/daniel-kontelis-begruessung-kurz.mp3',
  bytes: 155279,
  dauerSekunden: 8,
  /*
   * NOCH LEER — und das ist ein bekannter, sichtbarer Zustand, kein
   * Versehen. Der Wortlaut liegt nur als Ton vor; abgeschrieben hat ihn
   * noch niemand.
   *
   * Solange die Liste leer ist, zeigt „Über uns“ an der Stelle des
   * Transkripts einen Verweis auf die Startseite, wo die ausführliche
   * Nachricht samt Wortlaut steht. Das ist nach WCAG 1.2.1 noch keine
   * gleichwertige Alternative FÜR DIESE Aufnahme — es ist der ehrlichste
   * Zwischenstand, den es ohne den Text gibt, und er behauptet nichts
   * Falsches. Sobald der Wortlaut da ist, fällt der Verweis von selbst
   * weg: Die Seite fragt die Liste, nicht einen Schalter.
   */
  transkript: [],
};

/**
 * Die Wellenform der langen Aufnahme — gemessen, nicht gemalt.
 *
 * 25 Balken. Je Balken der Effektivwert über seinen Abschnitt, abgebildet
 * auf 20–100 Prozent der Spurhöhe: Der Effektivwert entspricht dem, was
 * man hört; die Untergrenze hält eine Sprechpause als schmalen Strich
 * sichtbar, statt sie verschwinden zu lassen.
 *
 * Erzeugt aus der Datei mit ffmpeg (8 kHz, mono, 16 Bit). Wird die
 * Aufnahme getauscht, gehört diese Liste neu erzeugt — sonst zeigt der
 * Balken eine Stimme, die nicht mehr spricht. Der Test hält das fest.
 */
export const WELLENFORM = [100, 94, 73, 86, 81, 82, 64, 83, 83, 86, 75, 79, 63, 82, 66, 94, 75, 67, 95, 68, 89, 85, 95, 91, 54] as const;
