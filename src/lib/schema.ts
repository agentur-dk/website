/* ============================================================
   Schema.org-Bausteine (JSON-LD).

   Vorher stand JSON-LD als handgeschriebener String-Block in jeder
   Seite — mit hartkodierten Domains und ohne Verknüpfung zwischen
   den Entitäten. Hier entstehen die Graphen aus der zentralen
   Konfiguration und den FAQ-Daten, sodass Domain, Kontaktdaten und
   Fragetexte nur an einer Stelle gepflegt werden.

   Alle Knoten hängen über @id am Organization-Knoten, damit Google
   und LLM-Parser Seite, Anbieter und Leistung als einen Graphen
   lesen statt als lose Einzelobjekte.
   ============================================================ */
import { siteConfig, absolute, SITE_URL, pageBySlug, type PageEntry } from '../config/site.config';
import { faqFor } from '../data/faq';

type Json = Record<string, unknown>;

export const ORG_ID     = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

const { contact } = siteConfig;

/** Anbieter-Knoten: Organization + LocalBusiness in einem. */
export function organizationSchema(): Json {
  return {
    '@type': ['Organization', 'ProfessionalService'],
    '@id': ORG_ID,
    name: siteConfig.legalName,
    alternateName: siteConfig.name,
    url: `${SITE_URL}/`,
    logo: { '@type': 'ImageObject', url: `${SITE_URL}/${siteConfig.ogImage}` },
    image: `${SITE_URL}/${siteConfig.ogImage}`,
    description: siteConfig.description,
    foundingDate: String(siteConfig.foundingYear),
    founder: { '@type': 'Person', name: siteConfig.founder },
    address: {
      '@type': 'PostalAddress',
      streetAddress: contact.addressLine1,
      postalCode: contact.postalCode,
      addressLocality: contact.city,
      addressRegion: contact.region,
      addressCountry: contact.country,
    },
    geo: { '@type': 'GeoCoordinates', latitude: contact.latitude, longitude: contact.longitude },
    telephone: contact.phoneSchema,
    email: contact.email,
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '09:00',
      closes: '18:00',
    },
    areaServed: [
      { '@type': 'City', name: 'Köln' },
      { '@type': 'State', name: 'Nordrhein-Westfalen' },
      { '@type': 'Country', name: 'Deutschland' },
    ],
    knowsAbout: [
      'Barrierefreiheitsstärkungsgesetz (BFSG)',
      'WCAG 2.2 AA', 'EN 301 549', 'WordPress-Entwicklung', 'WooCommerce',
      'Website-Leasing', 'Suchmaschinenoptimierung (SEO)',
      'Generative Engine Optimization (GEO)', 'Core Web Vitals',
      'Social Recruiting', 'Corporate Design',
    ],
    sameAs: [contact.linkedin],
  };
}

/** Website-Knoten. */
export function websiteSchema(): Json {
  return {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    url: `${SITE_URL}/`,
    name: siteConfig.name,
    inLanguage: 'de-DE',
    publisher: { '@id': ORG_ID },
  };
}

/** Breadcrumb-Pfad aus dem Seitenregister (Start › [Eltern] › Seite). */
export function breadcrumbSchema(slug: string): Json | null {
  const page = pageBySlug(slug);
  if (!page || page.slug === '') return null;

  const trail: PageEntry[] = [];
  if (page.parent) {
    const parent = pageBySlug(page.parent);
    if (parent) trail.push(parent);
  }
  trail.push(page);

  return {
    '@type': 'BreadcrumbList',
    '@id': `${absolute(slug)}#breadcrumb`,
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Startseite', item: `${SITE_URL}/` },
      ...trail.map((p, i) => ({
        '@type': 'ListItem',
        position: i + 2,
        name: p.label,
        item: absolute(p.slug),
      })),
    ],
  };
}

/** FAQPage-Knoten aus den zentralen FAQ-Daten — nur wenn die Seite FAQs zeigt. */
export function faqSchema(slug: string): Json | null {
  const set = faqFor(slug);
  if (!set?.items.length) return null;

  return {
    '@type': 'FAQPage',
    '@id': `${absolute(slug)}#faq`,
    mainEntity: set.items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };
}

export interface ServiceInfo {
  name:        string;
  description: string;
  serviceType?: string;
  /** Sichtbare Teilleistungen — landen als OfferCatalog im Graphen. */
  offers?:     string[];
}

/** Service-Knoten einer Leistungsseite, verknüpft mit dem Anbieter. */
export function serviceSchema(slug: string, info: ServiceInfo): Json {
  return {
    '@type': 'Service',
    '@id': `${absolute(slug)}#service`,
    name: info.name,
    description: info.description,
    serviceType: info.serviceType ?? info.name,
    url: absolute(slug),
    provider: { '@id': ORG_ID },
    areaServed: [
      { '@type': 'City', name: 'Köln' },
      { '@type': 'Country', name: 'Deutschland' },
    ],
    ...(info.offers?.length
      ? {
          hasOfferCatalog: {
            '@type': 'OfferCatalog',
            name: info.name,
            itemListElement: info.offers.map((o) => ({
              '@type': 'Offer',
              itemOffered: { '@type': 'Service', name: o },
            })),
          },
        }
      : {}),
  };
}

/** WebPage-Knoten, der Seite, Website und Anbieter zusammenbindet. */
export function webPageSchema(
  slug: string,
  title: string,
  description: string,
  pageType: 'WebPage' | 'AboutPage' | 'CollectionPage' | 'ContactPage' = 'WebPage',
): Json {
  return {
    '@type': pageType,
    '@id': `${absolute(slug)}#webpage`,
    url: absolute(slug),
    name: title,
    description,
    inLanguage: 'de-DE',
    isPartOf: { '@id': WEBSITE_ID },
    about: { '@id': ORG_ID },
    ...(pageBySlug(slug)?.slug ? { breadcrumb: { '@id': `${absolute(slug)}#breadcrumb` } } : {}),
  };
}

/**
 * Kompletter Graph einer Seite. Ein einziges <script> mit @graph statt
 * mehrerer loser Blöcke — so erkennen Parser die Beziehungen.
 */
export function pageGraph(opts: {
  slug: string;
  title: string;
  description: string;
  pageType?: 'WebPage' | 'AboutPage' | 'CollectionPage' | 'ContactPage';
  service?: ServiceInfo;
  extra?: Json[];
}): Json {
  const nodes: Json[] = [organizationSchema(), websiteSchema(),
    webPageSchema(opts.slug, opts.title, opts.description, opts.pageType)];

  const crumbs = breadcrumbSchema(opts.slug);
  if (crumbs) nodes.push(crumbs);

  const faq = faqSchema(opts.slug);
  if (faq) nodes.push(faq);

  if (opts.service) nodes.push(serviceSchema(opts.slug, opts.service));
  if (opts.extra?.length) nodes.push(...opts.extra);

  return { '@context': 'https://schema.org', '@graph': nodes };
}
