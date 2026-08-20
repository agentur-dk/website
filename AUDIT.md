# Technischer Website-Audit — agentur dk (dk-dk.de)

**Erstellt:** 2026-08-16  
**Auditor:** Senior Web-Auditor  
**Basis:** Live-Site Stand 15.08.2026 (Git-Snapshot)  
**Geprüfte Dateien:** index.html, bfsg-wordpress-website-agentur.html, impressum.html, datenschutz.html, barrierefreiheit.html, css/bootstrap.min.css, css/custom.css, js/*.js, fonts/*, images/*, robots.txt, sitemap.xml, llms.txt

---

## Astro-Migrationsstatus (Stand 21.08.2026)

**Alle Phasen der Astro-Migration abgeschlossen.** Der Legacy-Stack (plain HTML + build-css.py + css/ + js/) wurde vollständig entfernt.

| Phase | Commit | Inhalt | Status |
|---|---|---|---|
| 0/1 | afbfaca | Astro + Tailwind v4 Setup, BaseLayout, Header/Footer, Design-Tokens | ✅ |
| 2 | 308b9ba | Komponenten-Bibliothek (CtaSection, ServiceCard, ReferenceCard, LogoStrip, StatsStrip, FaqAccordion, TabNav, LeadForm) | ✅ |
| 3 | 95406c3 | 15 Seiten portiert (Content 1:1, gleiche URLs), Consent/Scroll-Reveal/BFSG/Quiz in Astro | ✅ |
| 4 | 573b8f3 | Logik in src/lib extrahiert + vitest-Tests + GitHub Actions Deploy-Pipeline | ✅ |
| 5 | 14565e6 | SEO-Dateien final (sitemap/robots/llms), Canonical-Links, Meta-1:1-Verifikation | ✅ |
| 8 | — | Legacy-Dateien entfernt, check-meta auf Snapshot, Doku aktualisiert | ✅ |

**Verifikationsergebnisse (Phase 8):**
- `npm run build` → 15 Seiten (komponenten-vorschau entfernt)
- `npm run check:links` → alle OK
- `npm run check:meta` → 0 Mismatches (14 Seiten gegen `tools/legacy-meta.json`)
- `npm test` → 74 Tests grün
- Kein Formspree, kein CDN in dist/

**Deploy:** Bereit – wartet auf `git push origin main` (GitHub Actions triggert automatisch).

---

## Executive Summary — Top 10 kritischste Findings

| # | Finding | Schweregrad | Kategorie |
|---|---------|------------|-----------|
| 1 | **Kein Favicon** auf keiner Seite vorhanden | 🔴 Kritisch | Technisch |
| 2 | **Alle Canonical-URLs relativ** (`canonical href="index.html"`) statt absolut | 🔴 Kritisch | SEO |
| 3 | **Social-Media-Links sind Platzhalter** — führen zu facebook.com, instagram.com usw., nicht zu Profilen | 🔴 Kritisch | Content |
| 4 | **Kein Cookie-Consent-Banner** trotz Cookies-Erwähnung in Datenschutz (DSGVO-Verstoß) | 🔴 Kritisch | Security/Recht |
| 5 | **Datenschutz nennt Google Analytics, kein GA-Code** im HTML — Datenschutzerklärung falsch oder Code vergessen | 🔴 Kritisch | Security/Recht |
| 6 | **Skip-Link-Selektor in JavaScript kaputt** auf allen 5 Seiten — Fokus-Handling für Tastaturnuzer funktioniert nicht | 🔴 Kritisch | Accessibility |
| 7 | **Kein `<nav>` Landmark in der Hauptnavigation** — Navigation im Header fehlt komplett auf index.html | 🔴 Kritisch | Accessibility/Semantik |
| 8 | **BFSG-Check-Formular selbst nicht barrierefrei** — Legend CSS-versteckt, Fragen nicht semantisch mit Radiogruppen verknüpft | 🔴 Kritisch | Accessibility/BFSG |
| 9 | **176 KB ungenutztes JavaScript** (jQuery, Skel, ScrollEx, ScrollY, main.js-Features) auf Bootstrap-5-Site | 🟠 Hoch | Performance |
| 10 | **Kein 404.html** vorhanden | 🟠 Hoch | Technisch |

---

## 1. HTML-Grundlagen & Semantik

### 🟢 Gut
- DOCTYPE, `lang="de"`, `charset="utf-8"`, `viewport` korrekt auf allen 5 Seiten
- `<main id="main-content">` korrekt gesetzt auf allen Seiten
- `<header>` und `<footer>` Landmarks vorhanden
- Genau eine `<h1>` pro Seite
- Heading-Hierarchie (h1→h2→h3→h4) ohne Sprünge auf bfsg, impressum, datenschutz
- `aria-hidden="true"` auf dekorativen Icons

### 🔴 Kritisch

**Kein primäres `<nav>` Landmark im Header** (`index.html`, alle Seiten)  
Der Header auf `index.html` (Zeilen 485–492) enthält ausschließlich ein leeres `<div class="header-logo">` mit Kommentaren — kein Logo, keine Navigation, kein sichtbarer Inhalt. Auf den anderen Seiten ist zwar ein Logo im Header, aber kein `<nav>`-Element. WCAG 2.2 SC 1.3.6 und BFSG erfordern identifizierbare Navigationsbereiche via Landmarks. Screenreader-Nutzer finden keine Hauptnavigation.

### 🟠 Hoch

**Skip-Link zeigt auf absolute Seiten-URL statt Fragment** (alle 5 Seiten)  
Alle Skip-Links verwenden `href="index.html#main-content"` statt `href="#main-content"`. Dadurch löst der zugehörige JS-Selektor `document.querySelector('a[href="#main-content"]')` (Zeile 892, index.html) nie aus — kein Match. Das Fokus-Handling via `main.focus()` ist auf allen Seiten **komplett wirkungslos**. Die Seiten führen stattdessen eine vollständige Navigation durch, ohne Fokus zu setzen.

**Leerer Header auf index.html** (`index.html`, Zeilen 485–492)  
```html
<header class="site-header header-overlay">
  <div class="container">
    <div class="header-logo">
      <!-- Logo oder Titel, hier erst mal visuell versteckt ... -->
    </div>
  </div>
</header>
```
Die Seite hat keinen sichtbaren Header-Inhalt. Das ist ein schwerwiegendes UX- und SEO-Problem (kein Logo, keine Navigation oberhalb des Heroes).

### 🟡 Mittel

**Footer-Spaltenüberschriften als `<span>` statt `<h>` Heading** (alle Seiten, z.B. `index.html` Zeile 841)  
`<span class="headline d-block fw-bold mb-2">Gefragte Leistungen</span>` — ohne semantischen Heading-Level kein Zugangspunkt für Screenreader-Nutzer in der Fußzeile.

**`<br><br>` für vertikalen Abstand** (`index.html`, Zeile 546)  
Layoutabstände gehören ins CSS, nicht als semantiklose Leerzeilen ins Markup.

**Heading `h2` mit `d-none` auf index.html** (Zeilen 542–545)  
Ein `<h2 class="d-none ...">` ist für alle Nutzer (einschließlich Screenreader bei `display:none`) unsichtbar. Entweder ist es inhaltlich relevant (dann zeigen) oder es sollte entfernt werden.

**Inline-`style`-Attribute verbreitet** (`index.html`, `bfsg-wordpress-website-agentur.html`)  
`style="max-width: 900px;"`, `style="background-image: linear-gradient(...)"` usw. — erschwert Wartung und widerspricht dem Separation-of-Concerns-Prinzip.

---

## 2. SEO

### 🟢 Gut
- Title-Tags unique auf allen 5 Seiten ✅
- Meta Descriptions unique, alle im Zielbereich 85–160 Zeichen ✅
- `robots: index, follow` auf indexierten Seiten ✅
- `robots: noindex, follow` auf impressum/datenschutz korrekt ✅
- Open Graph vorhanden auf index + bfsg ✅
- Twitter Cards vorhanden auf index + bfsg ✅
- JSON-LD Schema vorhanden (Organization, WebPage, FAQPage) ✅
- robots.txt strukturell korrekt, verweist auf sitemap ✅
- sitemap.xml mit absoluten URLs ✅

### 🔴 Kritisch

**Alle Canonical-URLs sind relative Pfade** (alle 5 Seiten)

| Seite | Ist | Soll |
|-------|-----|------|
| `index.html` Zeile 14 | `href="index.html"` | `href="https://dk-dk.de/"` |
| `bfsg-...html` Zeile 12 | `href="bfsg-wordpress-website-agentur.html"` | `href="https://dk-dk.de/bfsg-wordpress-website-agentur.html"` |
| `impressum.html` Zeile 9 | `href="impressum.html"` | `href="https://dk-dk.de/impressum.html"` |
| `datenschutz.html` Zeile 11 | `href="datenschutz.html"` | `href="https://dk-dk.de/datenschutz.html"` |
| `barrierefreiheit.html` Zeile 9 | `href="barrierefreiheit.html"` | `href="https://dk-dk.de/barrierefreiheit.html"` |

Relative Canonical-Tags werden von Google zwar interpretiert, sind aber fehleranfällig (z.B. bei CDN, Redirects, lokalen Entwicklungsumgebungen). Standard ist der vollständige absolute URL.

### 🟠 Hoch

**JSON-LD: Organization.logo zeigt auf OG-Image** (`index.html`, Zeile 35)  
`"logo": "https://dk-dk.de/images/og-image-website.png"` — ein Foto/OG-Bild ist kein Logo. Google's Structured Data Guidelines verlangen ein dediziertes Logobild (idealerweise quadratisch oder Breitformat, PNG mit Transparenz). Das OG-Bild hat 210 KB als PNG-Screenshot/Preview, kein Logo.

**Fehlende `og:locale` auf allen Seiten**  
Ohne `<meta property="og:locale" content="de_DE">` kann Facebook/LinkedIn nicht korrekt die Sprache bestimmen.

**Fehlende LocalBusiness-Schema** für lokale Sichtbarkeit  
Eine Kölner Agentur sollte `"@type": "LocalBusiness"` (oder `ProfessionalService`) mit `address`, `geo`, `openingHours`, `priceRange` in JSON-LD haben für Google Business-Integration.

**sitemap.xml: lastmod-Daten veraltet** (`sitemap.xml`)  
Alle Seiten zeigen `<lastmod>2026-01-28</lastmod>` — Stand ca. 7 Monate vor dem Audit-Datum. Die Seiten wurden seitdem offenbar geändert (git-Commits zeigen "Initial: dk-dk.de als Basis für Relaunch"). Veraltete lastmod-Werte können Crawl-Budget-Verschwendung verursachen.

### 🟡 Mittel

**Kein `<meta name="twitter:site">` Tag**  
Ohne den Twitter-Handle ist die Twitter Card-Attribution lückenhaft.

**Title `bfsg-wordpress-website-agentur.html`**: 47 Zeichen (leicht unter dem Zielwert 50–60).  
Potenzial: `BFSG WordPress Agentur Köln | Barrierearme Websites` (53 Zeichen).

**Terminkonsistenz SEO-Keywords:**  
Die Seite wechselt zwischen „barrierearme", „barrierefreie" und „barrierearm" — drei unterschiedliche Varianten desselben Begriffs. Da das BFSG selbst „barrierefrei" verwendet, sollte ein konsequentes Primär-Keyword definiert werden.

---

## 3. Accessibility / WCAG 2.2 + BFSG

### 🟢 Gut
- Skip-Links auf allen Seiten vorhanden (HTML-Struktur korrekt, JS-Fix nötig)
- `aria-hidden="true"` auf dekorativen FontAwesome-Icons ✅
- `aria-label` auf Social-Media-Links mit "(öffnet in neuem Fenster)" ✅
- `aria-label` auf CTA-Buttons ✅
- `prefers-reduced-motion` für Typewriter-Effekte berücksichtigt ✅
- Footer-Navs mit `aria-label` zur Unterscheidung ✅
- `<time datetime="2025-02-19">` in barrierefreiheit.html ✅
- Farbkontrast Primärblau (#1C60AD) auf Weiß: ~6,7:1 (WCAG AA ✅)
- `focus-visible`-Styles in impressum.html (gelb, 3px) und via custom.css ✅

### 🔴 Kritisch

**BFSG-Check-Formular nicht barrierefrei** (`bfsg-wordpress-website-agentur.html`)

Das interaktive Herzstück der BFSG-Seite hat mehrere Barrierefreiheits-Probleme:

1. **Legend wird CSS-versteckt** (Zeile 506): `.step-content legend { display: none; }` — das `<legend>`-Element, das die Radiogruppe beschreiben würde, ist komplett versteckt. Für Screenreader gibt es damit keine Gruppenbezeichnung.
2. **Frage-Text ist ein `<span>`** (Zeile 469): `<span class="question-text">Erbringen Sie Dienstleistungen?</span>` statt `<legend>`. Screenreader lesen die Frage nicht als Beschriftung der Radiogruppe vor.
3. **Keine `<fieldset>`-Gruppierung** der Radiobuttons: Ohne explizites Fieldset/Legend ist die Zuordnung von Frage zu Antwortoptionen für assistive Technologie nicht nachvollziehbar.
4. **Keyboard-only-User**: Wenn eine Wahl getroffen wird (`change`-Event), wechselt der nächste Schritt ohne Fokus-Management — Fokus bleibt auf dem gerade geklickten Element, der neue Step erscheint sichtbar aber Fokus ist woanders.

**Eine BFSG-Accessibility-Agentur, die im eigenen Check-Tool WCAG-Verstöße produziert, ist ein erheblicher Reputationsschaden.**

**Skip-Link-Selektor-Bug** (alle Seiten — identischer Code, alle Seiten z.B. `index.html` Zeile 892)
```js
const skip = document.querySelector('a[href="#main-content"]');  // findet nichts
// tatsächlicher Link: <a href="index.html#main-content" ...>
```
Die JS-Handler für Skip-Links sind auf allen Seiten komplett wirkungslos.

### 🟠 Hoch

**Kein primärer Navigations-Landmark** auf keiner Seite  
Header enthält kein `<nav>` Element. WCAG 2.4.1 (Bypass Blocks) und 1.3.6 (Identify Purpose) setzen identifizierbare Navigations-Landmarks voraus. Ohne `<nav>` können Screenreader-Nutzer nicht per Landmark-Navigation zur Hauptnavigation springen.

**Social-Icon-Links im Footer haben zu kleine Touch-Targets**  
Die Icons sind nur `14px` FontAwesome-Icons ohne nennenswerten Padding-Bereich. WCAG 2.2 SC 2.5.8 (Minimum Target Size) fordert mindestens 24×24 CSS-Pixel. Tatsächlich fehlen konkrete Größenangaben für `.social a` in custom.css.

**`text-white-50` im Footer: potenzielle Kontrastprobleme**  
`opacity: 0.5` auf weißem Text über schwarzem Hintergrund ergibt #808080 = ~4,5:1 Kontrast (knapp AA für großen Text, unter AA für Fließtext). Links in Footer-Navigation mit `text-white-50` können unter AA-Grenzwert fallen.

### 🟡 Mittel

**`barrierefreiheit.html` referenziert WCAG 2.1** (Zeile 37), während `bfsg-wordpress-website-agentur.html` und `custom.css` WCAG 2.2 nennen. Die Erklärung zur Barrierefreiheit ist damit nicht konsistent mit dem beworbenen Leistungsumfang.

**`barrierefreiheit.html` lädt kein Critical CSS inline** — die Seite lädt Bootstrap und custom.css nur via `media="print"` Trick, hat aber keinen `<style>`-Block mit Basis-Stilen. Bei verzögertem CSS-Load gibt es keine Focus-Styles.

**`impressum.html` Skip-Link nutzt eigene `.screen-reader` Klasse** (Zeile 57), definiert die Klasse aber nicht inline — sie kommt aus custom.css, das asynchron geladen wird. Vor CSS-Load ist Skip-Link nicht sichtbar.

**`<a>` mit `data-tf-popup` statt `<button>` für Typeform-Trigger** (`index.html`, Zeile 758)  
Ein `<a>` ohne `href` mit `style="cursor:pointer;"` ist kein aktivierbares Element per Tastatur. Sollte `<button>` sein.

---

## 4. Performance

### 🟢 Gut
- CSS-Loading via `media="print"` + `onload` (render-blocking vermieden) ✅
- `<noscript>`-Fallback für CSS ✅
- Font Preloads für alle 3 Roboto-Mono-Gewichte ✅
- `font-display: swap` ✅
- Alle Fonts selbst-gehostet (kein Google Fonts Request) ✅
- Typeform-Script nur auf index.html, `defer` gesetzt ✅
- Alle Scripts mit `defer` ✅

### 🔴 Kritisch

**176 KB ungenutztes JavaScript — jQuery-Stack auf Bootstrap-5-Site**

| Datei | Größe | Status |
|-------|-------|--------|
| `jquery.min.js` | 84 KB | Benötigt nur von Legacy-Scripts |
| `skel.min.js` | 8,9 KB | **Vollständig ungenutzt** — HTML5 UP Template-Library |
| `jquery.scrollex.min.js` | 2,2 KB | Ungenutzt — kein `$(...).scrollex()` in HTML |
| `jquery.scrolly.min.js` | 0,8 KB | Ungenutzt — kein `$(...).scrolly()` in HTML |
| `util.js` | 6,3 KB | `$.fn.navList()`, `$.fn.panel()`, `$.fn.placeholder()` — keine Aufrufe im HTML |
| **Gesamt** | **~102 KB** | Davon abhängig: `main.js` (teilweise) |

Bootstrap 5 benötigt kein jQuery. `skel.min.js` ist eine Responsive-Library eines alten HTML5-UP-Templates und hat auf dieser Seite keine Funktion.

### 🟠 Hoch

**FontAwesome 4.6.3 — 5 Font-Formate, 764 KB, Vintage 2016**

| Datei | Größe | Relevanz |
|-------|-------|----------|
| `fontawesome-webfont.svg` | 382 KB | Kein moderner Browser nutzt SVG-Fonts |
| `fontawesome-webfont.ttf` | 149 KB | Nur für IE9 und frühe Android nötig |
| `fontawesome-webfont.eot` | 75 KB | Nur für IE8 |
| `fontawesome-webfont.woff` | 88 KB | Legacy-Fallback |
| `fontawesome-webfont.woff2` | 70 KB | Das einzig benötigte Format |

Es werden nur ~12 Icons der gesamten ~600-Icons-Library genutzt. Empfehlung: Auf eine SVG-Icon-Lösung (Inline SVG / Bootstrap Icons) oder auf ein Subset-Font wechseln. Einsparung: ~690 KB Serverspace, schnellere Übertragung.

**Kritisches CSS massiv dupliziert (Wartungs-Albtraum)**

Jede der 5 HTML-Seiten enthält identische `<style>`-Blöcke mit 200–450 Zeilen CSS:
- `@font-face` Definitionen (Roboto Mono + FontAwesome)
- `:root` Custom Properties
- `html`, `body`, Heading-Styles
- Utility-Klassen (`.mb-4`, `.py-5`, `.d-flex`, etc.)
- Button-Styles

Diese Styles sind zusätzlich in `custom.css` definiert. Und Bootstrap 5 definiert die Utility-Klassen nochmals. Das ergibt eine **dreifache Definition** derselben Regeln. Das ist kein Performance-Problem (Browser cachen inline CSS nicht), aber ein erhebliches Maintainability-Problem — eine Änderung an einer Farbe muss an 5+ Stellen gepflegt werden.

**Bootstrap 5 (227 KB) für minimale Anforderungen**  
Die Site nutzt Bootstrap primär für Grid-System und Accordion. Diese Funktion könnte mit <20 KB Custom CSS abgebildet werden.

**`og-image-website.png` (210 KB) nicht optimiert**  
Das einzige Bild im Projekt als PNG. Als WebP könnte es auf ~80–100 KB reduziert werden.

### 🟡 Mittel

**`main.js` enthält toten Code** (Zeilen für Gallery/Lightbox, IE-Fixes, Object-fit-Fallback, `#navPanel`):
- `$('.thumbnails a')` — kein `.thumbnails` im HTML
- `$('#navPanel')` — kein `#navPanel` im HTML  
- IE flexbox fixes, object-fit Fallback — IE ist seit 2022 EOL

**`typeform-embed.js` lokal gespeichert** (62 KB) statt via Typeform CDN — verpasst automatische Updates, mögliche Versions-Diskrepanz.

---

## 5. CSS-Qualität

### 🟢 Gut
- CSS Custom Properties für Farb-Palette konsistent ✅
- `font-display: swap` in allen @font-face ✅
- `prefers-reduced-motion` berücksichtigt ✅
- Mobile-Breakpoints definiert (768px, 576px) ✅
- `clamp()` für responsive H1 ✅

### 🟠 Hoch

**Dreifache Utility-Klassen-Definitionen**  
Klassen wie `.mb-4`, `.py-5`, `.d-flex`, `.text-center` sind definiert in:
1. Bootstrap 5 (`css/bootstrap.min.css`)
2. Inline `<style>`-Block (jede HTML-Seite)
3. `css/custom.css`

Das führt zu Konflikten durch `!important`-Kaskaden und erschwert Debugging.

**`!important` extensiv im Inline-CSS** (`index.html`, bfsg-Seite)  
`border-radius: 0 !important` auf `*, *::before, *::after` überschreibt alle Bootstrap-Elemente. Buttons, Inputs, Accordions verlieren ihre Bootstrap-Radii, was mit spezifischeren Regeln wieder mühsam zurückgesetzt werden muss.

**Inline-Styles für Layout-Entscheidungen**

| Datei | Zeile | Inline-Style |
|-------|-------|--------------|
| `index.html` | 498 | `style="max-width: 900px;"` |
| `index.html` | 739 | `style="background-image: linear-gradient(...)"` (komplexer Gradient) |
| `index.html` | 785 | `style="font-size: 1.25rem;"` |
| `bfsg-...html` | 1030 | `style="background:var(--primary); color:white;"` |
| Footer (alle) | multiple | `style="font-size: 0.9rem;"`, `style="border-color: rgba(...)"` |

### 🟡 Mittel

**`header-tagline`-Klasse in inline `<style>` der bfsg-Seite definiert** (Zeile 299–308), fehlt aber im Critical-CSS von index.html, obwohl der Header auf index.html semantisch gleich sein sollte.

**`font-size: 18px` in HTML statt `rem`-Basis** — `html { font-size: 18px }` sollte `font-size: 112.5%` (18/16) sein, damit Nutzer-Browser-Schriftgröße respektiert wird.

**`border: 0 !important` auf `.visually-hidden` / `.screen-reader`** — korrekt, aber `clip` ist deprecated zugunsten von `clip-path: inset(50%)`.

---

## 6. JavaScript-Qualität

### 🟢 Gut
- `textContent` statt `innerHTML` in Typewriter-Effekt (kein XSS) ✅
- `prefers-reduced-motion` check vor Animationen ✅
- `IntersectionObserver` für Scroll-Animationen (modern, effizient) ✅
- BFSG-Check-Logik in IIFE gekapselt ✅
- `defer` auf allen Script-Tags ✅

### 🔴 Kritisch

**`skel.min.js` ohne Funktion geladen** (alle Seiten, 8,9 KB)  
Diese Library eines alten HTML5 UP-Templates wird auf keiner Seite aufgerufen. Sie belastet den JavaScript-Parse-Tree unnötig.

**`util.js` ohne Funktion** (alle Seiten, 6,3 KB)  
Stellt jQuery-Extensions bereit (`$.fn.navList`, `$.fn.panel`, `$.fn.placeholder`), die im aktuellen HTML-Markup nirgendwo aufgerufen werden.

### 🟠 Hoch

**`main.js` referenziert nicht-existente DOM-Elemente** (alle Seiten)  
```js
$('.thumbnails a')  // kein .thumbnails im HTML
$('#navPanel')      // kein #navPanel im HTML
```
Beide Queries geben leere jQuery-Objekte zurück — kein Fehler, aber toter Code der zur Verwirrung führt.

**`document.write(new Date().getFullYear())` im Footer** (alle Seiten)  
`document.write()` nach dem Parsen des Dokuments blockiert den Renderer in bestimmten Szenarien. Moderne Alternative: ein Element mit ID und `textContent`-Zuweisung.

**BFSG-Check-Script außerhalb von `DOMContentLoaded`** (`bfsg-wordpress-website-agentur.html`, Zeile 1183)  
Das BFSG-Check-IIFE läuft unmittelbar beim Script-Parsing. Da `defer` gesetzt ist, ist das DOM verfügbar — kein Fehler, aber inkonsistent mit dem `DOMContentLoaded`-Muster auf derselben Seite.

### 🟡 Mittel

**Duplizierter Typewriter-Code** (`index.html` Zeile 891–942, Wiederholung in bfsg, impressum, datenschutz)  
Identischer `twObserver`-Block zur Animation von "Kontakt"-Headings ist in mindestens 4 HTML-Dateien inline kopiert. Gehört in die externe `main.js`.

**`typeform-embed.js` lokal** (`index.html`, Zeile 759) — Typeform kann API-Änderungen einführen, die die lokale Datei veralten lassen.

---

## 7. Security

### 🟢 Gut
- Alle externen Links mit `https://` ✅
- Externe Links mit `rel="noopener"` ✅
- Social-Links mit `rel="me noopener"` ✅
- Alle Fonts selbst-gehostet (kein Third-Party GDPR-Risiko durch Google Fonts) ✅
- Kein Google Maps, kein YouTube-Embed ✅
- `textContent` statt `innerHTML` in allen JS-Manipulationen ✅

### 🔴 Kritisch

**Datenschutz nennt Google Analytics — kein GA-Code** (`datenschutz.html`, Zeile 416–419)  
Die Datenschutzerklärung beschreibt den Einsatz von Google Analytics mit IP-Anonymisierung (`_gat._anonymizeIp`), aber in keiner der 5 HTML-Dateien findet sich ein GA-Tracking-Code (gtag.js, analytics.js, ga()). 

Zwei mögliche Szenarien:
- **GA wurde entfernt, Datenschutz nicht aktualisiert** → Datenschutzerklärung ist falsch (nennt nicht vorhandene Tools)
- **GA soll noch eingebunden werden** → darf ohne Cookie-Consent-Banner nicht geschehen

In beiden Fällen: sofortiger Handlungsbedarf.

**Kein Cookie-Consent-Banner / Consent-Management**  
Die Datenschutzerklärung nennt Cookies und Logfiles. Typeform setzt beim Popup ebenfalls Cookies. Nach DSGVO und dem Urteil des BGH (Cookie-II, 2020) ist für nicht-technisch-notwendige Cookies eine informierte Einwilligung erforderlich. Kein Consent-Banner vorhanden.

### 🟠 Hoch

**Impressum unvollständig** (`impressum.html`)  
Fehlende Pflichtangaben nach deutschem Recht:

| Angabe | Status | Rechtsgrundlage |
|--------|--------|-----------------|
| ODR-Plattform-Link (OS-Streitbeilegung) | ❌ fehlt | EU-Verordnung 524/2013, § 36 VSBG |
| Hinweis zur Streitbeilegung (§ 36 VSBG) | ❌ fehlt | § 36 VSBG |
| USt-IdNr. oder Hinweis auf Befreiung | ❌ fehlt | § 5 Abs. 1 Nr. 6 TMG |
| Berufshaftpflicht (falls anwendbar) | ❓ unklar | Branchenabhängig |

Der Link auf die OS-Plattform (`https://ec.europa.eu/consumers/odr/`) ist für B2C-Anbieter Pflicht.

### 🟡 Mittel

**Typeform-Privacy-Link zeigt auf Admin-URL** (`datenschutz.html`, Zeile 424)  
`https://admin.typeform.com/to/dwk6gt` ist ein Typeform-Admin-Link, keine öffentliche Datenschutzseite. Der korrekte Link wäre die öffentliche Typeform-Datenschutzrichtlinie.

**Soziale Links als Platzhalter** — alle Social-Links führen zu Plattform-Homepages. Damit können Nutzer die Agentur auf diesen Plattformen nicht finden, obwohl die Links Vertrauen suggerieren.

---

## 8. Responsive / Mobile

### 🟢 Gut
- Viewport-Meta auf allen Seiten ✅
- `max-width: 100%; overflow-x: hidden` gegen horizontales Scrollen ✅
- Responsive Breakpoints 768px und 576px definiert ✅
- BFSG-Check-Buttons: `min-height: 120px` (gute Touch-Targets) ✅
- `flex-wrap` auf Button-Gruppen ✅
- Schriftgröße auf Mobile reduziert (16px bei ≤768px, 15px in custom.css) ✅

### 🟠 Hoch

**Social-Icons im Footer — zu kleine Touch-Targets**  
Die Footer-Social-Icons sind nur FontAwesome `14px`-Icons ohne ausreichende Padding-Area. WCAG 2.2 SC 2.5.8 fordert ≥24×24 px effektive Touch-Target-Größe. Das betrifft alle 5 Seiten.

**Hero-Section auf index.html ohne Hauptnavigation**  
Auf Mobile gibt es keine Hamburger-Menu-Navigation. Die einzigen Aktions-Links sind die beiden CTA-Buttons im Hero. Nutzer können direkt zu keiner anderen Seite navigieren (außer über Footer-Links, die auf Mobile weit unten liegen).

### 🟡 Mittel

**`min-vh-100` auf About-Section** (`index.html`, Zeile 740) — erzwingt 100vh Mindesthöhe für den About-Bereich. Auf Mobile kann das zu einer leeren, unübersichtlichen Sektion führen.

**`p-md-5`-Inline-Style** (`index.html`, Zeile 498): `style="max-width: 900px;"` auf dem Hero-Content-Div wird auf Mobile nicht überschrieben. Das funktioniert nur weil `overflow-x: hidden` greift.

---

## 9. Content

### 🟢 Gut
- Klare Hauptbotschaft und BFSG-Fokus ✅
- FAQ-Sektion auf BFSG-Seite mit korrekten JSON-LD-Antworten ✅
- Prozess-Darstellung (5 Schritte) übersichtlich ✅
- Kontaktdaten konsistent in Header, Footer, Impressum, Datenschutz ✅
- llms.txt vorhanden mit relevanten Informationen ✅
- BFSG-Check mit sinnvoller Logik (Kleinstunternehmen-Ausnahme korrekt) ✅

### 🔴 Kritisch

**Alle Social-Media-Links sind generische Platzhalter** (`index.html` Zeilen 789–812, bfsg, impressum, datenschutz, barrierefreiheit)

| Icon | Href |
|------|------|
| Facebook | `https://www.facebook.com/` |
| Instagram | `https://www.instagram.com/` |
| Twitter | `https://twitter.com/` |
| Xing | `https://www.xing.com/` |
| Pinterest | `https://www.pinterest.de/` |
| LinkedIn | `https://www.linkedin.com/` |
| YouTube | `https://www.youtube.com/` |
| Spotify | `https://open.spotify.com/` |

Das JSON-LD in `index.html` (Zeile 44) enthält hingegen den korrekten LinkedIn-Link: `https://www.linkedin.com/in/daniel-kontelis/`. Die 8 Footer-Social-Links führen alle auf die generischen Plattform-Homepages — ein erheblicher Vertrauens- und Credibility-Schaden auf einer Live-Site.

**Kein 404.html vorhanden**  
Bei fehlerhaften URLs gibt der Webserver eine generische Fehlerseite aus. Eine gebrandete 404-Seite mit Navigation verhindert Nutzerfrustration und erhält SEO-Kontext.

### 🟠 Hoch

**Header auf index.html komplett leer**  
Kein Logo, kein Name der Agentur, keine Navigation. Erstbesucher sehen sofort den Hero, aber keinen Kontext, wer die Agentur ist. Die anderen Seiten (bfsg, impressum etc.) haben Logos im Header — `index.html` nicht.

**Kein primäres Navigationsmenü** auf keiner Seite  
Nutzer können nur über Footer-Links oder explizite CTAs zwischen Seiten navigieren. Für SEO fehlen interne Verlinkungen von Header-Nav.

### 🟡 Mittel

**Widerspruch WCAG 2.1 vs. WCAG 2.2** (`barrierefreiheit.html`, Zeile 37)  
"WCAG 2.1 Level A/AA" vs. `custom.css`-Kommentar "WCAG 2.2 AA" vs. `bfsg-wordpress-website-agentur.html` "WCAG 2.2". Die Barrierefreiheitserklärung sollte den tatsächlich angestrebten Standard korrekt benennen.

**Service-Card "WordPress Agentur Köln"** enthält Sub-Items "Print on Demand", "Automatisierungen", "Beteiligungsmodelle möglich" (`index.html`, Zeilen 672–676) — inhaltlich unpassend unter "WordPress Agentur Köln". Verwirrender Nutzen-Kommunikation.

**`impressum.html`: Referenz zu § 55 Abs. 2 RStV** (Zeile 107)  
Der RStV wurde 2020 durch den MStV (Medienstaatsvertrag) abgelöst. Die korrekte Referenz wäre § 18 Abs. 2 MStV.

**Datenschutz: Accordion-Abschnitt 4 beschreibt Google Analytics-Implementierung aus ~2018**  
`_gat._anonymizeIp` ist ein veraltetes GA-Universal-Analytics-Feature (UA wurde 2023 abgeschaltet). Der aktuelle GA4-Standard funktioniert anders. Falls GA wieder eingebunden werden soll, muss die Datenschutzerklärung GA4-konform aktualisiert werden.

**llms.txt: Social Recruiting nicht erwähnt**  
Das Social-Recruiting-Angebot wird prominent auf der Startseite beworben, fehlt aber komplett in `llms.txt`.

---

## 10. Technische Standards

### 🟢 Gut
- `robots.txt` korrekt formatiert mit Sitemap-Verweis ✅
- sitemap.xml valide XML-Struktur ✅
- HTTPS-Links durchgängig ✅
- `llms.txt` vorhanden — zukunftsorientierter Standard für KI-Crawler ✅
- `.noscript`-Fallbacks für CSS-Loading ✅
- Relative interne Verlinkung (funktioniert unabhängig von Domain) ✅

### 🔴 Kritisch

**Kein Favicon vorhanden** (alle 5 Seiten)  
`index.html` Zeile 66–67 enthält nur einen Kommentar:
```html
<!-- Favicon (Assuming standard location if exists, otherwise placeholder) -->
```
Weder `favicon.ico`, noch `favicon.png`, noch `apple-touch-icon.png` existieren im Projekt. Browser-Tabs zeigen das Standard-Browser-Icon. Kein `<link rel="icon">` Tag auf keiner Seite.

**Kein 404.html** im Projekt vorhanden.

### 🟠 Hoch

**sitemap.xml enthält nur 3 von 5 Seiten**  
Impressum und Datenschutz sind korrekt ausgeschlossen (noindex). Aber `barrierefreiheit.html` steht auf `index, follow` — in sitemap korrekt aufgeführt. Kein Fehler, aber zur Vollständigkeit: Falls neue Seiten hinzukommen, muss Sitemap manuell gepflegt werden (kein CMS-Auto-Update).

**Alle `lastmod`-Dates in sitemap.xml auf 2026-01-28 festgeschrieben**  
Keine der Seiten hat ihr `lastmod` seit dem Relaunch aktualisiert. Das kann Googles Crawl-Budget-Planung negativ beeinflussen.

### 🟡 Mittel

**`document.write()` für Copyright-Jahr** (Footer aller Seiten)  
```html
&copy; <script>document.write(new Date().getFullYear())</script> agentur dk
```
Veraltetes Anti-Pattern. Modern: `<span id="year"></span>` + `document.getElementById('year').textContent = new Date().getFullYear()`.

**Robots.txt disallowt nicht-existente Pfade**  
`Disallow: /kunden/`, `/downloads/`, `/agenturvorstellung/`, `/letter/` — diese Verzeichnisse existieren im aktuellen Projekt nicht. Auf dem Live-Server möglicherweise vorhanden, aber nicht im geprüften Stand ersichtlich.

**Kein `<meta name="theme-color">` für mobile Browser**  
Moderne mobile Browser nutzen `theme-color` für die Browser-Chrome-Farbe. Eine schwarze oder primärblau Chrome passend zur CI wäre möglich.

**`<meta name="color-scheme" content="light dark">` nur auf bfsg-Seite** (Zeile 11) — inkonsistent, entweder auf alle Seiten oder keine.

---

## Priorisierte Empfehlungs-Liste

### Quick Wins (1–2 Stunden, sofortiger Impact)

| Priorität | Maßnahme | Aufwand | Impact |
|-----------|----------|---------|--------|
| 1 | **Favicon erstellen und verlinken** — `favicon.ico` + `favicon.png` 32×32 + `apple-touch-icon.png` 180×180 + `<link rel="icon">` in allen 5 Seiten | 30 min | Hoch (Professionaliät, Branding) |
| 2 | **Social-Media-Links korrigieren** — Entweder auf echte Profile verlinken oder Icons aus Footer entfernen | 15 min | Kritisch (Credibility) |
| 3 | **Canonical-URLs auf absolut umstellen** — Alle 5 Seiten, `href="https://dk-dk.de/..."` | 15 min | Hoch (SEO) |
| 4 | **Skip-Link-Href auf Fragment ändern** — `href="#main-content"` statt `href="page.html#main-content"` in allen 5 Seiten | 15 min | Kritisch (Accessibility) |
| 5 | **sitemap.xml lastmod-Dates aktualisieren** | 5 min | Mittel (SEO) |
| 6 | **§ 55 Abs. 2 RStV → § 18 Abs. 2 MStV** in impressum.html | 2 min | Mittel (Recht) |

### Kurzfristig (1–3 Tage, kritische Compliance)

| Priorität | Maßnahme | Aufwand | Impact |
|-----------|----------|---------|--------|
| 7 | **Cookie-Consent-Banner implementieren** (z.B. Klaro.js, Cookiebot) — vor allem wenn GA reaktiviert wird | 1–2 Tage | Kritisch (DSGVO) |
| 8 | **Datenschutzerklärung bereinigen** — GA-Abschnitt entfernen oder GA4-konform aktualisieren; Typeform-Link korrigieren | 2 Std. | Kritisch (Recht) |
| 9 | **Impressum-Pflichtangaben ergänzen** — ODR-Link, § 36 VSBG Hinweis, USt-IdNr.-Klärung | 1 Std. | Hoch (Recht) |
| 10 | **BFSG-Check-Formular barrierefrei machen** — `<fieldset>` + `<legend>` für jede Frage, Fokus-Management nach Step-Wechsel, Legend nicht CSS-verstecken | 4–8 Std. | Kritisch (Reputiation/BFSG) |
| 11 | **Primäre Navigation erstellen** — `<nav>` im Header mit Links zu allen Hauptseiten | 2–4 Std. | Hoch (UX/Accessibility) |
| 12 | **Header auf index.html sichtbar machen** — Logo + Agenturname + Navigation einfügen | 1–2 Std. | Hoch (UX/Branding) |

### Mittelfristig (1–2 Wochen, Performance & Qualität)

| Priorität | Maßnahme | Aufwand | Impact |
|-----------|----------|---------|--------|
| 13 | **jQuery-Stack entfernen** — `jquery.min.js`, `skel.min.js`, `util.js`, `jquery.scrollex.min.js`, `jquery.scrolly.min.js` entfernen oder durch Native JS ersetzen (~176 KB Einsparung) | 1 Tag | Hoch (Performance) |
| 14 | **main.js aufräumen** — Toten Code (Gallery, navPanel, IE-Fixes) entfernen, Typewriter in separate Funktion | 2–4 Std. | Mittel (Wartbarkeit) |
| 15 | **Dupliziertes Critical CSS konsolidieren** — Gemeinsame Basis-Styles in eine externe Datei extrahieren (kein `media="print"`-Trick nötig wenn HTTP/2 push oder preload genutzt wird) | 1 Tag | Mittel (Wartbarkeit) |
| 16 | **FontAwesome ersetzen** — 12 genutzte Icons als Inline SVG oder Bootstrap Icons; Einsparung: ~690 KB Serverspace, ~80 KB Netzwerkübertragung | 3–4 Std. | Mittel (Performance) |
| 17 | **404.html erstellen** — Gebrandete Fehlerseite mit Navigation und CTA | 1–2 Std. | Mittel (UX/SEO) |
| 18 | **`document.write()` ersetzen** — Modernes JS in allen Fußzeilen | 30 min | Gering |

### Strategisch (Relaunch-Scope)

| Priorität | Maßnahme | Aufwand | Impact |
|-----------|----------|---------|--------|
| 19 | **LocalBusiness JSON-LD** mit vollständiger Adresse, Öffnungszeiten, Geo-Koordinaten | 1 Std. | Hoch (Local SEO) |
| 20 | **Bootstrap durch leichtgewichtiges CSS-System ersetzen** (Custom Grid + Accordion ≈ 15–20 KB statt 227 KB) | 2–3 Tage | Mittel (Performance, Kontrolle) |
| 21 | **WCAG 2.2 vollständiger Audit** mit Screenreader-Testing (NVDA/VoiceOver), Tastatur-Navigation durch alle Interaktionspunkte | 1–2 Tage | Kritisch (BFSG-Konformität beweisbar machen) |
| 22 | **og-image.png als WebP** (Einsparung ~50%) und dedizierten Logo-Asset für JSON-LD `Organization.logo` erstellen | 1–2 Std. | Mittel (Performance/SEO) |
| 23 | **Terminbuchung (Calendly) DSGVO-konform einbinden** — Calendly setzt Tracking-Cookies; DSGVO-konformer Embed oder Consent-Gate notwendig | 1 Tag | Hoch (DSGVO) |
| 24 | **barrierefreiheit.html inhaltlich erweitern** — WCAG 2.2 statt 2.1, bekannte Einschränkungen auflisten, Datum aktualisieren | 2 Std. | Mittel (Glaubwürdigkeit) |
| 25 | **llms.txt erweitern** — Social-Recruiting-Angebot, GEO-Services, KI-Telefon-Agenten ergänzen | 30 min | Gering (GEO-Zukunftsfähigkeit) |

---

## Zusammenfassung nach Schweregrad

| 🔴 Kritisch (12 Findings) | 🟠 Hoch (14 Findings) | 🟡 Mittel (16 Findings) | 🟢 Gut (20+ Aspekte) |
|---|---|---|---|
| Favicon fehlt | JS-Bloat 176 KB | WCAG 2.1 vs 2.2 Inkonsistenz | DOCTYPE/lang/charset |
| Canonicals relativ | FontAwesome Bloat | `document.write()` | Viewport korrekt |
| Social-Links Platzhalter | Kein LocalBusiness-Schema | OG:locale fehlt | One h1 pro Seite |
| Kein Cookie-Consent | Touch-Targets Social-Icons | Service-Card Inhalt | font-display swap |
| GA in Datenschutz ohne Code | Kein 404.html | Sitemap lastmod veraltet | Fonts selbst-gehostet |
| Skip-Link-JS defekt | Leerer Header index.html | llms.txt Social Recruiting | aria-hidden Icons |
| Kein nav Landmark | ODR-Link im Impressum fehlt | RStV → MStV | aria-label Social-Links |
| BFSG-Check Formular | Cookie-Consent DSGVO | Typeform CDN vs. lokal | prefers-reduced-motion |
| | | | CSP-freundliches Setup |

---

*Audit-Stand: 2026-08-16 | Methodik: Vollständige Datei-Inspektion, Cross-Referenz zwischen Seiten, Sitemap-Abgleich, WCAG 2.2-Prüfung ohne Browser-Testing*
