/**
 * Die Wellenform der Begrüßung — aus der Aufnahme gemessen, nicht gemalt.
 *
 * 25 Balken, wie im Entwurf vorgegeben. Je Balken der Effektivwert über
 * seinen Abschnitt, abgebildet auf 20–100 Prozent der Spurhöhe: Der
 * Effektivwert entspricht dem, was man hört; die Untergrenze hält eine
 * Sprechpause als schmalen Strich sichtbar, statt sie verschwinden zu
 * lassen.
 *
 * Erzeugt aus public/audio/daniel-kontelis-begruessung.mp3 mit ffmpeg
 * (8 kHz, mono, 16 Bit). Wird die Aufnahme getauscht, gehört diese Liste
 * neu erzeugt — sonst zeigt der Balken eine Stimme, die nicht mehr
 * spricht.
 */
export const WELLENFORM = [100, 94, 73, 86, 81, 82, 64, 83, 83, 86, 75, 79, 63, 82, 66, 94, 75, 67, 95, 68, 89, 85, 95, 91, 54] as const;

/** Länge in Sekunden, aus der Datei gelesen. */
export const DAUER_SEKUNDEN = 33;

/**
 * Der Wortlaut, wie gesprochen — die Textalternative nach WCAG 1.2.1.
 *
 * Er steht hier und nicht in den Seiten: Startseite und „Über uns"
 * zeigen ihn beide, und zwei Abschriften derselben Aufnahme laufen
 * auseinander, sobald jemand eine davon glättet.
 *
 * Nicht geglättet: Die kleinen Unebenheiten gesprochener Sprache sind
 * der Grund, warum man einer Aufnahme mehr glaubt als einem Werbetext.
 */
export const TRANSKRIPT = [
  'Hallo, ich bin Daniel Kontelis – Gründer der agentur dk in Köln.',
  'In den Medien bin ich seit über 20 Jahren. In der Zeit lernt man vor allem eins: Die Erfahrung liegt nicht in der Art der Umsetzung, sondern in der Kommunikation – tiefes Verständnis von Kundenwünschen und Zielgruppen.',
  'Technisch sind wir auch vorne dabei. Beratung, Planung, Umsetzung — alles aus einer Hand.',
  'Und wer einmal da ist, bleibt meistens. Fast alle Kunden schon seit vielen Jahren.',
  'Rufen Sie einfach an – wir laden Sie gerne zu einem unverbindlichen Beratungsgespräch ein.',
] as const;

/** Wo die Aufnahme liegt, relativ zur Basis-URL. */
export const DATEI = 'audio/daniel-kontelis-begruessung.mp3';
