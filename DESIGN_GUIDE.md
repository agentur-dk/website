# 🎨 Designguide – agentur dk Website (dk-dk.de)

> **Zweck:** Dieser Guide ist die verbindliche Referenz für ALLE neuen Seiten und Weiterentwicklungen der agentur-dk-Website. Beim Bauen neuer Seiten: Guide lesen und umsetzen.
> **Stand:** 24.09.2026 · Eigenständiges Designsystem der agentur dk
>
> **Achtung, Abschnitt 1 ist veraltet.** Die Farbtabelle unten beschreibt
> die Fassung vor der monochromen Bildsprache (#121212 statt #101010, fette
> Überschriften statt Gewicht 400). Was tatsächlich ausgeliefert wird, steht
> in `src/styles/mono.css` und `src/styles/tokens/colors.css`. Die
> Abschnitte 2 und 3 sind am 24.09.2026 gegen den gebauten Stand geprüft
> und neu geschrieben.

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

## 2. Typografie — eine Leiter, keine Ausnahmen

**Stand 24.09.2026.** Vorher stand hier eine Skala, an die sich niemand
hielt: 205 `font-size`-Deklarationen mit 69 verschiedenen Werten, darunter
18 handgeschriebene `clamp()`. Im Browser gemessen waren 44 Schriftgrade
im Einsatz, drei Viertel aller Textstellen lagen neben der Skala. Sichtbar
wurde es an den Überschriften: `h1` maß 81,6 / 62,4 / 56 px je nach Seite,
`h2` sogar 12 / 58,8 / 46,8 / 35,2 / 19,2 px — auf `projekte.html` waren
`h2` und `h3` gleich groß.

### Die Schriften

| Einsatz | Schrift | Gewicht |
|---|---|---|
| Überschriften, Kennzahlen | **Space Grotesk** | 400 (die monochrome Bildsprache setzt keine fetten Überschriften) |
| Fließtext, Bedienelemente | **Manrope** | 400 / 500 / 600 / 700 |
| Etiketten, Nummern | System-Monospace | 400 |

Lokal gehostet in `public/fonts/`, kein CDN, `font-display: swap`,
vorgeladen werden Space Grotesk 400 und Manrope 400.

### Die Leiter

Ein Verhältnis (1 : 1,2), ein Anker (der Fließtext mit 19,2 px), und
jede Stufe trägt genau eine Aufgabe. **Der Name sagt die Aufgabe, nicht
die Größe** — wer „die nächstkleinere" sucht, erfindet eine neue Zahl;
wer „Kartentext" sucht, findet die eine richtige.

| Token | Größe | Aufgabe |
|---|---|---|
| `--dk-schrift-klein` | 13,3 px | Etiketten, Fußzeile, Hinweise, Kartennummern |
| `--dk-schrift-karte` | 16 px | Fließtext in Karten, Listen, Formularen |
| `--dk-schrift-text` | 19,2 px | Fließtext der Seite — **der Anker** |
| `--dk-schrift-vorspann` | 23 px | der Satz unter einer Überschrift |
| `--dk-schrift-titel-3` | 27,6 px | Kartenüberschriften, FAQ-Fragen, Schritte |
| `--dk-schrift-titel-2` | 33,2 → 39,8 px | Abschnittsüberschriften |
| `--dk-schrift-titel-1` | 39,8 → 57,3 px | Seitentitel |
| `--dk-schrift-hero` | 47,8 → 82,6 px | Hero der Startseite |

Die drei fließenden Grade laufen linear zwischen 390 px und 1440 px
Fensterbreite. Sie sind gerechnet, nicht geschätzt, und stehen in
`src/styles/tokens/typography.css` — **neue `clamp()` für Schriftgrade
gibt es nicht.** Ein viertes wäre eine vierte Meinung darüber, wie
Schrift mitwächst.

Überschriften überspringen je eine Stufe. Das ist Absicht: Zwischen
zwei Textgraden reicht ein Schritt von 1,2 — zwischen zwei
Überschriftenebenen sieht man ihn nicht mehr.

### Eine Regel je Ebene

Der Grad hängt an der **Ebene**, nicht an der Klasse:

```
h1   der Gegenstand der Seite          titel-1   (Startseite: hero)
h2   ein Abschnitt darin               titel-2
h3   ein Block im Abschnitt            titel-3
h4   Zwischenüberschrift im Fließtext  vorspann
```

Eine Klasse setzt einen Grad nur noch, wenn sie ausdrücklich etwas
anderes meint — ein Fußzeilen-Etikett ist ein `h2`, aber keine
Abschnittsüberschrift. Solche Stellen sind gezählt und benannt, nicht
verstreut.

### Laufweite

Jede Laufweite hängt an einem Grad, nicht an einem Bauteil: von
`-0,04em` beim Hero bis `+0,18em` beim Versal-Etikett. Vorher standen
26 frei gewählte Werte im Quelltext.

### Zeilenlänge

`--dk-measure-body` (68 Zeichen) gilt für jeden Fließtext. Vorher lief
er in den Referenzkarten über 105 Zeichen, auf `projekte.html` in 11 von
14 Absätzen über 80.

## 3. Layout — zwei Takte, sechs Rinnen, eine Kante

### Der senkrechte Rhythmus

Vorher trugen die Abschnitte fünf verschiedene Polster (80/80, 56/56,
40/48, 0/80, 80/112). Der Rhythmus ist die stillste Qualität einer
Seite; mit fünf Takten hat sie keinen.

| Token | Wert | Wo |
|---|---|---|
| `--dk-raum-abschnitt` | 56 → 80 px | jeder Abschnitt |
| `--dk-raum-abschnitt-weit` | 80 → 112 px | Hero und Abschluss — wo die Seite anfängt und aufhört |

