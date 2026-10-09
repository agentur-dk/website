/*
 * Zentrale Datenquelle: Alles, was mehr als einmal auftaucht (Domain,
 * Kontaktdaten, Navigation, Seitenregister), steht hier. Sitemap, robots.txt,
 * llms.txt, Canonicals, Breadcrumbs und JSON-LD werden daraus erzeugt, damit
 * sie nicht auseinanderlaufen.
 */

/**
 * Formular-Endpunkt auf vorschau.dk-dk.de (goneo, Apache), weil GitHub Pages
 * nur Dateien ausliefert. Ein Endpunkt für alle Vorschau-Projekte: Ein neues
 * Projekt braucht nur einen Eintrag in `erlaubte_herkunft`. Code und
 * Anleitung: formular/
 */
export const FORM_ENDPOINT = 'https://vorschau.dk-dk.de/formular/send.php';

/** Absolute Basis-URL ohne Slash am Ende — kommt aus astro.config.mjs. */
export const SITE_URL = (import.meta.env.SITE ?? 'https://dk-dk.de').replace(/\/$/, '');

/** Pfad-Präfix, unter dem die Seite ausgeliefert wird ('/' bei Custom Domain). */
export const BASE_PATH = import.meta.env.BASE_URL ?? '/';

/*
 * Indexierungssperre — wirkt zugleich auf Meta-Robots, robots.txt,
 * sitemap.xml und llms.txt. Zum Live-Schalten INDEXIERUNG_ERLAUBT auf true
 * setzen; für einen einzelnen Build genügt `SITE_INDEXABLE=true npm run build`.
 *
 * Suchmaschinen dürfen weiter crawlen: Ein `Disallow: /` verhinderte, dass
 * sie das `noindex` sehen, und die URL könnte als reiner Link im Index
 * landen. KI-Crawler werden dagegen ausgesperrt, weil sie `noindex` nicht
 * auswerten.
 */
const INDEXIERUNG_ERLAUBT = false;

/** true, solange die Seite aus Suchergebnissen herausgehalten wird. */
export const NOINDEX_ALL: boolean = import.meta.env.SITE_INDEXABLE !== undefined
  ? import.meta.env.SITE_INDEXABLE !== 'true'
  : !INDEXIERUNG_ERLAUBT;

/** Baut aus einem Seiten-Slug einen absoluten Link (`''` → Startseite). */
export const path = (slug: string): string =>
  slug === '' ? BASE_PATH : `${BASE_PATH}${slug}.html`;

/** Baut aus einem Seiten-Slug eine absolute URL für Canonical/JSON-LD. */
export const absolute = (slug: string): string => `${SITE_URL}${path(slug)}`;

/**
 * Absolute URL einer Datei aus public/, mit Basispfad.
 *
 * Adressen nie aus SITE_URL allein bauen: In der Vorschau liegt die Seite
 * unter /website/, und ohne Basispfad zeigen sie dort ins Leere.
 */
export const datei = (pfad: string): string =>
  `${SITE_URL}${BASE_PATH}${pfad.replace(/^\//, '')}`;

export const siteConfig = {
  name:        'agentur dk',
  legalName:   'agentur dk – design & kommunikation',
  tagline:     'design & kommunikation',
  founder:     'Daniel Kontelis',
  url:         SITE_URL,
  description: 'Agentur aus Köln für barrierefreie WordPress-Websites nach BFSG, Website-Leasing, SEO/GEO und Online-Marketing. Kurze Wege, Antwort in 24 Stunden.',
  ogImage:     'images/og-image-website.png',
  foundingYear: 2005,
  contact: {
    email:        'mail@dk-dk.de',
    /* Calendly wird NICHT eingebettet, sondern verlinkt. Ein iframe
       laedt Skripte und uebertraegt die IP des Besuchers, bevor er
       zugestimmt hat — das waere nach § 25 TDDDG einwilligungs-
       pflichtig und widerspraeche unserer eigenen Regel „kein Aufruf
       an einen Dritten vor der Zustimmung". Als Link entscheidet der
       Besucher selbst, und es faellt nichts an, was er nicht wollte. */
    calendly:     'https://calendly.com/agentur-dk-follow-up/unverbindliches-erstgesprach',
    phone:        '+4922198655229',
    phoneDisplay: '+49 221 986 55 229',
    phoneSchema:  '+49-221-986-55-229',
    addressLine1: 'Sachsenring 57',
    postalCode:   '50677',
    addressLine2: 'D-50677 Köln',
    city:         'Köln',
    region:       'Nordrhein-Westfalen',
    country:      'DE',
    latitude:     50.9286,
    longitude:    6.9604,
    hours:        'Mo–Fr 9–18 Uhr',
    linkedin:     'https://www.linkedin.com/in/daniel-kontelis/',
  },
} as const;

