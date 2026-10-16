/**
 * Referenzen mit Freigabevorbehalt: Ein Name auf unserer Website ist eine
 * Veröffentlichung über den Kunden und braucht seine Freigabe.
 *
 * Ein Kommentar wird überlesen, deshalb entscheidet `freigegeben`, gekoppelt
 * an die Indexierungssperre, ob ein Fall ins HTML kommt:
 *
 *   Seite gesperrt (Vorschau)  →  auch unfreigegebene Fälle, als
 *                                 „Freigabe ausstehend" markiert
 *   Seite live                 →  ausschließlich freigegebene Fälle
 *
 * Wer eine Freigabe einholt, setzt `freigegeben: true` und notiert daneben,
 * von wem und wann.
 */
import { NOINDEX_ALL } from '../config/site.config';

/** Leistungen, nach denen projekte.html filtert. */
export type Thema =
  | 'WordPress' | 'BFSG' | 'SEO' | 'Corporate-Design'
  | 'Online-Marketing' | 'Social-Recruiting' | 'KI';

export const THEMEN: Record<Thema, string> = {
  'WordPress': 'WordPress',
  'BFSG': 'BFSG / Barrierefreiheit',
  'SEO': 'SEO & GEO',
  'Corporate-Design': 'Corporate Design',
  'Online-Marketing': 'Online-Marketing',
  'Social-Recruiting': 'Social Recruiting',
  'KI': 'KI',
};

export interface Referenz {
  /** Kurze Überschrift — sagt, worum es ging, nicht wer es war. */
  titel: string;
  /** Kundenname, wie er genannt werden darf. Nie anonymisiert. */
  kunde: string;
  /** Ort oder Bereich und Jahr in einer Zeile. */
  einordnung: string;
  /** Was wir gemacht haben. */
  leistung: string;
  /** Was dabei herauskam — belegbar, nicht werblich. Zahlen nur mit Nachweis. */
  ergebnis: string;
  /**
   * Externe Adresse mit https oder eine eigene Seite wie `marken.html`.
   * Fehlt, wenn es keine öffentliche Seite zum Projekt gibt.
   */
  link?: string;
  /** Schlagwort für die Karte. */
  tag: string;
  /** Leistungen für den Filter auf projekte.html. */
  themen: Thema[];
  /**
   * Dither-Muster für die Bildfläche — es behauptet nichts und ist trotzdem
   * unverwechselbar, anders als ein gekürztes Schlagwort.
   */
  feld: 'pulse' | 'drift' | 'fade' | 'brain';
  /** Eigene Marke der Agentur, kein Kundenauftrag. */
  eigen?: boolean;
  /** Steht auf der Startseite: kleinere Betriebe als Spiegel für Besucher. */
  startseite?: boolean;
  /** Steht auf „Über uns": die bekanntesten Namen. */
  ueberUns?: boolean;
  /**
   * Liegt eine Freigabe des Kunden vor?
   * Bei `true` gehört daneben eine Notiz, von wem und wann.
   */
  freigegeben: boolean;
}

