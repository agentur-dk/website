/**
 * Zentrales Icon-Verzeichnis.
 *
 * Jedes Icon liegt hier als reiner Pfad-String (`d="…"`) — keine Icon-
 * Bibliothek zur Laufzeit, kein CDN, nichts im Client-JS. Gerendert wird
 * ausschließlich über `src/components/ui/Icon.astro`, das daraus ein
 * `<svg>` mit einem `<path>` baut und `aria-hidden="true"` setzt.
 *
 * Regeln (geprüft von `tools/check-icons.mjs`):
 *  - alphabetisch sortiert,
 *  - jeder Wert ist ein Pfad-String im 24×24-Raster (beginnt mit M/m),
 *  - jeder Eintrag wird auch benutzt,
 *  - außerhalb von Icon.astro steht kein `<svg>` mehr im Quelltext.
 *
 * Zeichenstil: Lucide — Kontur, `stroke-width` 1.5–2, runde Enden. Kreise,
 * Rechtecke und Linien der Vorlagen sind in Pfad-Kommandos übersetzt, damit
 * ein Icon genau ein `d` ist. Neue Icons kommen aus dem Lucide-Set.
 */

export const ICONS = {
  /** Person mit ausgebreiteten Armen — Barrierefreiheit/BFSG. */
  'accessibility':
    'M14 5a2 2 0 1 1-4 0 2 2 0 0 1 4 0z M8 11l-3 2v3h2v5h2v-3h2v3h2v-5h2v-3l-3-2 M5 17a7 7 0 0 1 14 0',

  /** Pulslinie — „direkt umsetzen“. */
  'activity': 'M22 12h-4l-3 9-6-18-3 9H2',

  /** Pfeil nach links — Schritt zurück im Leistungs-Check. */
  'arrow-left': 'M12 19 5 12l7-7M19 12H5',

  /** Aktenkoffer mit Plus — Website-Leasing. */
  'briefcase-plus':
    'M4 7h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2z M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2 M12 12v5 M9 14.5h6',

  /** Haken — erfüllte Punkte, Checkbox im Formular. */
  'check': 'M20 6 9 17l-5-5',

  /** Winkel nach unten — Aufklapper zu, Dropdown im Menü. */
  'chevron-down': 'M6 9l6 6 6-6',

  /** Winkel nach oben — „nach oben scrollen“. */
  'chevron-up': 'M18 15l-6-6-6 6',

  /** Uhr — „ganzheitlich denken“. */
  'clock': 'M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0z M12 6v6l4 2',

  /** Spitze Klammern — WordPress-Entwicklung. */
  'code': 'M16 18l6-6-6-6M8 6l-6 6 6 6',

  /** Prozessor — KI-Services. */
  'cpu':
    'M8 7h8a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1z M9 3v4 M15 3v4 M9 17v4 M15 17v4 M3 9h4 M3 15h4 M17 9h4 M17 15h4',

  /** Gestapelte Ebenen — „nachhaltig aufbauen“. */
  'layers': 'M12 2 2 7l10 5 10-5-10-5z M2 17l10 5 10-5 M2 12l10 5 10-5',

  /** LinkedIn — Kontaktzeile. */
  'linkedin':
    'M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z M2 9h4v12H2z M6 4a2 2 0 1 1-4 0 2 2 0 0 1 4 0z',

  /** Briefumschlag — E-Mail-Adresse. */
  'mail':
    'M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z M22 7l-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7',

  /** Drei Balken — mobiler Menüknopf. */
  'menu': 'M4 6h16M4 12h16M4 18h16',

  /** Zwei Balken — Animationen pausieren. */
  'pause':
    'M15 4h2a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z M7 4h2a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z',

  /** Zeichenfeder — Corporate Design. */
  'pen-tool':
    'M12 19l7-7 3 3-7 7-3-3z M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z M8.5 7a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z',

  /** Hörer — Telefonnummer. */
  'phone':
    'M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.01-.24 11.42 11.42 0 0 0 3.58.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1 11.42 11.42 0 0 0 .57 3.58 1 1 0 0 1-.24 1.01l-2.21 2.2z',

  /** Dreieck — Animationen fortsetzen. */
  'play': 'M5 3l14 9-14 9V3z',

  /** Plus — Aufklapper auf; gedreht wird daraus das Schließen-Kreuz. */
  'plus': 'M5 12h14M12 5v14',

  /** Lupe mit Kurve — SEO & GEO. */
  'search-chart':
    'M18 11a7 7 0 1 1-14 0 7 7 0 0 1 14 0z M21 21l-4.35-4.35 M8 13l2-2 2 2 2-4',

  /** Zwei Personen — Social Recruiting. */
  'users':
    'M12 7a3 3 0 1 1-6 0 3 3 0 0 1 6 0z M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2 M20.5 7a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z M22 21v-2a3.5 3.5 0 0 0-2.5-3.35',

  /** Lautsprecher mit Wellen — Online-Marketing. */
  'volume-2':
    'M3 11v2h4l5 5V6L7 11H3z M19 6a6 6 0 0 1 0 12 M15.54 8.46a3 3 0 0 1 0 7.07',

  /** Kreuz — Dialog schließen. */
  'x': 'M18 6 6 18M6 6l12 12',
} as const satisfies Record<string, string>;

/** Erlaubte Werte für `<Icon name="…" />`. */
export type IconName = keyof typeof ICONS;
