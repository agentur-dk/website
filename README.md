# agentur dk – Website

Offizielle Website der agentur dk – design & kommunikation, Köln.
Gehostet auf GitHub Pages unter `https://agentur-dk.github.io/website/`.

## Stack

| Technologie | Version |
|---|---|
| [Astro](https://astro.build) | 7.2.4 |
| TypeScript | strict |
| [Tailwind CSS](https://tailwindcss.com) | v4 |
| [vitest](https://vitest.dev) | 4.x |

## Setup

```bash
npm install
```

## Skripte

| Befehl | Funktion |
|---|---|
| `npm run dev` | Lokaler Dev-Server (http://localhost:4321/website/) |
| `npm run build` | Produktions-Build nach `dist/` |
| `npm run preview` | Vorschau des Builds |
| `npm test` | vitest-Tests (unit tests in `src/lib/`) |
| `npm run check:links` | Interne Links in `dist/` prüfen |
| `npm run check:meta` | Title/Description gegen `tools/legacy-meta.json` prüfen |
| `npm run validate` | build + check:links + check:meta in einem Schritt |

## Projektstruktur

```
dk-dk-website/
├── astro.config.mjs        # base: '/website/'
├── tsconfig.json           # strict
├── public/                 # statische Assets (1:1 nach dist/ kopiert)
│   ├── favicon.svg
│   ├── fonts/              # Space Grotesk, Manrope, Roboto Mono (lokal, kein CDN)
│   ├── images/             # og-image-website.png
│   ├── robots.txt
│   ├── llms.txt
│   └── sitemap.xml
├── src/
│   ├── pages/              # .astro-Seiten → gleiche URLs wie Legacy (SEO-stabil)
│   │   ├── index.astro
│   │   ├── leistungen.astro
│   │   ├── projekte.astro
│   │   ├── barrierefreiheit.astro
│   │   ├── bfsg-wordpress-website-agentur.astro
│   │   ├── wordpress-entwicklung.astro
│   │   ├── seo-geo.astro
│   │   ├── online-marketing.astro
│   │   ├── social-recruiting.astro
│   │   ├── corporate-design.astro
│   │   ├── ki-services.astro
│   │   ├── website-leasing.astro
│   │   ├── datenschutz.astro
│   │   ├── impressum.astro
│   │   └── 404.astro
│   ├── layouts/
│   │   └── BaseLayout.astro   # <head>, Canonical, Fonts-Preload, ConsentBanner, Skip-Link
│   ├── components/            # wiederverwendbare Astro-Komponenten
│   │   ├── Header.astro
│   │   ├── Footer.astro
│   │   ├── CtaSection.astro
│   │   ├── ServiceCard.astro
│   │   ├── ReferenceCard.astro
│   │   ├── LogoStrip.astro
│   │   ├── StatsStrip.astro
│   │   ├── FaqAccordion.astro
│   │   ├── TabNav.astro
│   │   ├── LeadForm.astro
│   │   ├── BfsgCheck.astro
│   │   └── ConsentBanner.astro
│   ├── lib/                   # reine TypeScript-Logik (testbar via vitest)
│   │   ├── bfsg-logic.ts
│   │   ├── quiz.ts
│   │   ├── consent.ts
│   │   └── form-validation.ts
│   └── styles/
│       └── global.css         # @font-face + Tailwind @theme (Design-Tokens)
└── tools/
    ├── check-links.mjs        # interne Link-Prüfung
    ├── check-meta.mjs         # Meta-Tag-Prüfung gegen Snapshot
    └── legacy-meta.json       # eingefrorener Title/Description-Snapshot
```

## Deployment

GitHub Actions Workflow (`.github/workflows/deploy.yml`) triggert automatisch bei Push auf `main`:
1. `npm install`
2. `npm run build` → `dist/`
3. GitHub Pages Deploy (Basis-Pfad `/website/`)

Live-URL: `https://agentur-dk.github.io/website/`

## Hinweise

- **Legacy-Stack entfernt:** Das alte HTML/CSS/JS-System (`build-css.py`, `css/`, `js/`, root-HTML-Dateien) wurde mit Phase 8 (21.08.2026) vollständig entfernt.
- **Git-Historie:** Der Stand vor der Astro-Migration ist im Tag `pre-astro` und im Git-Log erhalten.
- **Design-Tokens:** Farben, Typo und Abstände sind in `src/styles/global.css` als Tailwind-`@theme`-Variablen definiert. Verbindliche Referenz: `DESIGN_GUIDE.md`.
- **Formulare:** `LeadForm.astro` enthält Honeypot (`_gotcha`), Zeitstempel (`form_started`) und Seiten-Tracking (`name="page"`). Kein Formspree in Produktion.
