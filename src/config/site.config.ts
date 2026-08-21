/* ============================================================
   Site-Konfiguration — zentrale Datenquelle
   Navigations-Arrays ersetzen die hardkodierten Listen
   in Header.astro und Footer.astro.
   ============================================================ */

export const siteConfig = {
  name:        'agentur dk',
  tagline:     'design & kommunikation',
  url:         'https://agentur-dk.github.io',
  description: 'Ihre Agentur in Köln für professionelle WordPress-Websites, Website-Leasing, barrierefreies Webdesign (BFSG), SEO/GEO und Online-Marketing. Persönlich, schnell, professionell.',
  ogImage:     'images/og-image-website.png',
  contact: {
    email:        'mail@dk-dk.de',
    phone:        '+4922198655229',
    phoneDisplay: '+49 221 986 55 229',
    addressLine1: 'Sachsenring 57',
    addressLine2: 'D-50677 Köln',
    city:         'Köln',
    hours:        'Mo–Fr 9–18 Uhr',
    linkedin:     'https://www.linkedin.com/in/daniel-kontelis/',
  },
} as const;

export interface NavItem {
  href:      string;
  label:     string;
  external?: boolean;
}

/** Leistungen-Untermenü (Header + Footer) */
export const leistungenNav: NavItem[] = [
  { href: 'bfsg-wordpress-website-agentur', label: 'BFSG & Barrierefreiheit' },
  { href: 'wordpress-entwicklung',          label: 'WordPress-Entwicklung'   },
  { href: 'website-leasing',               label: 'Website-Leasing'          },
  { href: 'seo-geo',                       label: 'SEO & GEO'               },
  { href: 'online-marketing',              label: 'Online-Marketing'         },
  { href: 'social-recruiting',             label: 'Social Recruiting'        },
  { href: 'corporate-design',              label: 'Corporate Design'         },
  { href: 'ki-services',                   label: 'KI-Services'              },
];

/** Footer: Leistungen inklusive Übersichtsseite */
export const footerLeistungenNav: NavItem[] = [
  { href: 'leistungen', label: 'Alle Leistungen' },
  ...leistungenNav,
];

/** Footer: Unternehmen */
export const footerUnternehmenNav: NavItem[] = [
  { href: 'ueber-uns',        label: 'Über uns'                  },
  { href: 'projekte',         label: 'Referenzen & Projekte'     },
  { href: 'barrierefreiheit', label: 'Barrierefreiheitserklärung'},
  { href: 'impressum',        label: 'Impressum'                 },
  { href: 'datenschutz',      label: 'Datenschutz'               },
];

/** Footer-Leiste: rechtliche Links */
export const footerLegalNav: NavItem[] = [
  { href: 'impressum',        label: 'Impressum'      },
  { href: 'datenschutz',      label: 'Datenschutz'    },
  { href: 'barrierefreiheit', label: 'Barrierefreiheit'},
];
