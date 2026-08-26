/* ============================================================
   FAQ-Inhalte — eine Quelle für drei Ausgaben.

   Dieselben Einträge speisen (1) das sichtbare Accordion,
   (2) das FAQPage-JSON-LD und (3) llms.txt. Vorher lagen die
   Fragen nur im Markup: die acht Leistungsseiten hatten
   sichtbare FAQs ganz ohne strukturierte Daten, und Schema und
   Text konnten auseinanderlaufen — was Google als Mismatch wertet.
   ============================================================ */

export interface FaqItem {
  question: string;
  answer:   string;
}

export interface FaqSet {
  heading: string;
  items:   FaqItem[];
}

/** FAQ-Sets je Seiten-Slug ('' = Startseite). */
export const faqs: Record<string, FaqSet> = {
  '': {
    heading: 'Häufige Fragen',
    items: [
      {
        question: 'Was ist Website-Leasing und für wen lohnt es sich?',
        answer:   'Beim Website-Leasing erhalten Sie eine professionell entwickelte WordPress-Website gegen eine feste monatliche Rate — ohne hohe Einmalinvestition. Das Modell eignet sich besonders für Unternehmen, die schnell einen hochwertigen Webauftritt benötigen, aber keine große Anfangsinvestition tätigen möchten. Wartung und Hosting sind auf Wunsch inklusive.',
      },
      {
        question: 'Was kostet eine professionelle WordPress-Website?',
        answer:   'Je nach Umfang und bestehendem System beginnen WordPress-Projekte bei ca. 2.500 €. Alternativ bieten wir Website-Leasing ab einer monatlichen Rate an — ohne Einmalkosten. Für größere Relaunches mit Design, Entwicklung und BFSG-Konformitätserklärung kalkulieren wir individuell. Wir erstellen Ihnen ein transparentes Festpreisangebot.',
      },
      {
        question: 'Wie lange dauert ein WordPress-Relaunch?',
        answer:   'Typische Projekte dauern 4–8 Wochen – abhängig von Seitenanzahl, Funktionsumfang und der Verfügbarkeit von Inhalten. Dank flacher Hierarchien und direkter Kommunikation halten wir Zeitpläne zuverlässig ein.',
      },
      {
        question: 'Bieten Sie auch laufende Betreuung an?',
        answer:   'Ja, wir bieten flexible Wartungs- und Support-Pakete an: von monatlichen Updates und Sicherheits-Patches bis hin zu laufendem SEO und Content-Pflege. So bleibt Ihre Website dauerhaft performant, sicher und BFSG-konform.',
      },
      {
        question: 'Was ist GEO (Generative Engine Optimization)?',
        answer:   'GEO bezeichnet die Optimierung von Inhalten für KI-Systeme wie ChatGPT, Google Gemini oder Perplexity, damit Ihr Unternehmen in KI-generierten Antworten sichtbar wird. Dies ergänzt klassisches SEO und sichert Ihnen Reichweite im Zeitalter der generativen Suche.',
      },
      {
        question: 'Was ist das BFSG und gilt es für uns?',
        answer:   'Das BFSG (Barrierefreiheitsstärkungsgesetz) verpflichtet ab dem 28. Juni 2025 Anbieter privater Websites und digitaler Produkte zur Barrierefreiheit gemäß EN 301 549. Es gilt für Unternehmen mit mehr als 10 Mitarbeitenden oder einem Jahresumsatz über 2 Mio. €, die Verbrauchern digitale Dienstleistungen anbieten. Wir prüfen kostenlos, ob Ihre Website betroffen ist.',
      },
      {
        question: 'Können Sie auch bestehende Websites prüfen?',
        answer:   'Ja, wir führen Accessibility-Audits durch und prüfen Ihre bestehende Website auf BFSG-Konformität, technische SEO-Fehler und Conversion-Potenziale. Sie erhalten einen priorisierten Maßnahmenplan mit konkreten Handlungsempfehlungen.',
      },
    ],
  },
  'leistungen': {
    heading: 'Häufige Fragen zur Zusammenarbeit',
    items: [
      {
        question: 'Muss ich mich für eine einzelne Leistung entscheiden?',
        answer:   'Nein. Die meisten Projekte kombinieren mehrere Bereiche — etwa eine barrierefreie WordPress-Website mit anschließender SEO- und GEO-Betreuung. Weil alles aus einer Hand kommt, entfällt die Abstimmung zwischen mehreren Dienstleistern.',
      },
      {
        question: 'Kann ich eine bestehende Website prüfen lassen, ohne gleich einen Auftrag zu erteilen?',
        answer:   'Ja. Wir führen Accessibility-Audits und technische SEO-Analysen auch als eigenständige Leistung durch. Sie erhalten einen priorisierten Maßnahmenplan und entscheiden anschließend, was Sie selbst umsetzen und was wir übernehmen.',
      },
      {
        question: 'Was unterscheidet Website-Leasing von einem klassischen Projekt?',
        answer:   'Beim klassischen Projekt zahlen Sie die Entwicklung einmalig, beim Leasing eine feste monatliche Rate inklusive Wartung, Hosting und laufender Optimierung. Inhaltlich und technisch unterscheiden sich die Ergebnisse nicht — es ist eine Frage der Finanzierung und der laufenden Betreuung.',
      },
      {
        question: 'Arbeiten Sie nur mit Kunden aus Köln?',
        answer:   'Der Standort ist Köln, gearbeitet wird deutschlandweit. Abstimmungen laufen remote, Vor-Ort-Termine sind im Rheinland unkompliziert möglich. Referenzen reichen von Kölner Mittelständlern bis zu Bundesministerien.',
      },
      {
        question: 'Wie läuft der Erstkontakt ab?',
        answer:   'Sie schildern Ihr Vorhaben per Formular, E-Mail oder Telefon. Innerhalb von 24 Stunden erhalten Sie eine Rückmeldung, anschließend folgt ein kostenloses und unverbindliches Erstgespräch. Erst danach entsteht ein konkretes Angebot.',
      },
    ],
  },
  'bfsg-wordpress-website-agentur': {
    heading: 'Häufige Fragen zur BFSG-Konformität',
    items: [
      {
        question: 'Gilt das BFSG auch für kleine Unternehmen?',
        answer:   'Ja, das BFSG gilt grundsätzlich für alle privaten Anbieter digitaler Produkte und Dienstleistungen in der EU, die sich an Verbraucher richten. Eine Ausnahme gilt für Kleinstunternehmen mit weniger als 10 Beschäftigten und einem Jahresumsatz bzw. einer Bilanzsumme von maximal 2 Millionen Euro — diese sind von den Dienstleistungspflichten weitgehend befreit. Empfehlenswert ist dennoch eine Überprüfung, da die Grenzen im Einzelfall fließend sein können.',
      },
      {
        question: 'Was passiert, wenn ich das BFSG ignoriere?',
        answer:   'Verstöße gegen das BFSG können zu Abmahnungen durch Wettbewerber, Verbände und Verbraucherschutzorganisationen führen. Zusätzlich drohen Bußgelder von bis zu 100.000 €. Die Marktüberwachungsbehörde ist befugt, den Betrieb der nicht konformen Website oder des Online-Shops zu untersagen. Ein frühzeitiges Handeln schützt Sie vor diesen Risiken.',
      },
      {
        question: 'Kann unser bestehendes WordPress-Theme angepasst werden?',
        answer:   'In vielen Fällen ja. Wir analysieren Ihr Theme und die eingesetzten Plugins auf Barrierefreiheit und erarbeiten einen priorisierten Maßnahmenplan. Je nach Theme-Qualität und Komplexität empfehlen wir entweder eine gezielte Anpassung des bestehenden Themes oder einen Neubau auf barrierefreier Basis. Accessibility-Overlays und Plugins sind in der Regel keine rechtssichere Lösung — sie beheben nicht die strukturellen Probleme im Code.',
      },
      {
        question: 'Was ist der Unterschied zwischen BFSG und BITV?',
        answer:   'Die BITV (Barrierefreie Informationstechnik-Verordnung) gilt für öffentliche Stellen wie Behörden, Hochschulen und staatliche Einrichtungen. Das BFSG (Barrierefreiheitsstärkungsgesetz) weitet diese Pflicht auf private Unternehmen im elektronischen Geschäftsverkehr aus und setzt den European Accessibility Act (EAA) in deutsches Recht um. Beide Standards beziehen sich auf die technischen Anforderungen der EN 301 549 und WCAG.',
      },
      {
        question: 'Wie lange dauert eine BFSG-Konformitätsprüfung?',
        answer:   'Eine vollständige Prüfung dauert je nach Seitenumfang 1–3 Werktage. Sie umfasst einen automatisierten technischen Scan sowie einen manuellen Audit mit Screenreader (NVDA, VoiceOver) und Tastaturnavigation nach EN 301 549. Anschließend erhalten Sie einen detaillierten Maßnahmenplan mit Priorisierung und Aufwandsschätzung.',
      },
    ],
  },
  'wordpress-entwicklung': {
    heading: 'Häufige Fragen',
    items: [
      {
        question: 'Wie lange dauert ein WordPress-Relaunch?',
        answer:   'Ein typischer Relaunch dauert 4–8 Wochen, abhängig von Umfang, Seitenzahl und Integrationen. Bei laufenden Projekten liefern wir in Wochen-Sprints sichtbare Ergebnisse – mit Zwischenständen zum Abnehmen.',
      },
      {
        question: 'Können Sie unsere bestehende WordPress-Seite übernehmen?',
        answer:   'Ja. Wir analysieren Theme, Plugins und Struktur, übernehmen die Inhalte und entwickeln auf dieser Basis weiter. So bleibt Ihre SEO-Sichtbarkeit erhalten und wird gezielt ausgebaut.',
      },
      {
        question: 'Warum ist Barrierefreiheit bei WordPress wichtig?',
        answer:   'Seit dem 28. Juni 2025 verpflichtet das BFSG viele Unternehmen zur digitalen Barrierefreiheit. Wir bauen WordPress-Seiten nach EN 301 549 und WCAG 2.2 AA – rechtssicher und für alle Nutzer zugänglich.',
      },
      {
        question: 'Optimieren Sie auch bestehende WordPress-Seiten?',
        answer:   'Ja, wir verbessern Ladezeiten (Core Web Vitals), Sicherheit, Struktur und SEO bestehender Installationen – ohne Komplett-Relaunch, wenn das sinnvoll ist.',
      },
      {
        question: 'Was kostet eine WordPress-Website?',
        answer:   'Je nach Umfang starten WordPress-Projekte bei ca. 2.500 €. Nach einem kostenlosen Erstgespräch erhalten Sie ein transparentes Festpreisangebot – ohne versteckte Kosten.',
      },
    ],
  },
  'website-leasing': {
    heading: 'Häufige Fragen',
    items: [
      {
        question: 'Was ist Website-Leasing?',
        answer:   'Ein Modell, bei dem Sie eine professionell entwickelte Website gegen eine monatliche Pauschale nutzen, anstatt einmalig einen hohen Betrag zu investieren. Wartung und Hosting können auf Wunsch integriert werden.',
      },
      {
        question: 'Wer ist Website-Leasing für geeignet?',
        answer:   'Website-Leasing eignet sich besonders für KMU, Selbstständige und Gründer, die eine professionelle Online-Präsenz wünschen, ohne dabei ihr Budget auf einmal zu belasten.',
      },
      {
        question: 'Bleibe ich flexibel?',
        answer:   'Ja. Inhalte können jederzeit angepasst werden. Erweiterungen sind möglich. Wir besprechen alle Änderungen direkt mit Ihnen – kein Umweg über Agenturen oder Ticketsysteme.',
      },
      {
        question: 'Ist Website-Leasing BFSG-konform?',
        answer:   'Ja, wir entwickeln alle Websites – auch im Leasing-Modell – nach WCAG 2.2 AA und EN 301 549. BFSG-Konformität ist kein Aufpreis, sondern Standard.',
      },
    ],
  },
  'seo-geo': {
    heading: 'Häufige Fragen',
    items: [
      {
        question: 'Was ist GEO – Generative Engine Optimization?',
        answer:   'GEO optimiert Inhalte so, dass sie von KI-Systemen wie ChatGPT, Claude, Gemini oder Perplexity in Antworten zitiert werden. Dazu gehören klare Struktur, Zitate, Fakten und maschinenlesbare Auszeichnung.',
      },
      {
        question: 'Brauche ich SEO und GEO oder reicht eines davon?',
        answer:   'Beides ergänzt sich: SEO sichert klassische Google-Sichtbarkeit, GEO die Präsenz in KI-Antworten. Wer in beiden Kanälen erscheint, besetzt die relevante Aufmerksamkeit – heute und in Zukunft.',
      },
      {
        question: 'Wie lange dauert es, bis SEO wirkt?',
        answer:   'Erste Verbesserungen sind oft nach 4–6 Wochen messbar, spürbare Rankings nach 3–6 Monaten. Entscheidend sind saubere Technik, relevante Inhalte und kontinuierliche Optimierung.',
      },
      {
        question: 'Bieten Sie auch lokales SEO für Köln an?',
        answer:   'Ja. Wir optimieren Google Business Profile, lokale Strukturdaten und regionale Inhalte, damit Sie bei Suchanfragen wie \'Agentur Köln\' oder \'WordPress Köln\' gefunden werden.',
      },
      {
        question: 'Was ist llms.txt?',
        answer:   'llms.txt ist eine maschinenlesbare Datei, die KI-Systemen die wichtigsten Informationen über Ihre Website bereitstellt – vergleichbar mit robots.txt, aber für Large Language Models. Wir implementieren und pflegen sie.',
      },
    ],
  },
  'online-marketing': {
    heading: 'Häufige Fragen',
    items: [
      {
        question: 'Welche Plattformen betreust Sie?',
        answer:   'Wir planen und steuern Kampagnen auf Google Ads, Meta (Facebook/Instagram) und LinkedIn – abgestimmt auf Ihre Zielgruppe, Ihr Budget und Ihre Conversion-Ziele.',
      },
      {
        question: 'Wie misst Sie den Erfolg von Kampagnen?',
        answer:   'Wir arbeiten mit klaren KPIs: ROAS, CAC, Conversion-Rate und Cost per Lead. Sie erhalten regelmäßige Reportings in verständlicher Sprache – keine Zahlenfriedhöfe.',
      },
      {
        question: 'Was kostet Online-Marketing?',
        answer:   'Das hängt von Kampagnenziel und Umfang ab. Wir erstellen nach einem kostenlosen Erstgespräch ein transparentes Angebot – inklusive Budgetempfehlung für die Ads-Ausgaben.',
      },
      {
        question: 'Kannst Sie auch nur einzelne Maßnahmen umsetzen?',
        answer:   'Ja. Ob nur Google Ads, nur Content oder nur E-Mail-Marketing – wir übernehmen einzelne Bausteine oder den kompletten Marketing-Mix. Sie entscheiden.',
      },
    ],
  },
  'social-recruiting': {
    heading: 'Häufige Fragen',
    items: [
      {
        question: 'Was ist Social Recruiting?',
        answer:   'Social Recruiting nutzt Social-Media-Plattformen wie LinkedIn, Instagram und Facebook, um passende Kandidatinnen und Kandidaten aktiv anzusprechen – statt nur auf Bewerbungen zu warten.',
      },
      {
        question: 'Wie hilft KI beim Recruiting?',
        answer:   'KI unterstützt bei der Zielgruppenanalyse, der Personalisierung von Ansprachen und der Optimierung von Kampagnen – so erreichst Sie genau die Menschen, die zu Ihrer Stelle passen.',
      },
      {
        question: 'Für welche Positionen funktioniert Social Recruiting?',
        answer:   'Von Fachkräften und Spezialisten bis zu Führungspositionen – wir entwickeln Kampagnen für alle Zielgruppen, vom Gesundheitswesen bis zur IT und dem Handwerk.',
      },
      {
        question: 'Wie misst Sie den Recruiting-Erfolg?',
        answer:   'Wir tracken Reichweite, Klicks, Bewerbungen und Cost per Application. Sie wissen jederzeit, was Ihre Recruiting-Maßnahmen kosten und was sie bringen.',
      },
    ],
  },
  'corporate-design': {
    heading: 'Häufige Fragen',
    items: [
      {
        question: 'Was gehört zu einem Corporate Design?',
        answer:   'Logo, Farbwelt, Typografie, Bildsprache, Gestaltungsraster und Anwendungsregeln – dokumentiert in einem Manual, damit Ihre Marke überall gleich auftritt.',
      },
      {
        question: 'Brauche ich ein Design Manual?',
        answer:   'Sobald mehrere Menschen oder Agenturen für Ihre Marke gestalten, lohnt sich ein Manual. Es sichert Konsistenz in Print, Web und Social Media – und spart langfristig Zeit.',
      },
      {
        question: 'Wie lange dauert ein Logo-Design?',
        answer:   'Ein professionelles Logo entsteht in der Regel in 2–4 Wochen – inklusive Recherche, Entwürfen, Feedback-Schleifen und der Übergabe aller druck- und webfähigen Dateien.',
      },
      {
        question: 'Können Sie unser bestehendes Design überarbeiten?',
        answer:   'Ja. Wir modernisieren bestehende Marken, ohne die Wiedererkennung zu verlieren – ein Relaunch des Corporate Designs, der Ihre Marke zukunftsfähig macht.',
      },
    ],
  },
  'ki-services': {
    heading: 'Häufige Fragen',
    items: [
      {
        question: 'Was ist ein KI-Telefon-Agent?',
        answer:   'Ein KI-Telefon-Agent nimmt Anrufe automatisch entgegen, beantwortet Fragen und bucht Termine – rund um die Uhr, auch außerhalb Ihrer Geschäftszeiten. Anrufer merken kaum einen Unterschied.',
      },
      {
        question: 'Für wen lohnt sich ein KI-Telefon-Agent?',
        answer:   'Für alle Unternehmen mit vielen eingehenden Anrufen: Praxen, Handwerksbetriebe, Kanzleien, Agenturen und Dienstleister. Jeder verpasste Anruf ist ein verlorener Kunde.',
      },
      {
        question: 'Was kann KI-gestützte Textoptimierung?',
        answer:   'KI unterstützt bei Webtexten, Kampagnen und Produktbeschreibungen – schneller, konsistenter und abgestimmt auf Ihre Zielgruppe. Du behalten die Kontrolle, wir liefern die Qualität.',
      },
      {
        question: 'Sind KI-Lösungen datenschutzkonform?',
        answer:   'Ja. Wir setzen auf europäische Anbieter und DSGVO-konforme Konfigurationen. Ihre Daten bleiben geschützt – das ist bei KI-Projekten für uns Grundvoraussetzung.',
      },
    ],
  },
};

/** FAQ-Set zu einem Slug, oder undefined. */
export const faqFor = (slug: string): FaqSet | undefined => faqs[slug];

/** Alle Fragen über alle Seiten — Basis für llms.txt. */
export const allFaqItems = (): Array<FaqItem & { slug: string }> =>
  Object.entries(faqs).flatMap(([slug, set]) =>
    set.items.map((item) => ({ ...item, slug })),
  );

