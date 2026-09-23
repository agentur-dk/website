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
 * Zeichenstil: Lucide. Jeder Eintrag ist die Geometrie des gleichnamigen
 * Lucide-Icons, nicht eine eigene Zeichnung im Lucide-Stil — Lucide setzt
 * seine Symbole aus `<circle>`, `<rect>`, `<line>` und `<polyline>`
 * zusammen, hier stehen dieselben Formen als Pfad-Kommandos, damit ein
 * Icon genau ein `d` ist. Kreise werden zu zwei Halbbögen, Rechtecke mit
 * Radius zu Linien plus Viertelbögen, ein Punkt zu `h.01` mit runder Kappe.
 *
 * Wer ein neues Icon braucht: den Pfad des passenden Lucide-Symbols
 * übernehmen, nicht selbst zeichnen. Nachgezeichnete Symbole sehen im
 * Verbund falsch aus — sie treffen Strichstärke, Radien und Rasterlage
 * des Sets nicht.
 */

export const ICONS = {
  /** Lucide `accessibility` — Barrierefreiheit, BFSG. */
  'accessibility':
    'M17 4a1 1 0 1 1-2 0 1 1 0 0 1 2 0z M18 19l1-7-6 1 M5 8l3-3 5.5 3-2.36 3.5 M4.24 14.5a5 5 0 0 0 6.88 6 M13.76 17.5a5 5 0 0 0-6.88-6',

  /** Lucide `activity` — Pulslinie, „direkt umsetzen". */
  'activity':
    'M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2',

  /** Lucide `arrow-left` — Schritt zurück im Leistungs-Check. */
  'arrow-left': 'M12 19l-7-7 7-7M19 12H5',

  /** Lucide `arrow-right` — Verweis auf eine weiterführende Seite. */
  'arrow-right': 'M5 12h14M12 5l7 7-7 7',

  /** Lucide `briefcase-business` — Website-Leasing. */
  'briefcase-business':
    'M4 6h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z M16 6V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2 M22 13a18.15 18.15 0 0 1-20 0 M12 12h.01',

  /** Lucide `calendar` — Termine, ein Zeitraum. */
  'calendar':
    'M8 2v4M16 2v4M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z M3 10h18',

  /** Lucide `check` — erfüllte Punkte, Checkbox im Formular. */
  'check': 'M20 6 9 17l-5-5',

  /** Lucide `chevron-down` — Aufklapper zu, Dropdown im Menü. */
  'chevron-down': 'M6 9l6 6 6-6',

  /** Lucide `chevron-up` — „nach oben scrollen". */
  'chevron-up': 'M18 15l-6-6-6 6',

  /** Lucide `clock` — „ganzheitlich denken". */
  'clock': 'M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0z M12 6v6l4 2',

  /** Lucide `code` — WordPress-Entwicklung. */
  'code': 'M16 18l6-6-6-6M8 6l-6 6 6 6',

  /** Lucide `compass` — sich umsehen, noch am Anfang. */
  'compass':
    'M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0z M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36z',

  /** Lucide `cpu` — KI-Services. */
  'cpu':
    'M6 4h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z M9 8h6a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z M7 2v2 M12 2v2 M17 2v2 M7 20v2 M12 20v2 M17 20v2 M2 7h2 M2 12h2 M2 17h2 M20 7h2 M20 12h2 M20 17h2',

  /** Lucide `globe` — eine Website, ein Auftritt im Netz. */
  'globe':
    'M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0z M2 12h20 M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z',

  /** Lucide `hourglass` — eine Frist von einigen Monaten. */
  'hourglass':
    'M5 22h14M5 2h14M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2',

  /** Lucide `layers` — „nachhaltig aufbauen". */
  'layers':
    'M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12 M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17',

  /** Lucide `linkedin` — Kontaktzeile. */
  'linkedin':
    'M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z M2 9h4v12H2z M6 4a2 2 0 1 1-4 0 2 2 0 0 1 4 0z',

  /** Lucide `mail` — E-Mail-Adresse. */
  'mail':
    'M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z M22 7l-8.991 5.727a2 2 0 0 1-2.009 0L2 7',

  /** Lucide `megaphone` — Online-Marketing. */
  'megaphone': 'M3 11l18-5v12L3 14v-3z M11.6 16.8a3 3 0 1 1-5.8-1.6',

  /** Lucide `menu` — mobiler Menüknopf. */
  'menu': 'M4 12h16M4 6h16M4 18h16',

  /** Lucide `message-circle` — etwas anderes — wir reden darueber. */
  'message-circle':
    'M7.9 20A9 9 0 1 0 4 16.1L2 22Z',

  /* Lucide `mic`: Kapsel, Buegel, Staender — drei Teilpfade in einem `d`. */
  'mic': 'M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3ZM19 10v2a7 7 0 0 1-14 0v-2M12 19v3',

  /** Lucide `palette` — Corporate Design. */
  'palette':
    'M12 22a1 1 0 0 1 0-20 10 9 0 0 1 10 9 5 5 0 0 1-5 5h-2.25a1.75 1.75 0 0 0-1.4 2.8l.3.4a1.75 1.75 0 0 1-1.4 2.8z M13.5 6.5h.01 M17.5 10.5h.01 M8.5 7.5h.01 M6.5 12.5h.01',

  /** Lucide `pause` — Animationen pausieren. */
  'pause':
    'M15 4h2a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z M7 4h2a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z',

  /** Lucide `phone` — Telefonnummer. */
  'phone':
    'M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384',

  /** Lucide `play` — Animationen fortsetzen. */
  'play': 'M6 3l14 9-14 9V3z',

  /** Lucide `plus` — Aufklapper auf; gedreht wird daraus das Schließen-Kreuz. */
  'plus': 'M5 12h14M12 5v14',

  /** Lucide `refresh-cw` — ueberarbeiten statt neu bauen. */
  'refresh-cw':
    'M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8M21 3v5h-5M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16M8 16H3v5',

  /** Lucide `search-check` — SEO & GEO. */
  'search-check':
    'M19 11a8 8 0 1 1-16 0 8 8 0 0 1 16 0z M21 21l-4.3-4.3 M8 11l2 2 4-4',

  /** Lucide `shopping-cart` — Verkaeufe, Bestellungen. */
  'shopping-cart':
    'M8 21h.01M19 21h.01M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12',

  /** Lucide `trending-down` — es passiert zu wenig — Kurve nach unten. */
  'trending-down':
    'M22 17l-8.5-8.5-5 5L2 7 M16 17h6v-6',

  /** Lucide `trending-up` — laeuft und soll wachsen. */
  'trending-up':
    'M22 7l-8.5 8.5-5-5L2 17 M16 7h6v6',

  /** Lucide `users` — Social Recruiting. */
  'users':
    'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0z M22 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75',

  /** Lucide `zap` — es eilt. */
  'zap':
    'M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z',
} as const satisfies Record<string, string>;

/** Erlaubte Werte für `<Icon name="…" />`. */
export type IconName = keyof typeof ICONS;
