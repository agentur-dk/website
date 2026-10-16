/**
 * Die Leistungen, wie sie Startseite und Leistungsübersicht als Verzeichnis
 * zeigen. Eine Liste für beide, damit keine Seite eine Leistung vergisst.
 *
 * `datei` ist zugleich der Schlüssel, über den der Leistungs-Check die
 * passende Zeile findet: Er verweist auf dieselbe Datei (src/lib/quiz.ts).
 */
export interface Leistung {
  datei: string;
  titel: string;
  text: string;
  neu?: boolean;
}

export const leistungen: Leistung[] = [
  { datei: 'website-leasing.html', titel: 'Website-Leasing', neu: true,
    text: 'Professionelle Website ohne hohe Einmalkosten: monatliche Flatrate, Wartung und Hosting auf Wunsch inklusive.' },
  { datei: 'bfsg-wordpress-website-agentur.html', titel: 'Barrierefreie Websites (BFSG)',
    text: 'BFSG- und WCAG-konform, von der Prüfung bis zur Konformitätserklärung. Keine rechtlichen Risiken, sondern echte Zugänglichkeit.' },
  { datei: 'wordpress-entwicklung.html', titel: 'WordPress-Entwicklung',
    text: 'Sauberer Code, schnelle Ladezeiten und eine Website, die Ihr Team ohne technisches Vorwissen selbst pflegt.' },
  { datei: 'seo-geo.html', titel: 'SEO & GEO',
    text: 'Suchmaschinenoptimierung und Generative Engine Optimization: gefunden werden bei Google und in Antworten von ChatGPT, Gemini und Co.' },
  { datei: 'online-marketing.html', titel: 'Online-Marketing',
    text: 'Content, Social Media und E-Mail-Kampagnen, die Ihre Zielgruppe dort erreichen, wo sie sich aufhält. Messbar.' },
  { datei: 'corporate-design.html', titel: 'Corporate Design',
    text: 'Logo, Farbwelt und Designsystem für einen Auftritt, der auf allen Kanälen gleich aussieht.' },
  { datei: 'ki-services.html', titel: 'KI-Services',
    text: 'Content-Produktion, Prozessautomatisierung und Telefon-Agenten: KI dort, wo sie messbar entlastet.' },
  { datei: 'social-recruiting.html', titel: 'Social Recruiting',
    text: 'Fachkräfte über LinkedIn, Meta und Co. gezielt ansprechen, statt auf Bewerbungen zu warten.' },
];