Zwei abgeleitete Sonderfälle, beide begründet: Wo eine Rasterfläche **im**
Polster steht, wächst es um ihre Höhe — `calc(var(--raum-abschnitt-weit)
+ var(--rinne-4))`. Und zwei aufeinanderfolgende helle Abschnitte teilen
sich einen Zwischenraum statt zwei zu stapeln
(`.section--hell + .section--hell { padding-top: 0 }`).

### Die Rinnen

41 verschiedene `gap`-Werte standen im Quelltext. Sechs Stufen decken sie
ab, plus **eine** fließende für Hauptspalten:

```
--dk-rinne-1   8 px   Wortabstände, Zeilen einer Liste
--dk-rinne-2  12 px   Symbol und Beschriftung
--dk-rinne-3  16 px   Felder in einer Zeile
--dk-rinne-4  24 px   Karten in einem Raster
--dk-rinne-5  32 px   Spalten
--dk-rinne-6  48 px   Hauptspalten eines Abschnitts
--dk-rinne-spalte  32 → 48 px   die eine fließende
```

### Eine linke Kante

**Jede Abschnittsüberschrift beginnt auf derselben senkrechten Linie.**
Vorher saßen FAQ, Formular und Selbstcheck in einem 720-px-Kasten und
begannen 210 px weiter rechts als der Rest der Seite — beim Scrollen las
sich das wie ein eingeschobener Fremdkörper. Jetzt trägt jeder Abschnitt
denselben Kasten (1140 px), und die **Lesebreite sitzt am Inhalt**: die
FAQ-Liste, das Formular, die Fragenliste tragen sie selbst.

Zwei Ausnahmen, beide auf Seitenebene und deshalb unauffällig:
Impressum, Datenschutz und Barrierefreiheitserklärung sind Dokumente und
laufen ganz in der schmalen Spalte.

### Zentriert wird nichts, außer einer Tafel

Abschnittsüberschriften sind linksbündig — ausnahmslos. Das Etikett mit
dem kurzen Strich davor funktioniert nur am linken Satzrand. Zentriert
sein darf, was eine **eigene Tafel** ist: die Bestätigung nach dem
Absenden, ein eingelassener CTA-Kasten. Ein Abschnitt ist keine Tafel.

### Dunkel und hell

Hero dunkel, der Mittelteil hell, Kontakt und Abschluss auf der
Akzentfläche, Fußzeile dunkel. Container 1140 px (breit 1280, schmal
720), 24 px seitlich.

### Kontrast: nie unter die Sichtbarkeit

**Regel ab 25.09.2026, auf ausdrückliche Anweisung.** Kein Element wird in
einem Kontrastverhältnis ausgeliefert, in dem man es nicht erkennen kann —
auch keine Schmuckfläche, die kein Prüfwerkzeug beanstandet.

Auslöser war die gerasterte Fläche im Kartenkopf der Startseite. Sie wurde
in `dither.ts` fest in `#f3f3f3` gezeichnet; auf dunklem Grund richtig, auf
den weißen Karten Weiß auf Weiß. An den ausgelieferten Pixeln gemessen:

```
vorher    Muster rgb(220,220,220) auf Weiss    1,37 : 1
nachher   Muster rgb(148,148,148) auf Weiss    3,03 : 1
```

axe-core hatte nichts gemeldet — rein dekorative Grafiken sind von
WCAG 1.4.11 ausgenommen. Genau deshalb braucht es die eigene Regel.

**Die Farbe steht nicht mehr im Code.** Das Raster nimmt `currentColor`
und folgt damit dem Abschnitt, auf dem es liegt: auf Dunkel hell, auf Hell
dunkel. Der Kontrast wird im CSS entschieden, wo man sieht, worauf die
Fläche liegt.

`npm run check:kontrast` misst es nach: jede Seite, jede Fläche, die
Opazität der ganzen Elternkette, gemischt über den ersten undurchsichtigen
Grund darunter. Untergrenze 3 : 1.

> Der erste Entwurf dieser Prüfung las `getComputedStyle().color` und
> rechnete aus, was herauskommen *sollte*. Zur Gegenprobe wurde die alte
> Fassung wiederhergestellt — die Prüfung meldete weiter „alles in
> Ordnung". Sie maß die Absicht, nicht das Ergebnis. Jetzt zählt sie die
> Pixel, die wirklich auf der Leinwand stehen, und die Gegenprobe meldet
> die drei Flächen mit 1,04 : 1.

### Was das hält: `npm run check:typo`

`tools/check-typo.mjs` liest den Quelltext und meldet jede `font-size`
ohne Token, jedes Abschnittspolster ohne Takt, jede `gap` ohne Rinne,
jedes neue `clamp()` für einen Schriftgrad und jeden Token-Namen, den es
nicht gibt. Es läuft in `npm run verify`.

**Erlaubt ist genau eine Ausnahme, und sie ist benannt:** der
Sprachnachrichten-Block bildet auf ausdrückliche Anweisung eine
WhatsApp-Blase 1:1 nach und setzt dafür px-Grade. Jede weitere Ausnahme
muss im Skript eingetragen **und** im CSS begründet werden — das ist die
Hürde, die vorher fehlte.

> Beim ersten Lauf fand das Skript einen echten Fehler: Die 404-Seite
> setzte sechs Abstände gegen `var(--space-*)` — ein Token, den es
> nirgends gibt. CSS verschluckt eine unbekannte Variable stillschweigend,
> die Abstände fielen ersatzlos weg, und niemand hatte es gesehen.

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
