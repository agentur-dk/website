export type BfsgAnswer = 'ja' | 'nein';

export interface BfsgAnswers {
  q1: BfsgAnswer | null;
  q2: BfsgAnswer | null;
  q3: BfsgAnswer | null;
  q4: BfsgAnswer | null;
}

export type BfsgResultPath = 'nicht_betroffen' | 'kleinstunternehmen' | 'betroffen';

export interface BfsgResult {
  path: BfsgResultPath;
  title: string;
  text: string;
}

export interface BfsgQuestion {
  id: string;
  text: string;
  footnoteIndex?: number;
}

export const QUESTIONS: BfsgQuestion[] = [
  { id: 'q1', text: 'Erbringen Sie Dienstleistungen?', footnoteIndex: 1 },
  { id: 'q2', text: 'Haben Sie 10 oder mehr Mitarbeiter?' },
  { id: 'q3', text: 'Über 2 Mio. Euro Jahresumsatz oder Bilanzsumme?' },
  { id: 'q4', text: 'Bieten Sie Produkte wie Webshops, E-Books oder Terminals an?' },
];

export const FOOTNOTES: string[] = [
  'Dienstleistungssektor: Die gesetzlichen Vorgaben für Dienstleistungen sind in § 1 Abs. 3 BFSG verankert.',
  'B2C vs. B2B Fokus: Laut § 1 Abs. 3 BFSG sind im Dienstleistungsbereich (inklusive E-Commerce) primär Angebote für Verbraucher (§ 13 BGB) betroffen. Um nicht unter das Gesetz zu fallen, muss eine klare Ausrichtung auf Geschäftskunden (§ 14 BGB) und der Ausschluss von Privatpersonen zweifelsfrei erkennbar sein.',
  'E-Commerce Definition: Dienstleistungen im elektronischen Geschäftsverkehr gemäß § 1 Abs. 3 Nr. 5 BFSG umfassen laut § 2 Nr. 26 BFSG alle Plattformen, Apps und Webshops, über die Verträge wie Käufe oder Buchungen unmittelbar online abgeschlossen werden können.',
  'Individuelle Anfragen & Buchungen: Die Definition erstreckt sich nach § 2 Nr. 26 BFSG auch auf digitale Services zur Vorbereitung von Verträgen, wie etwa Online-Terminreservierungen. Während rein informative Seiten meist ausgenommen sind, fallen geschäftliche B2C-Webseiten mit interaktiven Buchungstools in der Regel unter diese Kriterien.',
  'Ausnahme für Kleinstunternehmen: Unternehmen mit weniger als 10 Mitarbeitern und einem Jahresumsatz bzw. einer Bilanzsumme von maximal 2 Mio. Euro sind im Dienstleistungsbereich (z. B. Onlineshop-Betrieb) gemäß § 3 Abs. 3 BFSG von den Verpflichtungen befreit. Die Personalstärke wird dabei in Jahresarbeitseinheiten berechnet.',
  'Sonderregelungen & Fristen: Es existieren Ausnahmen für statische Archive oder Kartendienste (§ 1 Abs. 4 BFSG). In Einzelfällen kann eine „unverhältnismäßige Belastung" (§ 17 BFSG) geltend gemacht werden. Für bestimmte Produkte gelten zudem Übergangsfristen nach § 38 BFSG.',
  'Hardware & Produkte: § 1 Abs. 2 BFSG listet betroffene Produktkategorien auf, vorrangig Geräte mit interaktiven Benutzeroberflächen.',
  'E-Books: Elektronische Bücher und die zugehörige Lese-Software fallen unter § 1 Abs. 3 Nr. 4 BFSG.',
  'Finanzdienstleistungen: Bankservices für Privatkunden sind in § 1 Abs. 3 Nr. 3 BFSG geregelt.',
  'Telekommunikation: Regelungen hierzu finden sich in § 1 Abs. 3 Nr. 1 BFSG.',
  'Personenbeförderung: Elektronische Tickets, Apps und Terminals im Verkehrswesen unterliegen § 1 Abs. 3 Nr. 2 BFSG, wobei für kommunale Anbieter teilweise Ausnahmen gelten.',
  'Interaktive Endgeräte: Spezifische Anforderungen für Verbraucherendgeräte sind in § 1 Abs. 2 Nr. 5 BFSG definiert.',
  'Computersysteme: Hardwaresysteme für Universalrechner und deren Betriebssysteme fallen unter § 1 Abs. 2 Nr. 1 BFSG.',
  'Selbstbedienungsterminals: Geldautomaten, Zahlungs- und Fahrausweisautomaten werden in § 1 Abs. 2 Nr. 2 BFSG präzisiert.',
  'Medien- & Kommunikationsgeräte: Endgeräte für Telekommunikation oder audiovisuelle Medien sind durch § 1 Abs. 2 Nr. 3 und 4 BFSG abgedeckt.',
];

export const DISCLAIMER =
  'Der BFSG Check ist ein Test, welcher die wesentlichen Kriterien des Anwendungsbereiches in vereinfachter Form überprüft. Erklärungsbedürftige und unbestimmte Rechtsbegriffe werden für eine bessere Verständlichkeit vereinfacht und reduziert. Rechtlich verbindlich kann das Ergebnis des Selbsttests daher nicht sein.';

export function getResult(answers: BfsgAnswers): BfsgResult {
  if (answers.q1 === 'nein') {
    return {
      path: 'nicht_betroffen',
      title: 'Voraussichtlich nicht betroffen',
      text: 'Da Sie keine Dienstleistungen für Verbraucher erbringen, greift das BFSG für Ihren Bereich wahrscheinlich nicht. Buchen Sie eine Ersteinschätzung zur Sicherheit.',
    };
  }
  if (answers.q2 === 'nein' && answers.q3 === 'nein') {
    return {
      path: 'kleinstunternehmen',
      title: 'Kleinstunternehmen-Regelung',
      text: 'Sie gelten als Kleinstunternehmen (<10 MA und <2 Mio. Umsatz). Diese sind von den meisten Dienstleistungspflichten befreit.',
    };
  }
  return {
    path: 'betroffen',
    title: 'Wahrscheinlich betroffen',
    text: 'Nach Ihren Angaben ist Ihr Unternehmen voraussichtlich vom BFSG betroffen. Ihre Website muss schon seit dem 28. Juni 2025 barrierefrei sein.',
  };
}

export function getFootnotes(): string[] {
  return FOOTNOTES;
}

export function getFootnote(index: number): string {
  return FOOTNOTES[index - 1] ?? '';
}
