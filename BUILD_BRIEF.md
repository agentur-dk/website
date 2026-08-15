# BUILD BRIEFING — Kompletter Relaunch agentur dk (dk-dk.de)

## Rolle
Du bist Senior Web-Developer einer Top-Digitalagentur. Du baust die komplette Website von Grund auf neu — radikal, professionell, nach höchsten Standards. Bestehende Altlasten (jQuery, Font Awesome 4, Bootstrap-Mix, kaputte Accessibility) werden NICHT übernommen. Alles wird neu geschrieben.

## Ausgangslage & Ziel
- Statische Website der Agentur „agentur dk – design & kommunikation" (Köln), bisher unter https://dk-dk.de
- Relaunch: technisch, optisch UND inhaltlich — professionelles Niveau einer Top-Agentur
- Hosting-Ziel: GitHub Pages (statische Dateien, absolute Pfade funktionieren, keine Server-Skripte)
- **Dateinamen/URLs der bestehenden Seiten bleiben erhalten** (SEO-Stabilität):
  - index.html, bfsg-wordpress-website-agentur.html, impressum.html, datenschutz.html, barrierefreiheit.html
  - NEU: 404.html

## ✅ NON-NEGOTIABLES (Pflicht, keine Ausnahmen)

### 1. Accessibility — EN 301 549 + WCAG 2.2 AA (mindestens)
- Vollständige Landmark-Struktur: `<header>`, `<nav>`, `<main id="main-content">`, `<footer>`, ggf. `<aside>`
- Skip-Link als ERSTER fokussierbarer Link: `href="#main-content"`, funktionierendes JS-Fokus-Management
- Genau EINE `<h1>` pro Seite, logische Hierarchie h1→h2→h3 ohne Sprünge
- Tastatur-Navigation komplett (alle Interaktionen per Tab/Enter/Space erreichbar, sichtbarer Fokus-Ring 2:1 oder besser)
- Kontraste: WCAG AA (Text 4.5:1, große Text/UI 3:1) — IMMER mit Token-Werten berechnen und im CSS dokumentieren
- Formulare: `<fieldset>` + `<legend>` pro Fragengruppe, `<label for>` verknüpft, Fehlermeldungen mit `aria-describedby` und `aria-invalid`, Fokus-Management bei Step-Wechsel
- `prefers-reduced-motion` respektieren (Animationen deaktivieren/vereinfachen)
- Touch-Targets mindestens 44×44 px (WCAG 2.2 SC 2.5.8)
- `aria-current` für aktive Navigation, `aria-expanded`/`aria-controls` für Menüs/Accordions
- Alt-Texte: dekorative Bilder `alt=""`, informative Bilder beschreibend
- Kein `display:none` für semantisch relevante Inhalte; `sr-only`-Klassen für visuell versteckte, aber lesbare Texte

### 2. Technik — Null Altlasten, null externe Abhängigkeiten
- **KEIN jQuery, KEIN Bootstrap, KEIN Font Awesome, KEIN CDN** — gar nichts Externes
- Alles selbst gehostet: CSS, JS, Fonts, Bilder, Icons (Inline-SVG)
- Vanilla JavaScript, modern (ES2020+), modular, ohne Dependencies
- Icons: ausschließlich Inline-SVG (kein Icon-Font)
- CSS: eigenes Design-System mit Custom Properties (kein Framework)
- HTML5, valides Markup, keine Inline-Styles, keine `document.write()`, kein `&copy; <script>`-Anti-Pattern (Jahr per JS `textContent` in ein `<span id="year">`)

### 3. DSGVO-Konformität
- **KEIN Tracking ohne Consent.** Kein Google Analytics, kein externes Skript, kein eingebettetes Drittanbieter-Tool, das Cookies setzt (Typeform, Calendly etc.) — OHNE vorherige Einwilligung
- Eigenes, leichtgewichtiges, DSGVO-konformes Consent-Management (kein CDN-Tool): Banner + Einstellungen, nur notwendige Cookies (Funktional) standardmäßig, statistisch/extern NUR nach Opt-in, Einwilligung speicherbar (localStorage), Widerruf möglich
- Datenschutzerklärung und Impressum entsprechend korrekt, ehrlich und vollständig aktualisieren
- Kontaktformular: DSGVO-konform (Hinweistext, kein Versand an Dritte, keine versteckten Tracker). Keine externen Formular-Dienste ohne Consent
- Fonts lokal (kein Google-Fonts-Request an Google-Server)

