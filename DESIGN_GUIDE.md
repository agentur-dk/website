# 🎨 Designguide – agentur dk Website (dk-dk.de)

> **Zweck:** Dieser Guide ist die verbindliche Referenz für ALLE neuen Seiten und Weiterentwicklungen der agentur-dk-Website. Beim Bauen neuer Seiten: Guide lesen und umsetzen.
> **Stand:** 16.08.2026 · Eigenständiges Designsystem der agentur dk

---

## 1. Farbpalette (verbindlich)

Nur diese Farben verwenden. Palette: **schwarz, grau, weiß, blau #1C60AD**.

| Token | Wert | Verwendung |
|---|---|---|
| `--color-bg` | `#121212` | Basis-Hintergrund (dunkel) |
| `--color-surface` | `#1e1e1e` | Karten, Panels, Footer-Bereiche |
| `--color-surface-alt` | `#2a2a2a` | Hover, wechselnde Zeilen |
| `--color-border` | `#333333` | dezente Linien |
| `--color-border-strong` | `#555555` | stärkere Linien |
| `--color-text` | `#e8e8e8` | Text auf dunkel (15,7:1 ✓ AAA) |
| `--color-text-muted` | `#a8a8a8` | Sekundärtext auf dunkel (7,8:1 ✓ AA) |
| `--color-text-faint` | `#909090` | sehr gedimmt (5,5:1 ✓ AA) |
| `--color-primary` | `#1C60AD` | Akzent/Buttons/Flächen (weißer Text: 5,8:1 ✓) |
| `--color-primary-hover` | `#2570C8` | Hover-Zustand Buttons |
| `--color-primary-light` | `#5090d0` | Links/Text-Akzent auf dunkel (4,8:1 ✓ AA) |
| `--color-accent` | `#5090d0` | Akzent-Text (Labels, Stats) |
| `--color-focus` | `#6db3f2` | Fokus-Ring auf dunkel (≈7,5:1 ✓) |

**Helle Sektionen** (`section--light`): Hintergrund `#f5f6f8`, Text `#14171c`, Karten `#ffffff`, Links `#1C60AD`. Die Tokens werden per CSS-Variablen-Override im Sektion-Scope gesetzt – Komponenten passen sich automatisch an.

**Semantisch:** Fehler `#ff9999` (Text) / `#ff6b6b` (UI), Erfolg `#5dbf6a` (dunkel) bzw. `#2e7d32` (hell).

## 2. Typografie (lokal & barrierefrei)

| Einsatz | Font | Details |
|---|---|---|
| **Headlines** (h1–h6, Karten-Titel, Sektions-Titel) | **Space Grotesk** | `font: 700 40px / 1.1 'Space Grotesk', sans-serif` – h1 groß (clamp 31–49px), h2/h3 skaliert, Zeilenhöhe 1.1–1.2, leicht negatives Letter-Spacing |
| **Fließtext & UI** (Body, Buttons, Formulare, Nav, Footer) | **Manrope** | `font-family: 'Manrope', sans-serif`, Gewichte 400/500/600/700 |
| **Code/pre** | Roboto Mono | nur für Codeblöcke |

**Lokal gehostet** (fonts/): `space-grotesk-v3-latin-{400,500,700}.woff2`, `manrope-v20-latin-{400,500,600,700}.woff2`, `roboto-mono-v31-latin-{300,400,700}.woff2`. Keine CDN-Fonts. `font-display: swap`. Preload: Space Grotesk 700 + Manrope 400.

**Größen-Skala:** xs 12px · sm 14px · base 16px · md 20px · lg 25px · xl 31px · 2xl 39px · 3xl 49px.

## 3. Layout & Sektions-Rhythmus (dunkel/hell-Balance)

- **Dunkel/hell wechseln** – nie durchgehend dunkel. Muster: Hero (dunkel) → Stats (dunkel) → Leistungen (hell) → Warum wir (hell) → Prozess (hell) → FAQ (hell) → Kontakt (dunkel). Landingpages: Hero (dunkel) → Problem (dunkel) → Leistungen (hell) → Prozess (hell) → FAQ (hell) → Kontakt (dunkel).
- **Container:** max 1140px (breit 1280px, schmal 720px), Padding 24px seitlich, Sektionen `padding-block: 80px`.
- **Grids:** `grid--auto-sm/md/lg` mit `minmax(min(100%, Xpx), 1fr)` (kein Viewport-Overflow auf Mobile).
- **Hero:** große Space-Grotesk-Headline, Label (Kleinbuchstaben-Uppercase mit Akzentfarbe), Lead-Text (Manrope, muted), 2 CTA-Buttons. `hero__headline` hat `min-height` (CLS-Fix, Typewriter).

