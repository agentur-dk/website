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