### 4. SEO — maximal professionell
- Unique `<title>` je Seite (50–60 Zeichen), Unique Meta Description (120–160 Zeichen)
- Canonical ABSOLUT je Seite (`https://dk-dk.de/...` bzw. Platzhalter-Konstante)
- Open Graph + Twitter Cards komplett je Seite (og:title, og:description, og:image, og:url, og:type, og:locale de_DE)
- JSON-LD strukturierte Daten:
  - Startseite: `Organization` + `LocalBusiness`/`ProfessionalService` (Name, Adresse Köln, Telefon, E-Mail, Geo, Öffnungszeiten, sameAs) + `WebSite`
  - Leistungsseite: `Service`-Schema für die angebotenen Leistungen, ggf. `FAQPage`
- Semantische Struktur: eine h1, sprechende Überschriften, Keyword-fokussierte, natürliche Texte (Suchintention: „barrierefreie Website Agentur", „WordPress Agentur Köln", „SEO Agentur Köln", „BFSG Website")
- sitemap.xml: ALLE indexierbaren Seiten, korrekte lastmod (aktuelles Datum), changefreq/priority sinnvoll
- robots.txt: korrekt, keine nicht-existierenden Pfade disallowen
- Alt-Texte, Title-Attribute nur wo sinnvoll, saubere interne Verlinkung (Header/Footer/Breadcrumbs wo passend)

### 5. GEO (Generative Engine Optimization) — wichtig für die Agentur
- llms.txt: professionell, strukturiert, mit Markdown — Unternehmensprofil, Leistungen, Kontakt, Standort, FAQ; für LLM-Crawler optimiert
- Klare, faktische, gut strukturierte Inhalte (Listen, Tabellen wo sinnvoll), die LLMs leicht zitieren können
- FAQ-Sektionen mit Schema-Markup
- Auszeichnung „GEO: künstliche Intelligenz / LLM" nicht als Buzzword, sondern sauber umgesetzt

### 6. Performance (Core Web Vitals-freundlich)
- CSS-Budget: gesamt < 60 KB (unkomprimiert), JS < 30 KB, keine Render-blocking-Ressourcen ohne `preload`/`defer`
- Fonts: selbst gehostet, `font-display: swap`, `preload` für kritische Fonts, nur benötigte Schnitte
- Bilder: komprimiert, `width`/`height` (CLS vermeiden), `loading="lazy"` unterhalb des Folds, OG-Bild optimiert
- Keine unnötigen Requests, keine Duplikate

## 🎨 DESIGN-SYSTEM (maximale Standardisierung)

### Architektur (Dateien)
```
css/
  tokens.css        — Design-Tokens (Farben, Typo, Spacing, Radii, Shadows, Z-Index)
  base.css          — Reset, Basis-Elemente, Typografie
  layout.css        — Container, Grid, Section, Header, Footer, Navigation
  components.css    — Buttons, Cards, Forms, Accordion, Banner, Badges, Table
  utilities.css     — sr-only, text-*, spacing-*, flex/grid-Helfer (minimal, dokumentiert)
js/
  main.js           — Vanilla, modular (Navigation, Consent, Formular, Jahr, Skip-Link)
```
- Naming: **BEM-artig** (block__element--modifier), Utilities mit Präfix `u-`
- JEDE Komponente im Design-System nutzt Tokens — keine Magic Numbers in Komponenten
- Keine Inline-Styles im HTML. Kein `!important` (Ausnahme: Utilities, dokumentiert)

### Typo-Skala (Tokens)
- Basis: 16 px, Skala 1.25 (modular): 12 / 14 / 16 / 20 / 25 / 31 / 39 / 49 px
- Fonts: **Roboto Mono** (vorhanden, lokal: 300/400/700) als Marken-/Mono-Font + system-ui-Stack für Fließtext (kein externer Font!)
- Zeilenhöhen: Fließtext 1.6, Headlines 1.2; Letter-spacing für Mono-Labels

### Farben (aus bestehendem Brand ableiten, dunkles Profi-Theme)
- Tokens: `--color-bg`, `--color-surface`, `--color-text`, `--color-text-muted`, `--color-primary`, `--color-accent`, `--color-focus`, `--color-error`, `--color-success`
- Dunkles Theme (passend zu bestehendem Look mit Roboto Mono), Kontrast AA verifiziert, im Kommentar je Token den Kontrastwert zum Hintergrund dokumentieren

## 📄 SEITEN & INHALT (inhaltlicher Relaunch)

Bestehende Seiten VOR dem Bauen lesen und relevante Fakten übernehmen (Leistungen, Kontaktdaten, Unternehmensinfo, rechtliche Angaben wie Adresse/Telefon/E-Mail/USt-ID), aber TEXTE professionell NEU formulieren — knackig, klar, verkaufsstark, ohne Werbe-Floskeln. Deutsch.

