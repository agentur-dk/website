import { describe, it, expect } from 'vitest';
import {
  organizationSchema, websiteSchema, breadcrumbSchema,
  faqSchema, serviceSchema, webPageSchema, pageGraph, ORG_ID,
} from './schema';
import { indexablePages, pages, absolute, SITE_URL } from '../config/site.config';
import { faqs } from '../data/faq';

describe('Organization', () => {
  it('trägt eine stabile @id, auf die andere Knoten verweisen können', () => {
    expect(organizationSchema()['@id']).toBe(ORG_ID);
    expect(ORG_ID.startsWith(SITE_URL)).toBe(true);
  });

  it('nennt Adresse, Telefon und Öffnungszeiten vollständig', () => {
    const org = organizationSchema() as any;
    expect(org.address.postalCode).toBe('50677');
    expect(org.address.addressLocality).toBe('Köln');
    expect(org.telephone).toMatch(/^\+49/);
    expect(org.openingHoursSpecification.opens).toBe('09:00');
  });
});

describe('Breadcrumbs', () => {
  it('gibt für die Startseite keinen Pfad aus', () => {
    expect(breadcrumbSchema('')).toBeNull();
  });

  it('führt Leistungsseiten über die Übersichtsseite', () => {
    const crumb = breadcrumbSchema('seo-geo') as any;
    expect(crumb.itemListElement.map((i: any) => i.name))
      .toEqual(['Startseite', 'Leistungen', 'SEO & GEO']);
  });

  it('nummeriert die Positionen lückenlos ab 1', () => {
    for (const p of indexablePages.filter((p) => p.slug !== '')) {
      const crumb = breadcrumbSchema(p.slug) as any;
      const positions = crumb.itemListElement.map((i: any) => i.position);
      expect(positions).toEqual(positions.map((_: unknown, i: number) => i + 1));
    }
  });

  it('verlinkt jede Station absolut', () => {
    const crumb = breadcrumbSchema('impressum') as any;
    for (const item of crumb.itemListElement) {
      expect(item.item.startsWith('https://')).toBe(true);
    }
  });
});

describe('FAQPage', () => {
  it('entsteht nur für Seiten mit FAQ-Daten', () => {
    expect(faqSchema('impressum')).toBeNull();
    expect(faqSchema('seo-geo')).not.toBeNull();
  });

  it('übernimmt Fragen und Antworten unverändert', () => {
    const schema = faqSchema('seo-geo') as any;
    /* Der Schlüssel existiert — der Typ weiss das nicht, seit jeder
       Indexzugriff als moeglicherweise leer gilt. Im Test darf das laut sein:
       Fehlt der Eintrag, soll die Prüfung scheitern und nicht stillschweigend
       nichts vergleichen. */
    const source = faqs['seo-geo']!.items;
    expect(schema.mainEntity).toHaveLength(source.length);
    schema.mainEntity.forEach((q: any, i: number) => {
      expect(q.name).toBe(source[i]!.question);
      expect(q.acceptedAnswer.text).toBe(source[i]!.answer);
    });
  });

  it('lässt keine leeren Antworten zu — Google wertet das als Verstoß', () => {
    for (const [slug, set] of Object.entries(faqs)) {
      for (const item of set.items) {
        expect(item.question.length, `${slug}: leere Frage`).toBeGreaterThan(5);
        expect(item.answer.length, `${slug}: leere Antwort`).toBeGreaterThan(20);
      }
    }
  });
});

describe('Service', () => {
  it('verweist über @id auf den Anbieter statt ihn zu wiederholen', () => {
    const svc = serviceSchema('seo-geo', { name: 'SEO', description: 'x' }) as any;
    expect(svc.provider).toEqual({ '@id': ORG_ID });
  });

  it('bildet Teilleistungen als OfferCatalog ab', () => {
    const svc = serviceSchema('seo-geo', {
      name: 'SEO', description: 'x', offers: ['Technisches SEO', 'Lokales SEO'],
    }) as any;
    expect(svc.hasOfferCatalog.itemListElement.map((o: any) => o.itemOffered.name))
      .toEqual(['Technisches SEO', 'Lokales SEO']);
  });
});

describe('Seiten-Graph', () => {
  it('bündelt alle Knoten in einem @graph', () => {
    const g = pageGraph({ slug: 'seo-geo', title: 'T', description: 'D' }) as any;
    expect(g['@context']).toBe('https://schema.org');
    expect(Array.isArray(g['@graph'])).toBe(true);
  });

  it('enthält für jede Seite mindestens Organization, WebSite und WebPage', () => {
    for (const p of pages) {
      const g = pageGraph({ slug: p.slug, title: 'T', description: 'D' }) as any;
      const types = g['@graph'].flatMap((n: any) =>
        Array.isArray(n['@type']) ? n['@type'] : [n['@type']]);
      expect(types, p.slug).toContain('Organization');
      expect(types, p.slug).toContain('WebSite');
      expect(types.some((t: string) =>
        ['WebPage', 'AboutPage', 'CollectionPage', 'ContactPage'].includes(t)), p.slug).toBe(true);
    }
  });

  it('vergibt keine doppelten @id-Werte', () => {
    for (const p of pages) {
      const g = pageGraph({ slug: p.slug, title: 'T', description: 'D' }) as any;
      const ids = g['@graph'].map((n: any) => n['@id']).filter(Boolean);
      expect(new Set(ids).size, p.slug).toBe(ids.length);
    }
  });

  it('lässt jede @id-Referenz auf einen Knoten im selben Graphen zeigen', () => {
    for (const p of pages) {
      const g = pageGraph({
        slug: p.slug, title: 'T', description: 'D',
        service: { name: 'S', description: 'd' },
      }) as any;
      const defined = new Set(g['@graph'].map((n: any) => n['@id']).filter(Boolean));
      const refs: string[] = [];
      const walk = (v: unknown) => {
        if (Array.isArray(v)) return v.forEach(walk);
        if (v && typeof v === 'object') {
          const o = v as Record<string, unknown>;
          const keys = Object.keys(o);
          if (keys.length === 1 && keys[0] === '@id') refs.push(o['@id'] as string);
          else Object.values(o).forEach(walk);
        }
      };
      walk(g['@graph']);
      for (const ref of refs) expect(defined.has(ref), `${p.slug}: ${ref} nicht definiert`).toBe(true);
    }
  });
});

describe('WebPage', () => {
  it('nutzt die kanonische URL der Seite als @id-Basis', () => {
    const wp = webPageSchema('leistungen', 'T', 'D') as any;
    expect(wp['@id']).toBe(`${absolute('leistungen')}#webpage`);
    expect(wp.url).toBe(absolute('leistungen'));
  });

  it('bindet die Seite an WebSite und Organization', () => {
    const wp = webPageSchema('leistungen', 'T', 'D') as any;
    expect(wp.isPartOf['@id']).toBe(websiteSchema()['@id']);
    expect(wp.about['@id']).toBe(ORG_ID);
  });
});
