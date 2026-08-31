/* ============================================================
   Site-Konfiguration — zentrale Datenquelle.

   Alles, was mehr als einmal auftaucht (Domain, Kontaktdaten,
   Navigation, Seitenregister), steht hier. Sitemap, robots.txt,
   llms.txt, Canonicals, Breadcrumbs und JSON-LD werden daraus
   generiert — so können sie nicht mehr auseinanderlaufen.
   ============================================================ */

/** Absolute Basis-URL ohne Slash am Ende — kommt aus astro.config.mjs. */
export const SITE_URL = (import.meta.env.SITE ?? 'https://dk-dk.de').replace(/\/$/, '');

/** Pfad-Präfix, unter dem die Seite ausgeliefert wird ('/' bei Custom Domain). */
export const BASE_PATH = import.meta.env.BASE_URL ?? '/';

/* ------------------------------------------------------------
   Indexierungssperre
   ------------------------------------------------------------
   Solange die Seite nicht fertig ist, soll sie weder in
   Suchergebnissen auftauchen noch von KI-Systemen eingelesen
   werden. Der Schalter unten wirkt an allen vier Stellen
   gleichzeitig: Meta-Robots, robots.txt, sitemap.xml und llms.txt.

   ZUM LIVE-SCHALTEN: INDEXIERUNG_ERLAUBT auf true setzen.
   Für einen einzelnen Build genügt `SITE_INDEXABLE=true npm run build`.

   Wichtig zum Zusammenspiel: Suchmaschinen dürfen weiterhin
   crawlen. Ein `Disallow: /` würde verhindern, dass Google das
   `noindex` überhaupt zu sehen bekommt — die URL könnte dann
   trotzdem als reiner Link im Index landen, sobald irgendwo
   jemand darauf verweist. Das `noindex` im Seitenkopf ist das
   wirksame Signal, und dafür muss die Seite abrufbar sein.
   KI-Crawler werden dagegen hart ausgesperrt: sie werten kein
   `noindex` aus, für sie zählt nur die robots.txt.
   ------------------------------------------------------------ */
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

/* ------------------------------------------------------------
   Seitenregister — Quelle für Sitemap, llms.txt und Breadcrumbs.
   `priority`/`changefreq` steuern die Sitemap, `parent` den
   Breadcrumb-Pfad, `summary` die llms.txt-Zeile.
   ------------------------------------------------------------ */
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

/** Footer: Leistungen inklusive Übersichtsseite */
export const footerLeistungenNav: NavItem[] = [
  { href: 'leistungen', label: 'Alle Leistungen' },
  ...leistungenNav,
];

/** Footer: Unternehmen */
export const footerUnternehmenNav: NavItem[] = [
  { href: 'ueber-uns',        label: 'Über uns'                   },
  { href: 'projekte',         label: 'Referenzen & Projekte'      },
  { href: 'barrierefreiheit', label: 'Barrierefreiheitserklärung' },
  { href: 'impressum',        label: 'Impressum'                  },
  { href: 'datenschutz',      label: 'Datenschutz'                },
];

/** Footer-Leiste: rechtliche Links */
export const footerLegalNav: NavItem[] = [
  { href: 'impressum',        label: 'Impressum'       },
  { href: 'datenschutz',      label: 'Datenschutz'     },
  { href: 'barrierefreiheit', label: 'Barrierefreiheit'},
];