export interface NavItem {
  href:      string;
  label:     string;
  external?: boolean;
}

/*
 * Seitenregister — Quelle für Sitemap, llms.txt und Breadcrumbs.
 * `priority`/`changefreq` steuern die Sitemap, `parent` den Breadcrumb-Pfad,
 * `summary` die llms.txt-Zeile.
 */
export interface PageEntry {
  slug:       string;
  label:      string;
  summary:    string;
  priority:   number;
  changefreq: 'weekly' | 'monthly' | 'yearly';
  parent?:    string;
  /** Aus Sitemap und Index ausgeschlossen (nur 404). */
  noindex?:   boolean;
}

export const pages: PageEntry[] = [
  { slug: '',      label: 'Startseite',  priority: 1.0, changefreq: 'weekly',
    summary: 'Überblick über alle Leistungen: Website-Leasing, barrierefreie WordPress-Entwicklung, SEO/GEO, Online-Marketing.' },

  { slug: 'beratung', label: 'Kostenfreies Erstgespräch', priority: 0.95, changefreq: 'monthly',
    summary: 'Kostenfreies, unverbindliches Erstgespräch: in fünf Klicks das Anliegen schildern, danach Termin wählen oder Rückruf anfordern.' },

  { slug: 'leistungen', label: 'Leistungen', priority: 0.9, changefreq: 'monthly',
    summary: 'Alle Leistungen im Überblick mit Einstieg in die jeweiligen Detailseiten.' },

  { slug: 'bfsg-wordpress-website-agentur', label: 'BFSG & Barrierefreiheit',
    priority: 0.9, changefreq: 'monthly', parent: 'leistungen',
    summary: 'BFSG-konforme WordPress-Websites nach EN 301 549 / WCAG 2.2 AA: Audit, Umsetzung, Barrierefreiheitserklärung. Mit kostenlosem Selbstcheck.' },

  { slug: 'wordpress-entwicklung', label: 'WordPress-Entwicklung',
    priority: 0.8, changefreq: 'monthly', parent: 'leistungen',
    summary: 'WordPress-Relaunch, Neuentwicklung, WooCommerce und Core-Web-Vitals-Optimierung.' },

  { slug: 'website-leasing', label: 'Website-Leasing',
    priority: 0.8, changefreq: 'monthly', parent: 'leistungen',
    summary: 'Professionelle Website zur monatlichen Rate statt hoher Einmalkosten — inklusive Wartung, Hosting und Support.' },

  { slug: 'seo-geo', label: 'SEO & GEO',
    priority: 0.8, changefreq: 'monthly', parent: 'leistungen',
    summary: 'Technisches SEO, Content-Optimierung und Generative Engine Optimization für ChatGPT, Claude, Gemini und Perplexity.' },

  { slug: 'online-marketing', label: 'Online-Marketing',
    priority: 0.8, changefreq: 'monthly', parent: 'leistungen',
    summary: 'Google Ads, Meta- und LinkedIn-Kampagnen, Content- und E-Mail-Marketing mit messbarem ROAS.' },

  { slug: 'social-recruiting', label: 'Social Recruiting',
    priority: 0.7, changefreq: 'monthly', parent: 'leistungen',
    summary: 'Fachkräftegewinnung über LinkedIn und Meta mit KI-gestützter Zielgruppenansprache.' },

  { slug: 'corporate-design', label: 'Corporate Design',
    priority: 0.7, changefreq: 'monthly', parent: 'leistungen',
    summary: 'Logo-Entwicklung, Brand Identity, Design-Manuals und Gestaltungsvorlagen für Print und Digital.' },

  { slug: 'ki-services', label: 'KI-Services',
    priority: 0.7, changefreq: 'monthly', parent: 'leistungen',
    summary: 'KI-Telefon-Agenten mit 24/7-Erreichbarkeit, automatisierte Terminbuchung und KI-gestützte Textoptimierung.' },

  { slug: 'projekte', label: 'Referenzen & Projekte', priority: 0.8, changefreq: 'monthly',
    summary: 'Ausgewählte Projekte für Bundesministerium, TARGOBANK, Berufsförderungswerke und Mittelstand.' },

  { slug: 'jobs', label: 'Jobs', priority: 0.7, changefreq: 'monthly',
    summary: 'Arbeiten bei agentur dk in der Kölner Südstadt: fünf Menschen, kurze Wege, ganze Projekte. Offene Stellen und Bewerbung.' },

  { slug: 'marken', label: 'Unsere Marken', priority: 0.8, changefreq: 'monthly',
    summary: 'Eigene Marken der agentur dk: DU BIST GRIECHE seit 2015 und aposocial seit 2021 — Markenkern, Bausteine und Aufbau.' },

  { slug: 'ueber-uns', label: 'Über uns', priority: 0.8, changefreq: 'monthly',
    summary: 'Agentur aus Köln mit kurzen Wegen — Arbeitsweise, Haltung und Team hinter agentur dk.' },

  { slug: 'barrierefreiheit', label: 'Barrierefreiheitserklärung', priority: 0.5, changefreq: 'yearly',
    summary: 'Erklärung zur Barrierefreiheit nach BFSG/BGG inklusive Konformitätsstatus und Feedback-Kontakt.' },

  { slug: 'impressum', label: 'Impressum', priority: 0.3, changefreq: 'yearly',
    summary: 'Pflichtangaben nach § 5 DDG.' },

  { slug: 'datenschutz', label: 'Datenschutz', priority: 0.3, changefreq: 'yearly',
    summary: 'Datenschutzerklärung nach DSGVO: Hosting, Kontaktformular, Consent-Management.' },

  { slug: '404', label: 'Seite nicht gefunden', priority: 0.0, changefreq: 'yearly',
    noindex: true, summary: '' },

  /* Die beiden Zielseiten des Formulars ohne JavaScript. `noindex`, weil sie
     nur nach einer abgeschickten Anfrage einen Sinn haben — im Suchergebnis
     wären sie eine Sackgasse. */
  { slug: 'danke', label: 'Danke für Ihre Anfrage', priority: 0.0, changefreq: 'yearly',
    noindex: true, summary: '' },

  { slug: 'formular-fehler', label: 'Anfrage konnte nicht gesendet werden',
    priority: 0.0, changefreq: 'yearly', noindex: true, summary: '' },
];

