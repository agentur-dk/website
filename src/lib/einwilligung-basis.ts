// ABGELEITETE DATEI — nicht hier bearbeiten.
// Quelle: Code/dk-basis/einwilligung/index.ts
// Nachziehen mit: bash ../dk-basis/verteilen.sh
//
// Warum kopiert statt als Paket eingebunden: `file:../dk-basis` zeigt aus
// dem Repository heraus. `npm ci` meldet dann Erfolg, installiert nichts,
// und der Bau bricht erst danach ab — genau so ist der Deploy am
// 02.09.2026 stehengeblieben. Ein Klon muss aus sich heraus bauen.

/**
 * Die Einwilligung — eine Fassung für alle Agenturprojekte.
 *
 * Vorher hatte jedes Projekt seine eigene: dk-dk.de in
 * `components/Consent.astro`, bnm in `lib/consent.ts`, yupik in
 * `lib/consent/dialog.ts` — drei Aufteilungen, drei Wortlaute, und beim
 * Nachziehen einer Korrektur wurde regelmäßig eines vergessen. Genau so
 * ist der fehlende Neuladen-beim-Widerruf entstanden.
 *
 * Was hier steht, ist das, was **überall gleich sein muss**, weil eine
 * Rechtspflicht daran hängt. Was je Projekt verschieden ist — Messkennung,
 * Pfade, zusätzliche Dienste — kommt als Parameter herein.
 *
 * Bibliothek: vanilla-cookieconsent (MIT, aktiv gepflegt). Bewusst kein
 * Klaro und keine Ableitung davon: Für eine Komponente, die Rechtspflichten
 * trägt, ist ein stehengebliebenes Projekt das schlechteste von beiden
 * Welten. Und kein CDN — ein Aufruf dorthin überträgt die IP jedes
 * Besuchers an einen Dritten, bevor eine Einwilligung vorliegt.
 */

export interface EinwilligungOptionen {
  /** Google-Messkennung, z. B. `G-XXXXXXXXXX`. Ohne sie wird nichts geladen. */
  readonly messkennung?: string;
  /** Pfad zur Datenschutzerklärung, z. B. `/datenschutz.html`. */
  readonly datenschutz: string;
  /** Pfad zum Impressum. */
  readonly impressum?: string;
  /** Name des Speichereintrags. Je Projekt eigen, sonst teilen sich Vorschau-Projekte einen. */
  readonly speicher: string;
  /** Zusätzliche Kategorien über die drei Standardzwecke hinaus. */
  readonly zusatz?: Record<string, unknown>;
}

/**
 * Die Festlegungen, an denen die Wirksamkeit hängt.
 *
 * **Was hier bewusst NICHT steht: `categories`.** Die Zwecke sind je
 * Projekt verschieden — andere Cookies, andere Dienste — und ein Projekt
 * muss sie ohnehin selbst setzen. Stünden sie hier zusätzlich, gewänne
 * beim Zusammenführen die spätere Angabe und die gemeinsame würde still
 * überschrieben. Genau so wäre beinahe das Neuladen beim Widerruf wieder
 * verlorengegangen, das erst am 02.09.2026 nachgetragen wurde. Was sich
 * still überschreiben lässt, gehört nicht in eine gemeinsame Grundlage.
 *
 * `mode: 'opt-in'` — nichts lädt vor der Einwilligung.
 *
 * `disablePageInteraction` — abgedunkelter Vorhang, gesperrtes Scrollen,
 * bis gewählt wurde. Ein Dialog am Bildschirmrand wird überlesen, und eine
 * überlesene Frage ist keine Entscheidung.
 *
 * `equalWeightButtons` — der Punkt, an dem so ein Dialog kippt. Erzwingen
 * ist zulässig, solange Ablehnen genauso leicht ist wie Annehmen: gleiche
 * Größe, gleiche Farbe, gleiche Ebene. Wäre „Nur notwendige" kleiner oder
 * blasser, bliebe als bequemer Ausweg nur die Zustimmung — und eine so
 * erzwungene Zustimmung ist nach Art. 4 Nr. 11 und Art. 7 Abs. 4 DSGVO
 * keine Einwilligung. Der Dialog wäre dann nicht strenger, sondern
 * unwirksam. Die Vorgabe der Bibliothek ist bereits `true`; hier steht es
 * ausdrücklich, damit eine geänderte Vorgabe es nicht still kippt.
 */
export function erzeugeKonfiguration(o: EinwilligungOptionen) {
  return {
    mode: 'opt-in' as const,
    cookie: { name: o.speicher },
    disablePageInteraction: true,

    guiOptions: {
      consentModal: {
        layout: 'box' as const,
        position: 'middle center' as const,
        equalWeightButtons: true,
        flipButtons: false,
      },
      preferencesModal: { layout: 'box' as const, equalWeightButtons: true },
    },

  };
}

/** Die deutschen Texte. Die Bibliothek liefert keine mit. */
export function texte(o: EinwilligungOptionen) {
  const verweise: string[] = [
    `<a href="${o.datenschutz}">Datenschutzerklärung</a>`,
  ];
  if (o.impressum) verweise.push(`<a href="${o.impressum}">Impressum</a>`);

  return {
    de: {
      consentModal: {
        title: 'Datenschutz-Einstellungen',
        description:
          'Wir laden nichts, dem Sie nicht zugestimmt haben. Notwendige '
          + 'Funktionen sind immer aktiv; alles andere entscheiden Sie. '
          + 'Ihre Wahl können Sie jederzeit ändern.<br>' + verweise.join(' · '),
        acceptAllBtn: 'Alle akzeptieren',
        acceptNecessaryBtn: 'Nur notwendige',
        showPreferencesBtn: 'Einzeln auswählen',
      },
      preferencesModal: {
        title: 'Einstellungen',
        acceptAllBtn: 'Alle akzeptieren',
        acceptNecessaryBtn: 'Nur notwendige',
        savePreferencesBtn: 'Auswahl speichern',
        closeIconLabel: 'Schließen',
        sections: [
          {
            name: 'Notwendig',
            description:
              'Für den Betrieb der Seite erforderlich — etwa Ihre '
              + 'Datenschutz-Einstellungen selbst. Lässt sich nicht abschalten.',
            linkedCategory: 'necessary',
          },
          {
            name: 'Statistik',
            description:
              'Anonymisierte Auswertung der Nutzung (Reichweitenmessung), '
              + 'mit gekürzter IP-Adresse.',
            linkedCategory: 'analytics',
          },
        ],
      },
    },
  };
}