export const referenzen: Referenz[] = [
  {
    titel: 'Ein Anfrageportal für Familien mit Kindern mit Handicap',
    kunde: 'Bundesministerium für Bildung, Familie, Senioren, Frauen und Jugend',
    einordnung: 'Öffentliche Hand · 2025',
    leistung: 'Konzeption, Gestaltung und Umsetzung',
    ergebnis:
      'Ein deutschlandweites Eltern-Anfrageportal für Familienhotels. Der Fokus liegt auf '
      + 'sozialschwachen Familien mit Kindern mit Handicap. Herausforderung: eine neue '
      + 'barrierearme Website und ein reibungsloser Buchungsprozess für alle.',
    tag: 'Öffentliche Hand',
    themen: ['BFSG', 'WordPress'],
    feld: 'brain',
    ueberUns: true,
    freigegeben: true, // Freigabe von Daniel Kontelis, 16.10.2026
  },
  {
    titel: 'Recruiting im Konzern, gedreht in NRW',
    kunde: 'TARGOBANK AG',
    einordnung: 'Finanzdienstleistung · 2024',
    leistung: 'Social-Recruiting-Kampagne mit Konzeption, Planung und Videodreh',
    ergebnis:
      'Eine Social-Recruiting-Kampagne für NRW, von der Konzeption über die Planung bis '
      + 'zum Videodreh. Herausforderung: einen modernen Recruitingprozess in bestehende '
      + 'Konzernprozesse zu integrieren.',
    tag: 'Social Recruiting',
    themen: ['Social-Recruiting', 'Online-Marketing'],
    feld: 'drift',
    ueberUns: true,
    freigegeben: true, // Freigabe von Daniel Kontelis, 16.10.2026
  },
  {
    titel: 'Eine Website für blinde und sehende Menschen',
    kunde: 'Berufsförderungswerk Düren & Mainz',
    einordnung: 'Bildung · 2025',
    leistung: 'Konzeption, Gestaltung und Entwicklung',
    ergebnis:
      'Eine Website für die Zielgruppe blinde Menschen. Herausforderung: Usability und '
      + 'Design so zu verbinden, dass sie für sehende und blinde Menschen gleichermaßen '
      + 'funktionieren.',
    tag: 'Barrierefreiheit',
    themen: ['BFSG', 'WordPress'],
    feld: 'fade',
    freigegeben: true, // Freigabe von Daniel Kontelis, 16.10.2026
  },
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
    themen: ['WordPress'],
    startseite: true,
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
    themen: ['WordPress', 'Corporate-Design'],
    startseite: true,
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
    themen: ['WordPress'],
    startseite: true,
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
    themen: ['WordPress', 'Corporate-Design'],
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
    themen: ['WordPress', 'Corporate-Design'],
    feld: 'pulse',
    freigegeben: true, // Freigabe von Daniel Kontelis, 21.09.2026
  },
  {
    titel: 'Ein Herzensprojekt, gewachsen wie ein Olivenbaum',
    kunde: 'DU BIST GRIECHE',
    einordnung: 'Eigene Marke · Community, Shop · seit 2015',
    leistung: 'Marke, Plattform, Inhalte und Shop aus eigener Hand',
    ergebnis:
      'Die größte Plattform für Griechenland-Liebhaber im deutschsprachigen Raum, aus '
      + 'eigenen Kräften in der Agentur gestemmt und über Jahre gewachsen. Über alle Kanäle '
      + 'hinweg erreicht sie tausende Menschen; dazu kamen ein eigener Podcast und seit '
      + '2026 ein Shop.',
    link: 'marken.html',
    tag: 'Eigene Marke',
    themen: ['Online-Marketing', 'Corporate-Design'],
    feld: 'drift',
    eigen: true,
    ueberUns: true,
    freigegeben: true, // Text freigegeben von Daniel Kontelis, 16.10.2026
  },
  {
    titel: 'Die erste Anlaufstelle für Social Media in der Apotheke',
    kunde: 'aposocial',
    einordnung: 'Eigene Plattform · Apotheken und OTC/Pharma · seit 2021',
    leistung: 'Plattform, selbst programmiertes CMS, zertifizierte Schnittstelle zu den Netzwerken',
    ergebnis:
      'Tausende Apotheken und ihre Community kommen zu aposocial, wenn es um ihre '
      + 'Social-Media-Kommunikation geht. Ein selbst programmiertes CMS mit zertifizierter '
      + 'Schnittstelle zu den Netzwerken nimmt ihnen dabei die Arbeit im Alltag ab. Zugleich '
      + 'bringt die Plattform Unternehmen aus dem OTC- und Pharmabereich mit Apotheken '
      + 'zusammen: Sie präsentieren dort Produkte und Unternehmen und stärken die '
      + 'Kommunikation ihres Außendienstes in der Apotheke.',
    link: 'https://aposocial.de',
    tag: 'Eigene Plattform',
    themen: ['Online-Marketing'],
    feld: 'pulse',
    eigen: true,
    freigegeben: true, // Text freigegeben von Daniel Kontelis, 16.10.2026
  },
];

/**
 * Was auf der Seite erscheinen darf: In der Vorschau auch unfreigegebene
 * Fälle, damit man das Ergebnis sieht; live nur die freigegebenen, ohne dass
 * jemand daran denken muss.
 */
export const sichtbareReferenzen = (): Referenz[] =>
  NOINDEX_ALL ? referenzen : referenzen.filter((r) => r.freigegeben);

/** Zeigt die Seite gerade auch Unfreigegebenes? Dann wird das markiert. */
export const zeigtUnfreigegebenes = (): boolean =>
  NOINDEX_ALL && referenzen.some((r) => !r.freigegeben);

/** Themen, zu denen es mindestens einen sichtbaren Fall gibt — ein Filter ohne Treffer wäre eine Sackgasse. */
export const vergebeneThemen = (): Thema[] =>
  (Object.keys(THEMEN) as Thema[]).filter((t) => sichtbareReferenzen().some((r) => r.themen.includes(t)));