/** Alle indexierbaren Seiten — Basis für Sitemap und llms.txt. */
export const indexablePages = pages.filter((p) => !p.noindex);

/** Seiteneintrag zu einem Slug, oder undefined. */
export const pageBySlug = (slug: string): PageEntry | undefined =>
  pages.find((p) => p.slug === slug);

/** Leistungen-Untermenü (Header + Footer) — abgeleitet aus dem Seitenregister. */
export const leistungenNav: NavItem[] = pages
  .filter((p) => p.parent === 'leistungen')
  .map((p) => ({ href: p.slug, label: p.label }));

export const footerLeistungenNav: NavItem[] = [
  { href: 'leistungen', label: 'Alle Leistungen' },
  ...leistungenNav,
];

export const footerUnternehmenNav: NavItem[] = [
  { href: 'ueber-uns',        label: 'Über uns'                   },
  { href: 'marken',           label: 'Unsere Marken'              },
  { href: 'jobs',             label: 'Jobs'                       },
  { href: 'projekte',         label: 'Referenzen & Projekte'      },
  { href: 'barrierefreiheit', label: 'Barrierefreiheitserklärung' },
  { href: 'impressum',        label: 'Impressum'                  },
  { href: 'datenschutz',      label: 'Datenschutz'                },
];

export const footerLegalNav: NavItem[] = [
  { href: 'impressum',        label: 'Impressum'       },
  { href: 'datenschutz',      label: 'Datenschutz'     },
  { href: 'barrierefreiheit', label: 'Barrierefreiheit'},
];
