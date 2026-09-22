/**
 * Die Wellenform der Begrüßung — aus der Aufnahme gemessen, nicht gemalt.
 *
 * 52 Effektivwerte über die Länge der Datei, auf 12–100 abgebildet. Der
 * Effektivwert statt der Spitze, weil er dem entspricht, was man hört;
 * die Untergrenze von 12, damit eine Sprechpause als schmaler Strich
 * stehenbleibt statt zu verschwinden.
 *
 * Erzeugt aus public/audio/daniel-kontelis-begruessung.mp3. Wird die
 * Aufnahme getauscht, gehört diese Liste neu erzeugt — sonst zeigt der
 * Balken eine Stimme, die nicht mehr spricht.
 */
export const WELLENFORM = [84, 96, 80, 87, 78, 55, 27, 80, 88, 71, 33, 80, 71, 51, 23, 77, 75, 73, 69, 63, 90, 71, 53, 70, 64, 61, 34, 39, 78, 74, 31, 86, 84, 70, 56, 72, 40, 89, 84, 70, 33, 65, 81, 75, 38, 90, 74, 100, 73, 78, 49, 32] as const;

/** Länge in Sekunden, aus der Datei gelesen. */
export const DAUER_SEKUNDEN = 33;
