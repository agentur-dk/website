export interface QuizService {
  title: string;
  href: string;
  blurb: string;
  formValue: string;
}

export interface QuizStep1Option {
  key: string;
  label: string;
}

export interface QuizStep2Option {
  key: string;
  label: string;
}

export interface QuizStep2Config {
  question: string;
  options: QuizStep2Option[];
}

export const SERVICES: Record<string, QuizService> = {
  mehr_umsatz: {
    title: 'Online-Marketing',
    href: 'online-marketing',
    blurb: 'Kampagnen, Ads & Conversion-Optimierung – für mehr Anfragen und messbaren Umsatz.',
    formValue: 'Online-Marketing',
  },
  mitarbeiter: {
    title: 'Social Recruiting',
    href: 'social-recruiting',
    blurb: 'Zielgruppengenau neue Mitarbeiter finden – auf den Plattformen, wo sie wirklich sind.',
    formValue: 'Social Recruiting',
  },
  bfsg: {
    title: 'BFSG & Barrierefreiheit',
    href: 'bfsg-wordpress-website-agentur',
    blurb: 'Rechtssichere digitale Barrierefreiheit nach WCAG 2.2 & EN 301 549 – bis zur BFSG-Deadline.',
    formValue: 'Barrierefreie Website (BFSG)',
  },
  sichtbarkeit: {
    title: 'SEO & GEO',
    href: 'seo-geo',
    blurb: 'Besser gefunden werden – in Suchmaschinen und KI-Antworten.',
    formValue: 'SEO & GEO',
  },
  marke: {
    title: 'Corporate Design',
    href: 'corporate-design',
    blurb: 'Markenauftritt, der bleibt und überzeugt – von Logo bis Styleguide.',
    formValue: 'Corporate Design',
  },
};

export const STEP1_OPTIONS: QuizStep1Option[] = [
  { key: 'mehr_umsatz', label: 'Mehr Umsatz & Anfragen' },
  { key: 'mitarbeiter', label: 'Neue Mitarbeiter gewinnen' },
  { key: 'bfsg', label: 'BFSG & Barrierefreiheit' },
  { key: 'sichtbarkeit', label: 'Mehr Sichtbarkeit online' },
  { key: 'marke', label: 'Stärkere Marke aufbauen' },
];

export const STEP2_CONFIG: Record<string, QuizStep2Config> = {
  mehr_umsatz: {
    question: 'Was ist dein Hauptziel?',
    options: [
      { key: 'anfragen', label: 'Mehr Anfragen generieren' },
      { key: 'shop', label: 'Produkte online verkaufen' },
      { key: 'optimieren', label: 'Bestehende Website optimieren' },
    ],
  },
  mitarbeiter: {
    question: 'Wen suchst du?',
    options: [
      { key: 'fachkraefte', label: 'Fachkräfte & Spezialisten' },
      { key: 'nachwuchs', label: 'Azubis & Nachwuchs' },
      { key: 'mehrere', label: 'Mehrere Stellen gleichzeitig' },
    ],
  },
  sichtbarkeit: {
    question: 'Wo möchtest du sichtbarer werden?',
    options: [
      { key: 'seo', label: 'Google & Suchmaschinen (SEO)' },
      { key: 'geo', label: 'KI-Suchen & AI-Antworten (GEO)' },
      { key: 'beides', label: 'Überall – beides gleichzeitig' },
    ],
  },
};

export function getService(topicKey: string): QuizService | null {
  return SERVICES[topicKey] ?? null;
}

export function getStep2Config(topicKey: string): QuizStep2Config | null {
  return STEP2_CONFIG[topicKey] ?? null;
}

export function hasStep2(topicKey: string): boolean {
  return topicKey in STEP2_CONFIG;
}
