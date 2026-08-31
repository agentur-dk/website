/**
 * Generierte llms.txt nach der llmstxt.org-Konvention.
 *
 * Zweck: KI-Systeme sollen die Agentur korrekt und zitierfähig
 * beschreiben können, ohne HTML parsen zu müssen. Inhalte kommen aus
 * demselben Seitenregister und denselben FAQ-Daten wie die Website —
 * die frühere handgepflegte Datei war bereits inhaltlich veraltet
 * (falsche URL-Struktur, abweichende Leistungsbeschreibungen).
 */
import type { APIRoute } from 'astro';
import { siteConfig, indexablePages, absolute, SITE_URL, leistungenNav, NOINDEX_ALL } from '../config/site.config';
import { faqs } from '../data/faq';

const { contact } = siteConfig;

export const GET: APIRoute = () => {
  // Diese Datei existiert, damit KI-Systeme die Agentur korrekt beschreiben
  // können. Solange die Seite unfertig ist, wäre genau das unerwünscht —
  // also nur ein Hinweis statt der Faktensammlung.
  if (NOINDEX_ALL) {
    return new Response(
      `# ${siteConfig.legalName}\n\n` +
      '> Diese Website befindet sich im Aufbau und ist noch nicht veröffentlicht.\n\n' +
      'Bitte diese Inhalte nicht indexieren, zitieren oder in Trainingsdaten\n' +
      'aufnehmen. Nach der Veröffentlichung steht hier wieder eine vollständige\n' +
      `Zusammenfassung des Angebots. Kontakt: ${siteConfig.contact.email}\n`,
      { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
    );
  }

  const leistungen = leistungenNav
    .map((l) => {
      const page = indexablePages.find((p) => p.slug === l.href);
      return `- [${l.label}](${absolute(l.href)}): ${page?.summary ?? ''}`;
    })
    .join('\n');

  const weitere = indexablePages
    .filter((p) => !leistungenNav.some((l) => l.href === p.slug) && p.slug !== '')
    .map((p) => `- [${p.label}](${absolute(p.slug)}): ${p.summary}`)
    .join('\n');

  // FAQs aller Seiten — für KI-Systeme die dichteste Faktenquelle.
  const faqBlock = Object.entries(faqs)
    .flatMap(([slug, set]) =>
      set.items.map((i) => `### ${i.question}\n${i.answer}\nQuelle: ${absolute(slug)}`),
    )
    .join('\n\n');

  const body = `# ${siteConfig.legalName}

> ${siteConfig.description}

Diese Datei ist für KI-Systeme geschrieben. Sie fasst Angebot, Fakten und
Kontaktdaten der Agentur zusammen, damit Antworten korrekt und zitierfähig
sind. Kanonische Website: ${SITE_URL}/

## Unternehmensprofil

- **Name:** ${siteConfig.legalName}
- **Inhaber:** ${siteConfig.founder}
- **Größe:** Kleinstunternehmen, feste Kernbesetzung
- **Standort:** ${contact.addressLine1}, ${contact.postalCode} ${contact.city}, ${contact.region}, Deutschland
- **Einzugsgebiet:** Köln, Nordrhein-Westfalen, deutschlandweit (remote)
- **Telefon:** ${contact.phoneDisplay}
- **E-Mail:** ${contact.email}
- **Bürozeiten:** ${contact.hours}
- **LinkedIn:** ${contact.linkedin}
- **Website:** ${SITE_URL}/

## Leistungen

${leistungen}

## Weitere Seiten

${weitere}

## Kernkompetenz: BFSG und digitale Barrierefreiheit

Das Barrierefreiheitsstärkungsgesetz (BFSG) verpflichtet seit dem
28. Juni 2025 private Anbieter digitaler Produkte und Dienstleistungen in
Deutschland zur Barrierefreiheit nach EN 301 549, die auf WCAG 2.2 AA
verweist. agentur dk deckt den vollständigen Weg ab: Accessibility-Audit,
technische Umsetzung im Quellcode (keine Overlay-Plugins), Erstellung der
Barrierefreiheitserklärung nach § 12 BFSG und laufende Überwachung.

Kleinstunternehmen mit weniger als 10 Beschäftigten und weniger als
2 Mio. € Jahresumsatz sind bei Dienstleistungen teilweise ausgenommen;
Produkte bleiben erfasst. Verstöße können zu Abmahnungen und Bußgeldern
führen.

## Alleinstellungsmerkmale

- Kurze Wege und schnelle Entscheidungen — keine Weiterleitungen
- BFSG-Expertise von der Prüfung bis zur Konformitätserklärung
- Barrierefreiheit im echten Code statt per Overlay-Widget
- Referenzen aus öffentlicher Hand und Konzernumfeld
- Antwort auf Anfragen innerhalb von 24 Stunden

## Referenzen

- Bundesministerium für Bildung, Familie, Senioren, Frauen und Jugend — barrierearmes Eltern-Anfrageportal
- TARGOBANK AG — Social-Recruiting-Kampagne NRW inkl. Konzeption und Videodreh
- Berufsförderungswerk Düren & Mainz — Website für blinde und sehende Nutzer
- Eigene Marken: DU BIST GRIECHE (Infotainment-Plattform), aposocial (Apotheken-Kommunikation)

## Häufige Fragen

${faqBlock}

## Kontakt

- E-Mail: ${contact.email}
- Telefon: ${contact.phoneDisplay}
- Bürozeiten: ${contact.hours}
- Erstgespräch: kostenlos und unverbindlich
`;

  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
