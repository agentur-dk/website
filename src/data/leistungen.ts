/**
 * Die Leistungen, wie sie die Leistungsübersicht und die Verweise der
 * Unterseiten zeigen. Eine Liste für alle, damit keine Seite eine
 * Leistung vergisst.
 *
 * `feld` ordnet jede Leistung einem der drei Felder zu, nach denen die
 * Übersicht gliedert: Wer Sie sucht, soll Sie finden (auftritt); wer Sie
 * nicht kennt, soll Sie sehen (reichweite); was liegen bleibt, nimmt
 * Ihnen jemand ab (entlastung).
 */
export type Feld = 'auftritt' | 'reichweite' | 'entlastung';

export interface Leistung {
  datei: string;
  titel: string;
  text: string;
  feld: Feld;
  neu?: boolean;
}

export const leistungen: Leistung[] = [
  { datei: 'website-leasing.html', feld: 'auftritt', titel: 'Website-Leasing', neu: true,
    text: 'Professionelle Website ohne hohe Einmalkosten: monatliche Flatrate, Wartung und Hosting auf Wunsch inklusive.' },
  { datei: 'bfsg-wordpress-website-agentur.html', feld: 'auftritt', titel: 'Barrierefreie Websites (BFSG)',
    text: 'BFSG- und WCAG-konform, von der Prüfung bis zur Konformitätserklärung, damit Ihre Seite für alle funktioniert.' },
  { datei: 'wordpress-entwicklung.html', feld: 'auftritt', titel: 'WordPress-Entwicklung',
    text: 'Sauberer Code, schnelle Ladezeiten und eine Website, die Ihr Team ohne technisches Vorwissen selbst pflegt.' },
  { datei: 'seo-geo.html', feld: 'auftritt', titel: 'SEO & GEO',
    text: 'Suchmaschinenoptimierung und Generative Engine Optimization: gefunden werden bei Google und in Antworten von ChatGPT, Gemini und Co.' },
  { datei: 'online-marketing.html', feld: 'reichweite', titel: 'Online-Marketing',
    text: 'Content, Social Media und E-Mail-Kampagnen, die Ihre Zielgruppe dort erreichen, wo sie sich aufhält. Messbar.' },
  { datei: 'corporate-design.html', feld: 'auftritt', titel: 'Corporate Design',
    text: 'Logo, Farbwelt und Designsystem für einen Auftritt, der auf allen Kanälen gleich aussieht.' },
  { datei: 'ki-services.html', feld: 'entlastung', titel: 'KI-Services',
    text: 'Content-Produktion, Prozessautomatisierung und Telefon-Agenten: KI dort, wo sie messbar entlastet.' },
  { datei: 'social-recruiting.html', feld: 'reichweite', titel: 'Social Recruiting',
    text: 'Fachkräfte über LinkedIn, Meta und Co. gezielt ansprechen, statt auf Bewerbungen zu warten.' },
];
