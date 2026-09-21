/**
 * Referenzen — mit Freigabevorbehalt.
 *
 * ── Warum hier ein Schalter steht ─────────────────────────────────────
 * „website-referenzen.docx" (Stand 21.09.2026) beginnt mit dem Satz:
 * Keine dieser Referenzen ist vom jeweiligen Kunden freigegeben. Ein
 * Name auf unserer Website ist eine Veröffentlichung über ihn.
 *
 * Ein Kommentar, der daran erinnert, hilft nicht — er wird überlesen.
 * Deshalb entscheidet `freigegeben` darüber, ob ein Fall überhaupt ins
 * HTML kommt, und zwar gekoppelt an die Indexierungssperre:
 *
 *   Seite gesperrt (Vorschau)  →  auch unfreigegebene Fälle, sichtbar
 *                                 als „Freigabe ausstehend" markiert
 *   Seite live                 →  ausschließlich freigegebene Fälle
 *
 * Damit kann niemand versehentlich einen Kundennamen veröffentlichen,
 * der noch nicht zugestimmt hat — auch nicht, wenn er diese Datei nie
 * gelesen hat. Wer eine Freigabe einholt, setzt `freigegeben: true` und
 * trägt daneben ein, von wem und wann.
 */
import { NOINDEX_ALL } from '../config/site.config';

export interface Referenz {
  /** Kurze Überschrift — sagt, worum es ging, nicht wer es war. */
  titel: string;
  /** Kundenname, wie er genannt werden darf. */
  kunde: string;
  /** Ort und Branche in einer Zeile. */
  einordnung: string;
  /** Was wir gemacht haben. */
  leistung: string;
  /** Was dabei herauskam — belegbar, nicht werblich. */
  ergebnis: string;
  /** Adresse der Seite, ohne Protokoll in der Anzeige. */
  link: string;
  /** Schlagwort für die Karte. */
  tag: string;
  /**
   * Dither-Muster für die Bildfläche.
   *
   * Vorher stand dort das Schlagwort als „Initialen" — ein Feld, das
   * für Kürzel wie „BMBFSFJ" gebaut war. „Gesundheit" wurde darin zu
   * „ESUNDHE". Statt den Text zu kürzen, trägt die Fläche jetzt
   * dasselbe Muster wie die Porträts im Kernteam: Es behauptet nichts
   * und ist trotzdem unverwechselbar.
   */
  feld: 'pulse' | 'drift' | 'fade' | 'brain';
  /**
   * Liegt eine Freigabe des Kunden vor?
   * Bei `true` gehört daneben eine Notiz, von wem und wann.
   */
  freigegeben: boolean;
}

