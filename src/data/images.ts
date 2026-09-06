/**
 * Das Bildverzeichnis: welche Datei wo hängt, was sie zeigt, woher sie kommt
 * — und ob wir sie zeigen dürfen.
 *
 * ── Warum es das gibt ────────────────────────────────────────────────
 * Die Seite trägt zwölf Bilddateien: ein Vorschaubild und elf Kundenmarken.
 * Bei den Marken ist die interessante Angabe nicht die Bildquelle, sondern die
 * **Freigabe**: Eine fremde Wortmarke auf der eigenen Website zu zeigen, ist
 * Werbung mit dem Namen eines anderen. Das ist üblich und meistens gewollt,
 * aber es ist nichts, was man stillschweigend tut.
 *
 * Bis zum 06.09.2026 stand darüber nirgends etwas. Jetzt steht es hier, mit
 * dem ehrlichen Wert `ungeprueft`, wo es niemand mehr weiss. Eine ehrliche
 * Lücke ist prüfbar, eine ausgelassene nicht.
 *
 * `tests/images.test.ts` hält Verzeichnis und Verzeichnisinhalt zusammen:
 * jede Datei einen Eintrag, jeder Eintrag eine Datei.
 */

/** Womit wir das Bild zeigen dürfen. */
export type Freigabe =
  /** Eigenes Material der Agentur. */
  | 'eigen'
  /** Der Kunde hat der Nennung ausdrücklich zugestimmt (Datum in `hinweis`). */
  | 'erteilt'
  /** Niemand weiss es mehr. Nachfragen — siehe public/logos/README.md. */
  | 'ungeprueft';

export interface BildEintrag {
  /** Pfad relativ zu `public/`. */
  readonly datei: string;
  /** Wo es hängt. */
  readonly verwendung: string;
  /** Was darauf zu sehen ist — zugleich der Alt-Text, wo einer gebraucht wird. */
  readonly zeigt: string;
  readonly freigabe: Freigabe;
  readonly hinweis?: string;
}

/** Eine Kundenmarke in der Vertrauensleiste. Immer derselbe Satz Angaben. */
const marke = (datei: string, name: string, hinweis?: string): BildEintrag => ({
  datei: `logos/${datei}`,
  verwendung: 'Vertrauensleiste auf der Startseite (LogoStrip)',
  zeigt: `Bildmarke ${name}`,
  freigabe: 'ungeprueft',
  ...(hinweis ? { hinweis } : {}),
});

export const BILDER: readonly BildEintrag[] = [
  {
    datei: 'images/og-image-website.png',
    verwendung: 'Vorschaubild beim Teilen (og:image), auf allen Seiten',
    zeigt: 'Wortmarke der agentur dk auf dunklem Grund',
    freigabe: 'eigen',
  },

  /* ── Kundenmarken ─────────────────────────────────────────────────────
     Alle elf stammen aus laufenden oder abgeschlossenen Projekten; die
     Dateien kommen aus den Markenhandbüchern der Kunden oder von deren
     Websites. Ob die Nennung als Referenz vereinbart ist, steht in keinem
     Vertrag, der hier liegt. Das ist die offene Frage, nicht die Datei. */
  marke('bmbfsfj.svg', 'Bundesministerium für Bildung, Familie, Senioren, Frauen und Jugend',
    'Ein Bundeswappen ist besonders heikel: § 124 OWiG. Vor dem nächsten Relaunch klären.'),
  marke('targobank.svg', 'TARGOBANK'),
  marke('bfw-mainz.svg', 'Berufsförderungswerk Mainz'),
  marke('aristo-pharma.svg', 'Aristo Pharma'),
  marke('orthomol.svg', 'Orthomol'),
  marke('coco-mat.svg', 'COCO-MAT'),
  marke('pneumologenverband.svg', 'Bundesverband der Pneumologen'),
  marke('aposocial.svg', 'aposocial'),
  marke('du-bist-grieche.svg', 'DU BIST GRIECHE',
    'Eigenes Projekt des Inhabers — die Freigabe ist hier eine Formsache.'),
  marke('generalkonsulat-hellenische-republik.png',
    'Generalkonsulat der Hellenischen Republik',
    'Hoheitszeichen eines fremden Staates. Wie beim Bundeswappen: klären.'),
  marke('ahk-spanien.png', 'AHK Spanien'),
];

/** Der Eintrag zu einer Datei — oder `undefined`. */
export const bild = (datei: string): BildEintrag | undefined =>
  BILDER.find((eintrag) => eintrag.datei === datei);

/** Alles, was noch zu klären ist. */
export const ungeprueft = (): readonly BildEintrag[] =>
  BILDER.filter((eintrag) => eintrag.freigabe === 'ungeprueft');
