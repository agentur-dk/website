Du bist ein Senior Web-Auditor einer professionellen Digitalagentur. Führe einen VOLLSTÄNDIGEN technischen Audit der Website in diesem Verzeichnis durch (alle HTML-, CSS-, JS- und Konfigurationsdateien).

# Umfang
- Alle .html-Dateien (index.html, impressum.html, datenschutz.html, barrierefreiheit.html, bfsg-wordpress-website-agentur.html)
- css/, js/, fonts/, images/, robots.txt, sitemap.xml, llms.txt

# Audit-Kategorien (jede einzeln durcharbeiten)
1. **HTML-Grundlagen & Semantik:** Doctype, lang-Attribut, charset, viewport, Heading-Hierarchie (h1→h6, nur eine h1, keine Sprünge), Landmarks (header/nav/main/footer), semantische Tags vs. div-Suppe, Tabellen für Layout?
2. **SEO:** Title (Länge 50-60 Zeichen, Unique je Seite), Meta Description (120-160, Unique), Canonical, Open Graph, Twitter Cards, JSON-LD (Schema.org korrekt?), robots.txt, sitemap.xml (stimmt mit echten Dateien überein?), sprechende URLs, Alt-Texte, Keyword-Optimierung
3. **Accessibility / WCAG 2.2 + BFSG** (wichtig: Agentur bewirbt BFSG-Barrierefreiheit!): Kontraste, aria-Attribute, Formular-Labels, Fokus-Styles, skip-links, Bildschirmleser-Tauglichkeit, Button-/Link-Texte
4. **Performance:** Render-blockierende Ressourcen, Font-Loading (preload, font-display), Bildgrößen/Optimierung, Lazy Loading, Caching-Header, unnötige Libraries (jQuery? skel? Font Awesome 4.6.3?), Inline-CSS/JS
5. **CSS-Qualität:** Duplikate, tote Regeln, Inline-Styles, !important, Vendor-Bloat (bootstrap.min.css + custom.css: Überschneidungen?), mobile-first vs. desktop-first, Einheiten (px vs rem), Konsistenz
6. **JS-Qualität:** Fehler, leere Dateien (typeform-embed.js?), ungenutzte Libraries, jQuery-Abhängigkeiten, Lade-Reihenfolge, eventuelle XSS-Risiken
7. **Security:** Mixed Content (http vs https), externe Einbindungen, Formular-Handling (gibt es ein Kontaktformular? wohin geht es?), Datenleaks, interne Pfade
8. **Responsive/Mobile:** viewport-Korrektheit, Breakpoints, Touch-Targets, horizontales Scrollen?
9. **Content:** Dünne Seiten, Duplikate, fehlende CTAs, veraltete Infos, Konsistenz über alle Seiten, Rechtschreibung, fehlende Seiten (404?), Impressum/Datenschutz aktuell?
10. **Technische Standards:** Favicon, 404-Seite, Mixed http/https Links, externe tote Links, Dateistruktur, llms.txt-Qualität

# Vorgehen
- Lies JEDE Datei vollständig
- Prüfe Querverweise zwischen Seiten (Navigation, Footer, Links)
- Teste sitemap.xml gegen die tatsächlichen Dateien

# Output
Schreibe einen strukturierten Audit-Bericht nach AUDIT.md im Projektroot mit:
- Executive Summary (Top 10 kritischsten Findings)
- Pro Kategorie: Befunde mit Schweregrad (🔴 Kritisch / 🟠 Hoch / 🟡 Mittel / 🟢 Gut) und konkreter Datei+Zeile
- Am Ende: Priorisierte Empfehlungs-Liste (Quick Wins vs. strategische Maßnahmen) sortiert nach Impact
- Sprachstil: Deutsch, professionell, präzise, keine Füllwörter
