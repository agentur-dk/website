# agentur dk – Website

Website der agentur dk – design & kommunikation, Köln.
Statisch gebaut mit Astro, gehostet auf GitHub Pages unter der Custom Domain
**https://dk-dk.de**.

## ⚠️ Die Seite ist zurzeit für Suchmaschinen gesperrt

Solange sie im Aufbau ist, trägt jede Seite `noindex, nofollow`, KI-Crawler
sind ausgesperrt, die Sitemap ist leer und `llms.txt` liefert nur einen Hinweis.

**Zum Live-Schalten:** in `src/config/site.config.ts` die Konstante
`INDEXIERUNG_ERLAUBT` auf `true` setzen. Das ist die einzige Stelle — Meta-Tags,
robots.txt, Sitemap und llms.txt hängen alle daran.
Für einen einzelnen Testbuild genügt `SITE_INDEXABLE=true npm run build`.

`npm run check:seo` prüft in beiden Zuständen: solange die Sperre steht, dass sie
auf allen vier Kanälen lückenlos greift; danach, dass keine Reste zurückbleiben.

## Stack

| Technologie | Version | Rolle |
|---|---|---|
| [Astro](https://astro.build) | 7.x | Static Site Generator, keine Client-Framework-Laufzeit |
| TypeScript | strict | Seitenlogik in `src/lib/`, per `astro check` geprüft |
| [Tailwind CSS](https://tailwindcss.com) | v4 | Utility-Layer über eigenen Design-Tokens |
| [vitest](https://vitest.dev) | 4.x | Unit-Tests für Logik und Schema-Erzeugung |
| [Playwright](https://playwright.dev) + [axe-core](https://github.com/dequelabs/axe-core) | — | Barrierefreiheitsprüfung |
| [Lighthouse](https://developer.chrome.com/docs/lighthouse) | — | Performance-, SEO- und Best-Practice-Gate |

## Setup

```bash
npm install
npx playwright install chromium   # nur für die Browser-Prüfungen nötig
```

## Skripte

| Befehl | Funktion |
|---|---|
| `npm run dev` | Dev-Server auf http://localhost:4321/ |
| `npm run build` | Produktions-Build nach `dist/` |
| `npm run preview` | Astro-Vorschau (ohne Kompression) |
| `npm run serve` | `dist/` mit gzip ausliefern — bildet GitHub Pages nach |
| `npm test` | vitest (Logik + Schema.org-Graph) |
| `npm run check:types` | `astro check` — Typen in `.astro`, `.ts` und Tools |
| `npm run check:links` | Interne Links in `dist/` auflösen |
| `npm run check:seo` | Titles, Descriptions, Canonicals, JSON-LD, Sitemap |
| `npm run check:css` | Klassen im HTML ohne CSS-Regel finden |
| `npm run check:a11y` | axe-core, WCAG 2.2 A/AA, 16 Seiten × 3 Zustände |
| `npm run check:wcag` | Reflow, Textabstand, Fokus-Verdeckung, Zielgrößen |
| `npm run check:lighthouse` | 16 Seiten × mobil/desktop, Schwelle 100 |
| **`npm run verify`** | **alles zusammen — das Gate vor jedem Merge** |
| `npm run og:image` | OG-Bild neu rendern (`public/images/`) |
| `npm run fonts:metrics` | Fallback-Metriken neu messen und schreiben |
| `npm run fonts:subset` | `public/fonts/` aus `fonts-src/` auf den genutzten Zeichenvorrat verkleinern |

`check:a11y`, `check:wcag` und `check:lighthouse` brauchen einen laufenden Server.
`npm run verify` startet ihn selbst über `tools/verify-live.mjs`.

## Projektstruktur

```
dk-dk.de/
├── astro.config.mjs        # Domain und base-Pfad, CSS-Inlining
├── fonts-src/              # Originalschriften — Quelle für fonts:subset
├── public/
│   ├── CNAME               # dk-dk.de — ohne diese Datei fällt Pages auf github.io zurück
│   ├── favicon.svg
│   ├── fonts/              # verkleinerte Schnitte, lokal ausgeliefert (kein CDN)
│   └── images/og-image-website.png
├── src/
│   ├── config/site.config.ts   # zentrale Datenquelle: Domain, Kontakt, Seitenregister, Navigation
│   ├── data/faq.ts             # FAQ-Inhalte — speisen Accordion, JSON-LD und llms.txt
│   ├── lib/
│   │   ├── schema.ts           # Schema.org-Graph je Seite
│   │   ├── lastmod.ts          # lastmod aus der Git-Historie
│   │   ├── bfsg-logic.ts       # BFSG-Selbstcheck
│   │   ├── quiz.ts             # Leistungs-Check auf der Startseite
│   │   ├── consent.ts          # Consent-Verwaltung
│   │   └── form-validation.ts  # Formularvalidierung
│   ├── layouts/BaseLayout.astro
│   ├── components/
│   │   ├── seo/SEO.astro       # Meta, Open Graph, Canonical
│   │   ├── seo/Fonts.astro     # @font-face, base-abhängig
│   │   ├── MotionToggle.astro  # Bewegung anhalten (WCAG 2.2.2)
│   │   └── …
│   ├── pages/
│   │   ├── *.astro             # 16 Seiten, URLs wie in der Altsite (.html)
│   │   ├── sitemap.xml.ts      # generiert
│   │   ├── robots.txt.ts       # generiert, inkl. KI-Crawler-Freigaben
│   │   └── llms.txt.ts         # generiert
│   └── styles/
│       ├── global.css          # Tokens-Mapping, Komponenten-CSS
│       └── tokens/             # Farben, Typografie, Abstände
├── tools/                      # Prüf- und Generierwerkzeuge (siehe Skripte)
└── docs/AUDIT-2026-08-16-legacy.md
```

## Deployment

`.github/workflows/deploy.yml` läuft bei jedem Push auf `main`:
Typen → Tests → Build → Link-, SEO- und CSS-Prüfung → GitHub Pages.

`.github/workflows/quality.yml` läuft bei Pull Requests, wöchentlich und auf Zuruf
und fährt die browserbasierten Gates (axe-core, WCAG 2.2, Lighthouse).

Der Checkout nutzt `fetch-depth: 0`, weil die Sitemap ihr `lastmod` aus dem
letzten Commit je Seite ableitet.

### Domain

Produktion läuft unter `https://dk-dk.de` (`public/CNAME`, DNS zeigt auf GitHub Pages).
Für einen Preview-Deploy ohne Custom Domain:

```bash
SITE_URL=https://agentur-dk.github.io BASE_PATH=/website/ npm run build
```

Canonicals, Sitemap, robots.txt, llms.txt und JSON-LD folgen dieser Konfiguration
automatisch — sie werden alle aus `src/config/site.config.ts` erzeugt.

## Konventionen

- **Eine Quelle je Inhalt.** Seiten stehen im Register in `site.config.ts`, FAQs in
  `src/data/faq.ts`. Sitemap, llms.txt, Breadcrumbs und FAQ-Schema entstehen daraus.
  Nichts davon wird von Hand gepflegt.
- **Keine externen Requests.** Schriften liegen lokal, es gibt kein CDN und kein
  Tracking ohne Einwilligung.
- **Design-Tokens** in `src/styles/tokens/` sind verbindlich; Werte gehören nicht
  direkt in Komponenten. Referenz: `DESIGN_GUIDE.md`.
- **Barrierefreiheit ist ein Gate, keine Absicht.** `npm run verify` muss grün sein,
  bevor gemerged wird.