export const referenzen: Referenz[] = [
  {
    titel: 'Eine Verwaltung, die man auch mit dem Daumen bedient',
    kunde: 'BNM Immobilien',
    einordnung: 'Köln · Immobilienverwaltung und -vermittlung',
    leistung: 'Website neu gebaut: Struktur, Texte, Gestaltung, Technik',
    ergebnis:
      'Eine Seite, die in einer halben Sekunde steht — gemessen 0,49 s, rund dreimal '
      + 'schneller als die übrigen Auftritte in unserer Betreuung. Kein Karussell, kein '
      + 'Scroll-Hijacking: Eigentümer sollen Kontakt aufnehmen, nicht scrollen.',
    link: 'https://bnm-immobilien.de',
    tag: 'Immobilien',
    feld: 'drift',
    freigegeben: true, // Freigabe von Daniel Kontelis, 21.09.2026
  },
  {
    titel: 'Acht Leistungen, zwei Zielgruppen, eine Seite',
    kunde: 'einfach physio',
    einordnung: 'Düren · Physiotherapiepraxis',
    leistung: 'Erscheinungsbild (2021), Website (2022), seither laufende Betreuung',
    ergebnis:
      'Eine Praxisseite, die Erwachsene und Kinder gleichzeitig anspricht, ohne dass eine '
      + 'der beiden Gruppen sich verläuft: acht Leistungsseiten, Kursbereich, eigene '
      + 'Stellenseite — und für den Kinderbereich eigens gezeichnete Tierillustrationen '
      + 'statt Bildagentur. Seit 2022 ununterbrochen in Betreuung.',
    link: 'https://einfach-physio.de',
    tag: 'Gesundheit',
    feld: 'pulse',
    freigegeben: true, // Freigabe von Daniel Kontelis, 21.09.2026
  },
  {
    titel: 'Eine Praxis, die ihre Website nicht kaufen wollte',
    kunde: 'Kölner Physio Kollektiv',
    einordnung: 'Köln · Physiotherapie',
    leistung: 'Website im Leasing seit 2025, mit eigenen Landingpages je Schwerpunkt',
    ergebnis:
      'Statt einer Einmalinvestition eine feste Monatsrate: Die Praxis bekommt eine '
      + 'gepflegte Website, ohne vierstellig in Vorleistung zu gehen. Neue Schwerpunkte — '
      + 'Laufanalyse, Beckenboden-Training — bekommen eigene Landingpages, statt in einer '
      + 'Sammel-Leistungsseite unterzugehen.',
    link: 'https://koelner-physio-kollektiv.de',
    tag: 'Website-Leasing',
    feld: 'fade',
    freigegeben: true, // Freigabe von Daniel Kontelis, 21.09.2026
  },
  {
    titel: 'Eine Kanzlei, die in zwei Sprachen berät',
    kunde: 'Staboulidou & Kuhlemann',
    einordnung: 'Hannover · Steuerberatungsgesellschaft',
    leistung: 'Website, Logo in mehreren Fassungen, Printmaterial, Bandenwerbung',
    ergebnis:
      'Ein Auftritt, der die Zweisprachigkeit der Kanzlei nicht versteckt, sondern zum '
      + 'Angebot macht — deutsch und griechisch, bis in den Werbeträger hinein: '
      + '„Steuerberatung von A bis Z und α bis Ω."',
    link: 'https://s-k-steuerberatung.de',
    tag: 'Kanzlei',
    feld: 'brain',
    freigegeben: true, // Freigabe von Daniel Kontelis, 21.09.2026
  },
  {
    titel: 'Nach der Promotion stimmte der Name nicht mehr',
    kunde: 'Dr. Anka Hansen',
    einordnung: 'Nörvenich · Psychologin, Trainerin für Resilienz',
    leistung: 'Website und Erscheinungsbild (2022), Neufassung nach der Promotion (2026)',
    ergebnis:
      'Aus Anka Hansen wurde Dr. Anka Hansen — das war keine Zeile Text, sondern ein '
      + 'Eingriff ins ganze Erscheinungsbild. In neun Stunden entstanden vier '
      + 'Logo-Varianten und eine überarbeitete Landingpage, fertig innerhalb eines Monats. '
      + 'Seit 2022 in durchgehender Betreuung.',
    link: 'https://anka-hansen.de',
    tag: 'Personal Branding',
    feld: 'pulse',
    freigegeben: true, // Freigabe von Daniel Kontelis, 21.09.2026
  },
];

/**
 * Was auf der Seite erscheinen darf.
 *
 * Solange die Indexierungssperre steht, ist die Seite eine Vorschau für
 * uns selbst — dort dürfen auch unfreigegebene Fälle stehen, damit man
 * sieht, wie es aussehen wird. Sobald sie live geht, bleiben nur die
 * freigegebenen übrig, ohne dass jemand daran denken muss.
 */
export const sichtbareReferenzen = (): Referenz[] =>
  NOINDEX_ALL ? referenzen : referenzen.filter((r) => r.freigegeben);

/** Zeigt die Seite gerade auch Unfreigegebenes? Dann wird das markiert. */
export const zeigtUnfreigegebenes = (): boolean =>
  NOINDEX_ALL && referenzen.some((r) => !r.freigegeben);