### index.html — Startseite
- Hero: Claim + Subline + 2 CTAs („Projekt anfragen", „BFSG-Check starten"), dezent animiert (reduced-motion!)
- Leistungen (4–6 Karten): Barrierefreie Websites (BFSG), WordPress-Entwicklung, SEO & GEO, Online-Marketing, Corporate Design, KI-Services (Social Recruiting, KI-Telefon-Agenten)
- Warum agentur dk (USPs, Zahlen: „1-Personen-Entscheidung", „BFSG-Experte", „Köln")
- Prozess (4 Schritte)
- Referenz-/Kunden-Strip (TARGOBANK, Bundesministerium — anonymisiert „öffentliche Auftraggeber")
- FAQ (5–7 Fragen, mit FAQPage-Schema)
- Finaler CTA-Block + Kontakt
- Kontaktformular (DSGVO-konform, clientseitig validiert, Hinweise)

### bfsg-wordpress-website-agentur.html — Leistungsseite BFSG/WordPress
- Hero, Problem-Lösung, BFSG-Erklärung (EN 301 549/WCAG 2.2, Fristen), Leistungsumfang, Ablauf, Kostenmodell, FAQ, CTA
- Der BFSG-Selbstcheck als BARRIEREFREIES Formular (fieldset/legend je Frage, Fokus-Management, Ergebnis-Auswertung clientseitig, `aria-live` für Ergebnis)

### impressum.html
- Vollständig nach § 5 DDG (früher TMG): Name, Anschrift, Kontakt, Vertretungsberechtigter, USt-ID (falls vorhanden), § 18 Abs. 2 MStV, Verantwortlich i.S.d. § 18 Abs. 2 MStV, EU-Streitschlichtung (ODR-Plattform-Link), § 36 VSBG-Hinweis
- Fakten aus der bestehenden Seite übernehmen, Lücken ergänzen

### datenschutz.html
- Vollständig, ehrlich: Verantwortlicher, Hosting, Server-Logs, Kontaktformular, Consent-Management, keine unnötigen Drittanbieter, Betroffenenrechte, Widerruf, Aufsichtsbehörde (LDI NRW)
- KEINE erfundenen Tools. Wenn kein GA im Einsatz: kein GA-Abschnitt. Consent-Tool selbst dokumentieren
- Fakten aus bestehender Seite übernehmen, wo zutreffend

### barrierefreiheit.html
- Barrierefreiheits-Erklärung: BFSG-Bezug, WCAG 2.2-Konformitätsstatus, Datum der Erstellung/Prüfung, Kontaktweg für Barrieremeldungen, Durchsetzungsstelle (gem. BFSG/BGG)

### 404.html
- Gebrandete Fehlerseite: klare Meldung, Suche-Ersatz (Link zu Startseite/Leistungen/Kontakt), korrekter HTTP-Status via GitHub Pages (eigenständige 404.html reicht)

### Gemeinsam (alle Seiten)
- Header: Logo (Inline-SVG oder Text-Logo „agentur dk"), `<nav>` mit den Hauptseiten (Start, Leistungen/BFSG, Barrierefreiheit, Kontakt/Impressum), Mobile-Menü (barrierefrei, aria-expanded), aktive Seite mit aria-current
- Footer: 3–4 Spalten (Agentur, Leistungen, Rechtliches, Kontakt) mit h2-Überschriften (KEINE span!), Social-Links NUR wenn echte Profile existieren (LinkedIn von Daniel Kontelis ist bekannt; sonst keine Platzhalter!), Copyright mit JS-Jahr
- Konsistente Struktur, gleiche Klassen überall (Design-System!)

## 📐 QA-PFLICHT VOR ABSCHLUSS
1. Tag-Balance & Struktur jeder HTML-Datei prüfen (öffnende/schließende Tags)
2. Keine externen URLs (http/https) in css/js/fonts-Links außer canonical/OG/schema.org
3. Jede Seite: genau 1 h1, Skip-Link erster Link im Body, `<main id="main-content">`, nav-Landmark
4. Kontraste der Token-Paare rechnerisch dokumentieren
5. Alle internen Links auflösen (keine toten Links), sitemap.xml = echte Dateien
6. JS ohne Fehler (Syntax-Check via `node --check`), keine `document.write`
7. Keine Inline-Styles, keine `!important` (außer dokumentierte Utilities)
8. Mobile: bei 320 px kein horizontales Scrollen (CSS prüfen)
9. Liste aller erzeugten Dateien + Kurz-QA-Report am Ende ausgeben

## OUTPUT
- Alle Dateien direkt im Projektroot schreiben (bestehende überschreiben)
- Alte, ungenutzte Assets (jquery*, skel*, fontawesome*, bootstrap*) LÖSCHEN
- Am Ende: kompakte Zusammenfassung (gebaut, gelöscht, QA-Ergebnis, offene Punkte)