## 4. Komponenten

### Buttons
- `btn--primary`: bg `#1C60AD`, weißer Text, min-height 44px, Mono→Manrope bold uppercase (jetzt Manrope)
- `btn--accent`: bg `#1C60AD` (Akzent-Blau), weißer Text
- `btn--outline` / `btn--ghost` / `btn--secondary`: transparent mit Rahmen
- Fokus-Ring: `outline: 3px solid var(--color-focus)` + offset
- Pfeil-CTA: Text + „›"/„→" möglich via `.cta-block__actions`

### Boxen/Karten
- **Card/Service-Card:** surface, 1px border, padding 32px, Hover: border primary + shadow, große Nummer (01–07) dezent rechts oben
- **✓/✕ Vergleichsboxen** („Was Sie bekommen / Was Sie vermeiden"): Checkliste mit grünen ✓ (`checklist__item::before`) – Kontrast auf hell `#2e7d32`
- **Stats-Strip:** große Zahlen (Space Grotesk, Akzentblau) + Label, responsive 2→1 Spalten
- **Problem→Lösung-Sektionen:** 2-Spalten-Grid, links Text/H2, rechts Checkliste – wie auf den Landingpages

### Lead-Formular (verbindliches Muster)
- **2 Schritte** (keine 3. Seite): ① Anliegen → ② Kontakt
- **Schritt 1 – Anliegen:** Themen-Checkboxen als auffällige Karten (`.lead-topic`, 24px-Häkchenbox, Hover, `:has(:checked)` = blauer Rahmen) + **letzte Checkbox „Sonstiges"** blendet Freitextfeld ein (`data-other-trigger`/`data-other-field`) + Nachricht-Textarea (Pflicht)
- **Schritt 2 – Kontakt:** Name (Pflicht), E-Mail (Pflicht), **Website-URL (optional, autocomplete=url)** + Datenschutz-Hinweis (nur Link, KEINE Checkbox)
- **Seiten-Tracking:** `<input type="hidden" name="page" value="Seitenname">` – jede Seite trägt ihren Namen („Startseite", „WordPress-Entwicklung", …)
- Fortschrittsanzeige oben (`.form-steps`), Enter = Weiter, Fokus-Management pro Schritt, Validierung mit `aria-invalid` + Fehlermeldungen

### Spam-Schutz (DSGVO-konform, lightweight, barrierefrei)
Kein Google ReCaptcha (IP!), keine Third-Party-Cookies. Stattdessen:
1. **Honeypot:** unsichtbares Feld `_gotcha` (nur Bots füllen es)
2. **Zeitstempel:** `form_started` (Hidden, per JS gesetzt) – Formular in <2,5 s ausgefüllt = Bot → still verwerfen (keine Fehlermeldung, die Bots trainiert)
3. Serverseitig (Formspree) landen `page`, `interesse[]`, `anliegen_text` zur Auswertung mit.

## 5. Verläufe & CTA-Block
- **Footer & CTA:** `linear-gradient(to right bottom, #000000, #281621, #412848, #474078, #1c60ad)` (Kundenwunsch, exakte Stops)
- Text auf Verlauf aufhellen: Footer-muted `#d4d4d4`, CTA-Titel weiß, Sub `#d4d4d4` (Kontrast auf dem hellen Blau-Ende)

## 6. Cookie-Banner & Konsens
- **Zwingendes Modal** (zentriert, Scroll-Lock, Fokus-Trap, `role="dialog" aria-modal`), erst nach Auswahl nutzbar
- **Ausnahme:** `datenschutz.html` + `impressum.html` – dort kein Popup (per Pfad-Erkennung in main.js)

## 7. Navigation & Footer
- **Hauptnav:** Start | Leistungen (Dropdown, alle 7) | Referenzen | Barrierefreiheit + CTA „Projekt anfragen"
- **7 Leistungen:** BFSG (`bfsg-wordpress-website-agentur.html`), WordPress (`wordpress-entwicklung.html`), SEO/GEO (`seo-geo.html`), Online-Marketing (`online-marketing.html`), Social Recruiting (`social-recruiting.html`), Corporate Design (`corporate-design.html`), KI-Services (`ki-services.html`)
- **Footer:** 4 Spalten (Agentur/Leistungen/Unternehmen/Kontakt), Leistungen verlinken die 7 Seiten

## 8. Barrierefreiheit (Pflicht)
- Kontraste ≥4,5:1 (Text) bzw. ≥3:1 (UI), siehe Farbtabelle
- Fokus-Ringe überall (`:focus-visible`)
- Skip-Link, Landmarks, `aria-label`s, sr-only-Texte
- Target-Size ≥24px (Checkboxen/Radios 24px, Touch-Ziele 44px)
- `prefers-reduced-motion` respektieren

## 9. Performance (Pflicht)
- **EINE CSS-Datei:** `css/site.min.css` (gebündelt aus tokens/base/layout/components/utilities) – nach CSS-Änderung `python3 build-css.py` ausführen
- Formular-Transitions nur `box-shadow` (keine border-color-Animation = nicht zusammengesetzt)
- `hero__headline` mit `min-height` (kein CLS durch Typewriter)
- Fonts lokal + `font-display: swap`, Preload kritischer Fonts

## 10. Konsistenz-Pflicht
Bei jeder Weiterentwicklung oder Wegfall von Bereichen: **Nav, Footer, Startseiten-Karten, Cross-Links, sitemap.xml und llms.txt mit anpassen** (Daniel-Vorgabe, in MEMORY.md verankert).

---

## 11. Astro-Umsetzung (ab 21.08.2026)

Seit Phase 8 ist der Astro-Stack der einzige produktive Stack. Alle Legacy-Dateien (root-HTML, css/, js/, build-css.py) sind entfernt.

### Seitenstruktur

Neue und bestehende Seiten sind `.astro`-Dateien in `src/pages/`. Die Dateinamen entsprechen exakt den Legacy-URLs (SEO-stabil). Jede Seite verwendet zwingend `BaseLayout.astro` als Layout.

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---
<BaseLayout title="Seitentitel – agentur dk" description="Meta-Description">
  <!-- Seiteninhalt -->
</BaseLayout>
```

`BaseLayout` übernimmt: `<head>` mit Meta-Tags, Canonical-Link, Font-Preload, JSON-LD-Slot, Skip-Link und `ConsentBanner`.

### Komponenten-Inventar

| Komponente | Datei | Funktion |
|---|---|---|
| Header | `Header.astro` | Nav + Dropdown (7 Leistungen) + CTA |
| Footer | `Footer.astro` | 4 Spalten, Gradient-Verlauf |
| CtaSection | `CtaSection.astro` | Abschluss-CTA mit Gradient |
| ServiceCard | `ServiceCard.astro` | Leistungskarte (Nummer + Icon + Text) |
| ReferenceCard | `ReferenceCard.astro` | Referenz-Karte (BMFSFJ, TARGOBANK, BFW) |
| LogoStrip | `LogoStrip.astro` | scrollende Kundenlogo-Leiste |
| StatsStrip | `StatsStrip.astro` | Kennzahlen-Strip (große Zahlen, Akzentblau) |
| FaqAccordion | `FaqAccordion.astro` | Akkordeon mit `details`/`summary` |
| TabNav | `TabNav.astro` | Tab-Navigation (TS-gesteuert) |
| LeadForm | `LeadForm.astro` | 2-Schritt-Kontaktformular (Honeypot + Zeitstempel + Seiten-Tracking) |
| BfsgCheck | `BfsgCheck.astro` | Interaktiver BFSG-Selbstcheck (Astro Island) |
| ConsentBanner | `ConsentBanner.astro` | Cookie-Einwilligungsbanner (Modal, Fokus-Trap) |

### Design-Tokens

Die Tokens aus `css/tokens.css` (Legacy) leben jetzt als Tailwind-`@theme`-Variablen in `src/styles/global.css`. Die Farb- und Typo-Tabellen in Abschnitt 1 und 2 dieses Guides bleiben verbindlich. `tokens.css` existiert nicht mehr — `global.css` ist die alleinige Quelle.

### Interaktive Logik

Alle JavaScript-Logik wurde in `src/lib/` als pure TypeScript-Module extrahiert und ist via vitest vollständig getestet:

| Modul | Inhalt |
|---|---|
| `bfsg-logic.ts` | 4 Fragen, 3 Ergebnis-Pfade, 15 Fußnoten |
| `quiz.ts` | Sie-Form-Selbstcheck |
| `consent.ts` | Consent-Verwaltung (localStorage, Pfad-Ausnahmen) |
| `form-validation.ts` | 2-Schritt-Formular-Validierung, Honeypot, Zeitstempel |

---
*Designguide gepflegt von OpenClaw – bei Unklarheiten in MEMORY.md oder dieser Datei nachsehen.*
