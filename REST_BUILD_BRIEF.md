# REST-BUILD BRIEFING — agentur dk Website (Teil 2)

Du bist Senior Web-Developer einer Top-Digitalagentur. Teil 1 des Relaunch ist fertig (Design-System css/tokens|base|layout|components|utilities.css, js/main.js, index.html, impressum.html, datenschutz.html, bfsg-wordpress-website-agentur.html, sitemap.xml, robots.txt, llms.txt — alles bereits committed). Deine Aufgabe: Teil 2 fertigstellen + neue Seiten bauen.

## A) FEHLENDE STANDARD-SEITEN FERTIGSTELLEN

### 1. barrierefreiheit.html — NEU BAUEN (aktuell noch alte Version!)
Barrierefreiheits-Erklärung nach BFSG/BGG + WCAG 2.2:
- Konformitätsstatus (WCAG 2.2 AA, EN 301 549)
- Datum der Erstellung/letzten Prüfung (16.08.2026)
- Beschreibung der geprüften Bereiche
- Kontaktweg für Barrieremeldungen (E-Mail der Agentur)
- Durchsetzungsstelle gem. BFSG/BGG (Landesbeauftragte für Datenschutz und Informationsfreiheit NRW / Durchsetzungsstelle) mit Link
- Gleiche Header/Footer-Struktur, gleiche Klassen wie index.html (Design-System!)
- Seitentitel, Meta-Description, Canonical absolut, OG-Tags wie auf anderen Seiten

### 2. 404.html — NEU
- Gebrandete Fehlerseite im Design-System: klare Meldung, Links zu Start/Leistungen/Kontakt
- Eigenständige Seite (GitHub Pages serviert sie automatisch bei 404)

### 3. Favicon — NEU ERSTELLEN
- favicon.ico + favicon.svg (einfaches „dk"-Monogramm oder minimalistisches Logo im Marken-Stil, Roboto Mono, dunkles Theme)
- `<link rel="icon">` in ALLEN HTML-Seiten (auch den bestehenden 5)
- Optional apple-touch-icon.png 180×180

## B) NEUE SEITE: projekte.html — CASES / REFERENZEN (Daniels Anforderung!)

### Konzept (Referenz: https://www.netflow.digital/projekte)
Grid mit Projekt-Cases, filterbar nach Leistungen über Chips. **Barrierefrei (WCAG 2.2):**
- Filter-Chips = `<button>` mit `aria-pressed`, Tastaturbedienbar, Fokus sichtbar
- Ergebnis-Grid als Liste (`<ul>`/`<li>` oder Grid mit semantischen Cards)
- Ergebnisanzahl mit `aria-live="polite"` („7 Projekte angezeigt")
- Filter kombinierbar (z. B. „WordPress" + „SEO") UND/ODER-Operator definieren (UND empfohlen)
- Kein JS → trotzdem alle Projekte sichtbar (Progressive Enhancement: Grid zeigt alles, JS filtert)

### Case-Daten (6–8 Cases, realistisch für agentur dk — TARGOBANK, Bundesministerium, DU BIST GRIECHE, apotheken-Branche, KMU-Kunden):
Jeder Case: Kunde (anonymisiert wo nötig: „Öffentlicher Auftraggeber (Bundesministerium)", „TARGOBANK (Rahmenvertrag)", „DU BIST GRIECHE — eigene Plattform", „Apotheken-Netzwerk", „KMU Handel", „Dienstleister B2B"), Branche, Leistungen (Tags: Webdesign, WordPress, BFSG/Barrierefreiheit, SEO, GEO, Online-Marketing, Corporate Design, Social Recruiting, KI), Jahr, Kurzbeschreibung (2–3 Sätze), Ergebnis/Kennzahl (z. B. „+180 % organischer Traffic in 6 Monaten" — realistisch und glaubwürdig)
- Platzhalter-Design: Case-Card mit Farbverlauf/Initien-Block statt Foto (keine externen Bilder!) — `--color-primary`-Variationen
- Filter-Tags exakt passend zu den Leistungen auf index.html

### SEO für projekte.html
- Titel: „Referenzen & Projekte | agentur dk — WordPress, BFSG & SEO Agentur Köln"
- Meta-Description, Canonical, OG, JSON-LD (ggf. `ItemList` oder einzelne `CreativeWork`/`Project`-Objekte)
- In sitemap.xml aufnehmen, in Header-Navigation + Footer aufnehmen

## C) PROFESSIONELLER FOOTER — AUF ALLEN SEITEN (Daniels Anforderung!)

Bestehenden Footer im Design-System PRÜFEN und zu Profi-Niveau ausbauen (einheitlich auf ALLEN Seiten):
- 4 Spalten: 1) Agentur (Name, Kurztext, Standort Köln) 2) Leistungen (Links: BFSG/Barrierefreie Websites, WordPress, SEO & GEO, Online-Marketing, Corporate Design, KI-Services) 3) Unternehmen (Referenzen/Projekte, Barrierefreiheit, Impressum, Datenschutz) 4) Kontakt (E-Mail, Telefon, Köln, ggf. LinkedIn)
- Spaltenüberschriften als `<h2>` (KEINE span!), semantische `<nav>`/Listen
- Social-Links NUR echte Profile (LinkedIn: https://www.linkedin.com/in/daniel-kontelis/ — bekannt; KEINE Platzhalter zu facebook.com etc.)
- Copyright mit `<span id="year">` + JS-Jahr (kein document.write)
- Design: dunkle Surface-Fläche, dezente Top-Border/Accent, konsistent mit Design-System, mobil stapelnd

## D) NAVIGATION & VERKNÜPFUNGEN
- Header-Navigation: Start, Leistungen (bfsg-wordpress-website-agentur.html), Referenzen (projekte.html — NEU), Barrierefreiheit, Kontakt (Anker auf index.html#kontakt)
- Mobile-Menü inkl. neue Seite, aria-current auf aktiver Seite
- sitemap.xml: projekte.html ergänzen, lastmods auf 2026-08-16
- Alle internen Links von/zu projekte.html konsistent

## E) QA-PFLICHT (wie Teil 1)
1. Tag-Balance jeder HTML-Datei
2. Keine externen Ressourcen (außer canonical/OG/schema.org)
3. 1×h1 je Seite, Skip-Link erster Link, main-content, nav-Landmark
4. Kontraste Token-Paare dokumentieren
5. Alle internen Links auflösen, sitemap = echte Dateien
6. `node --check js/main.js` (Syntax), keine document.write
7. Keine Inline-Styles, kein !important (außer dokumentierte Utilities)
8. 320 px: kein horizontales Scrollen
9. Favicon-Link auf allen Seiten

## OUTPUT
- Alle Dateien schreiben/überschreiben im Projektroot
- Am Ende: kompakte Zusammenfassung (gebaut, gelöscht, QA-Ergebnis, offene Punkte)
