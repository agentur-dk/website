// ABGELEITETE DATEI — nicht hier bearbeiten.
// Quelle: Code/dk-basis/einwilligung/index.ts
// Nachziehen mit: bash ../dk-basis/verteilen.sh
//
// Kopiert statt als Paket eingebunden, damit ein Klon aus sich heraus baut.

/**
 * Die Einwilligung, gemeinsam für alle Agenturprojekte.
 *
 * Hier steht nur, was überall gleich sein muss, weil eine Rechtspflicht
 * daran hängt. Was je Projekt verschieden ist (Messkennung, Pfade,
 * zusätzliche Dienste), kommt als Parameter herein.
 *
 * Bibliothek: vanilla-cookieconsent, aus `node_modules` und nicht vom CDN —
 * ein CDN-Aufruf überträgt die IP jedes Besuchers vor der Einwilligung.
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
 * `categories` steht bewusst nicht hier: Die Zwecke setzt jedes Projekt
 * selbst, und beim Zusammenführen gewänne die spätere Angabe — eine
 * gemeinsame Festlegung würde still überschrieben.
 *
 * `disablePageInteraction`: Ein Dialog am Bildschirmrand wird überlesen,
 * und eine überlesene Frage ist keine Entscheidung.
 *
 * `equalWeightButtons`: Ablehnen muss so leicht sein wie Annehmen, sonst
 * ist die Zustimmung erzwungen und nach Art. 4 Nr. 11 und Art. 7 Abs. 4
 * DSGVO unwirksam. Steht ausdrücklich da, obwohl es die Vorgabe der
 * Bibliothek ist, damit eine geänderte Vorgabe es nicht still kippt.
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
        title: 'Cookie-Einstellungen',
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
              + 'Cookie-Einstellungen selbst. Lässt sich nicht abschalten.',
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
