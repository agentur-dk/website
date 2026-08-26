# Website-Audit agentur dk — Technik, Inhalt, Barrierefreiheit, Auffindbarkeit

**Stand:** 26.08.2026
**Gegenstand:** alle 16 Seiten der Astro-Site, Komponenten, Build und Auslieferung
**Zielsetzung:** maximale Auffindbarkeit bei Suchmaschinen und KI-Systemen (SEO/GEO),
vollständige WCAG-2.2-AA-Konformität, Lighthouse 100 auf Mobil und Desktop
**Vorgänger:** `docs/AUDIT-2026-08-16-legacy.md` (Audit der Alt-Site vor der Astro-Migration)

---

## Zusammenfassung

Der technische Unterbau war bereits solide: saubere Semantik, lokale Schriften,
kein Tracking ohne Einwilligung, funktionierende Consent-Verwaltung. Die
gravierenden Befunde lagen nicht in der Umsetzung, sondern in der **Konfiguration
und in doppelt gepflegten Inhalten** — an Stellen also, an denen Fehler nicht
auffallen, weil nichts sichtbar kaputtgeht.

Drei Befunde hätten unmittelbar Umsatz gekostet:

1. **`website-leasing.html` stand auf `noindex, nofollow`.** Eine der beiden
   Kernleistungsseiten war für Google und für KI-Crawler vollständig gesperrt.
2. **Die Domain war widersprüchlich ausgezeichnet.** Canonical, Sitemap und
   robots.txt zeigten auf `agentur-dk.github.io/website/`, JSON-LD und llms.txt
   auf `dk-dk.de`. Für Crawler sind das zwei konkurrierende Identitäten.
3. **Alle `@font-face`-URLs waren auf `/website/` hartkodiert.** Beim Umzug auf
   die Custom Domain wären sämtliche Schriften ins Leere gelaufen.

Dazu kamen acht zu lange Titel, eine Startseite ohne Keyword in der H1,
Platzhaltertext („Kundenlogo 1") in der Kundenleiste und zwei Kontrastwerte
unter dem AA-Minimum.

**Ergebnis nach Umsetzung:** siehe [Messwerte](#messwerte).

---

## 1. Auffindbarkeit — Suchmaschinen und KI-Systeme

### 1.1 Domain und kanonische Identität — behoben

`astro.config.mjs` stand auf `base: '/website/'` und `site: 'https://agentur-dk.github.io'`,
während JSON-LD und llms.txt durchgängig `dk-dk.de` nannten. Produktion läuft
hinter der Custom Domain, also an der Wurzel.

Umgesetzt:

- `site: 'https://dk-dk.de'`, `base: '/'`, beides über `SITE_URL`/`BASE_PATH` übersteuerbar
- **`public/CNAME` angelegt** — die Datei fehlte. Ohne sie setzt jeder Pages-Deploy
  die Custom-Domain-Einstellung zurück und die Seite fällt auf `github.io` zurück.
- `sitemap.xml`, `robots.txt` und `llms.txt` sind keine gepflegten Dateien mehr,
  sondern Endpunkte (`src/pages/*.ts`), die aus `site.config.ts` erzeugt werden.
  Ein Auseinanderlaufen ist damit strukturell ausgeschlossen.

Die alte `sitemap.xml` listete zudem 14 Seiten, `ueber-uns` fehlte trotz
Verlinkung in der Hauptnavigation.

### 1.2 `noindex` auf einer Leistungsseite — behoben

`src/pages/website-leasing.astro` übergab `noindex={true}` an das Layout.
Lighthouse wies die Seite entsprechend mit SEO 63 aus. Entfernt.

`tools/check-seo.mjs` prüft jetzt bei jedem Build, dass ausschließlich die
404-Seite auf `noindex` steht.

### 1.3 Titel und Beschreibungen — überarbeitet

Acht von sechzehn Titeln lagen über der Anzeigegrenze von rund 60 Zeichen und
wurden in den Suchergebnissen abgeschnitten, sechs Beschreibungen über 160:

| Seite | Titel vorher | Beschreibung vorher |
|---|---|---|
| barrierefreiheit | 81 | 143 |
| corporate-design | 79 | 147 |
| leistungen | 79 | 173 |
| online-marketing | 76 | 152 |
| projekte | 75 | 186 |
| seo-geo | 74 | 158 |
| ki-services | 72 | 157 |
| website-leasing | 71 | 179 |
| ueber-uns | 64 | 186 |

Alle 16 Seiten liegen jetzt bei ≤ 60 beziehungsweise 70–155 Zeichen; die Grenzen
sind als Prüfung hinterlegt, nicht als Vorsatz.

### 1.4 Strukturierte Daten — von losen Blöcken zu einem Graphen

Vorher standen JSON-LD-Blöcke als handgeschriebene Strings in den Seiten. Daraus
folgten drei Probleme:

- **Kein `BreadcrumbList` auf keiner einzigen Seite** — obwohl sichtbare
  Breadcrumbs existieren. Google zeigt Breadcrumb-Pfade in den Ergebnissen nur
  bei ausgezeichneten Daten.
- **Keine Verknüpfung der Entitäten.** Jede Seite wiederholte einen eigenen
  `Organization`-Knoten ohne `@id`. Für Parser sind das verschiedene Firmen,
  nicht eine.
- **404, Impressum und Datenschutz ganz ohne Auszeichnung.**

Umgesetzt: `src/lib/schema.ts` erzeugt je Seite **einen** `@graph` aus
`Organization`, `WebSite`, `WebPage`/`AboutPage`/`CollectionPage`,
`BreadcrumbList`, `FAQPage` und `Service`. Alle Knoten hängen über `@id`
zusammen. `knowsAbout` benennt die Fachgebiete explizit — für KI-Systeme das
maschinenlesbare Gegenstück zum Fließtext.

17 Unit-Tests prüfen unter anderem, dass keine `@id`-Referenz ins Leere zeigt.

### 1.5 FAQ-Inhalte — doppelte Pflege beseitigt

Die 42 FAQ-Einträge existierten zweimal: einmal als sichtbares Markup, einmal als
handgeschriebenes `FAQPage`-Schema. Beide Fassungen konnten auseinanderlaufen —
und ein Mismatch zwischen Schema und sichtbarem Text wertet Google als Verstoß
gegen die Richtlinien für strukturierte Daten.

Umgesetzt: `src/data/faq.ts` ist die einzige Quelle. Accordion, JSON-LD und
llms.txt lesen daraus. Nachweis im Build: Schema und sichtbarer Text sind auf
allen neun FAQ-Seiten identisch.

### 1.6 GEO — Sichtbarkeit in KI-Antworten

- **`llms.txt` wird generiert** statt gepflegt. Die alte Fassung nannte noch eine
  abweichende URL-Struktur und Leistungsbeschreibungen, die es so nicht mehr gab.
  Die neue Fassung enthält Unternehmensprofil, alle Leistungen mit absoluten
  Links, den BFSG-Sachstand und sämtliche 42 FAQ-Einträge mit Quellenangabe —
  die dichteste zitierfähige Faktenbasis, die die Site hergibt.
- **`robots.txt` gibt 16 KI-Crawler ausdrücklich frei** (GPTBot, OAI-SearchBot,
  ClaudeBot, Claude-User, PerplexityBot, Google-Extended, Applebot-Extended u. a.).
  Eine reine `User-agent: *`-Gruppe werten nicht alle dieser Bots als Freigabe.
- **`max-snippet:-1, max-image-preview:large`** erlaubt vollständige Textausschnitte
  statt der Standardkürzung.
- Die neue Orientierungstabelle auf `leistungen.html` ordnet acht typische
  Ausgangslagen der jeweiligen Leistung zu — als `<dl>` ausgezeichnet, also in
  einer Form, die sowohl Screenreader als auch Parser verlässlich zuordnen.

### 1.7 Open Graph — vervollständigt

Es fehlten `og:url` und `og:site_name`; das Vorschaubild war **1536 × 1024**
statt 1200 × 630 und wurde in Social-Karten oben und unten beschnitten. Es trug
zudem kein Markenzeichen, obwohl es in jeder geteilten Vorschau und in
KI-Zitatkarten erscheint.

Neu gerendert über `tools/og-image.mjs` mit den echten Schriften und Farben der
Seite: **1200 × 630, 209 kB → 31 kB**, mit Wortmarke, Standort und Domain.

---

## 2. Barrierefreiheit — WCAG 2.2 AA

axe-core meldete von Anfang an null Verstöße. Das ist ein gutes Zeichen, aber
kein Konformitätsnachweis: automatisierte Prüfungen decken je nach Quelle 30–40 %
der Erfolgskriterien ab. Alles, was von Layout, Zoom, Bewegung oder Zeigergröße
abhängt, muss gemessen werden. Dafür ist `tools/wcag-manual.mjs` entstanden.

### 2.1 Bewegung ohne Bedienelement (2.2.2) — behoben

Die Schreibmaschinen-Zeile im Hero und die Logo-Laufschrift starten automatisch
und laufen unbegrenzt weiter. Beide respektierten zwar `prefers-reduced-motion` —
das hilft aber nur Nutzern, die diese Einstellung im Betriebssystem gesetzt haben.
2.2.2 verlangt darüber hinaus ein Bedienelement.

Umgesetzt: `MotionToggle.astro` im Footer hält beide Animationen an, merkt sich
die Entscheidung über Seitenwechsel hinweg und wird vor dem ersten Rendern
angewandt, damit nichts aufblitzt.

### 2.2 Reflow bei 320 px (1.4.10) — drei Verstöße behoben

- `.btn` hatte `white-space: nowrap` bei Versalien und 0,06 em Sperrung. Lange
  deutsche Beschriftungen wurden 330 px breit und erzwangen horizontales Scrollen.
- Die Logo-Leiste war zusätzlich auf `100vw` aufgezogen, obwohl der Abschnitt
  ohnehin volle Breite hat. `100vw` schließt die Scrollbar ein — rund 18 px Überhang.
- **„Datenschutzerklärung" als einzelnes Wort ist bei 320 px breiter als der
  Viewport.** Überschriften haben jetzt `hyphens: auto`; die Silbentrennung greift,
  weil `<html lang="de">` gesetzt ist.

### 2.3 Kontraste (1.4.3) — zwei Verstöße behoben

| Element | vorher | jetzt |
|---|---|---|
| Referenzkachel grün, weiße Schrift | 2,30 : 1 | 5,27 : 1 |
| Referenzkachel türkis, weiße Schrift | 3,36 : 1 | 6,16 : 1 |

Beide entgingen axe-core, weil die Kacheln `aria-hidden` tragen — für sehende
Nutzer sind sie trotzdem Text.

Beim Ausbau kam ein dritter hinzu und wurde mitbehoben: `.text-link` war fest auf
helle Abschnitte verdrahtet (`#1c60ad`, auf dunklem Grund 2,97 : 1). Die Klasse
richtet sich jetzt nach ihrem Abschnitt — sonst wäre jede künftige Verwendung auf
dunklem Grund eine stille Barriere.

### 2.4 Zielgrößen (2.5.8) — behoben

`.card__link` und `.case-card__link` waren 22 px hoch. Als eigenständige
Schaltflächen greift die Inline-Ausnahme nicht; beide liegen jetzt bei 24 px.

### 2.5 Fokus nicht verdeckt (2.4.11) — vorbeugend behoben

Der sticky Header ist 64 px hoch und hätte Sprungziele überdeckt.
`scroll-padding-top: 5rem` verhindert das.

### 2.6 Zwei Fehler in der Bedienlogik — behoben

- **`lockScroll()` war definiert, wurde aber nie aufgerufen.** Beide
  Consent-Ebenen sind als `role="dialog" aria-modal="true"` ausgezeichnet, der
  Hintergrund scrollte trotzdem mit.
- **Der BFSG-Check setzte den Fokus auf ein `<div>` ohne `tabindex`** —
  `focus()` läuft dort wirkungslos ins Leere. Nach Abschluss des Selbstchecks
  landete der Fokus also nirgends. Behoben durch `tabindex="-1"`; das gleichzeitig
  gesetzte `aria-live="assertive"` entfiel, weil sonst doppelt vorgelesen würde.

### 2.7 Label in Name (2.5.3) — behoben

Die Logo-Links trugen `aria-label="agentur dk – design & kommunikation – Zur
Startseite"`, während der sichtbare Text anders lautete. Sprachsteuerung findet
ein Element dann nicht über das, was daraufsteht. Das `aria-label` ist entfernt,
der Zielhinweis steht als visuell verborgener Text im Link.

---

## 3. Performance

### 3.1 Render-blockierendes CSS — behoben

Jede Seite lud ein 49-kB-Stylesheet als eigenen Request. Lighthouse wies dafür
rund 600–870 ms Verzögerung aus; mobil lag die Startseite bei 92.

`build.inlineStylesheets: 'always'` bettet das CSS ein — der Roundtrip entfällt
vollständig. Gzip-komprimiert sind es 18–27 kB pro Seite.

### 3.2 Layout-Shift durch Schriftwechsel — behoben

Nach dem CSS-Fix blieb CLS 0,096 bis 0,172, vollständig verursacht durch den
Font-Swap. Die vorhandenen Metric-Overrides waren geschätzt.

Der Versuch, sie zu messen, war aufschlussreich: Das Breitenverhältnis zwischen
Webfont und Arial **hängt vom konkreten Text ab**. Über 30 000 Zeichen echten
Seitentexts ergab sich für Manrope 400 ein size-adjust von 104,6 %, für einen
synthetischen Prüfstring mit Ziffern und Geviertstrich dagegen 100,1 % — ein
Unterschied von 4,5 %, der genau den beobachteten Umbruch erklärt. Ein einzelner
Wert je Familie kann zudem nur ein Gewicht treffen.

Deshalb wurde nicht weiter kalibriert, sondern die Fehlerquelle beseitigt:
**`font-display: optional`**. Der Browser räumt dem Font ein kurzes Zeitfenster
ein und verzichtet danach für diesen Seitenaufruf auf den Tausch. Entweder ist
der Webfont von Anfang an da, oder es bleibt beim Fallback — ein Sprung entsteht
in keinem Fall. Die Schriften liegen lokal, sind rund 24 kB groß und die
kritischen Schnitte werden vorgeladen, also greift praktisch immer der erste Fall.

**CLS liegt seitdem auf allen 16 Seiten bei 0.** Die gemessenen Fallback-Metriken
bleiben als Sicherheitsnetz erhalten (`npm run fonts:metrics`).

### 3.3 Geprüft und verworfen: CSS je Seite reduzieren

Da das CSS eingebettet ist, trägt jede Seite das komplette Stylesheet. Ein
Werkzeug, das je Seite nur die tatsächlich passenden Regeln behält, erreichte
−37 % (Impressum 49 → 23 kB).

**Nicht übernommen.** Ein Pixelvergleich vorher/nachher zeigte, dass Bausteine,
die erst JavaScript erzeugt — etwa der Leistungs-Check auf der Startseite — ihr
Styling verloren: 44 px hohe Schaltflächen schrumpften auf 26 px. Ein Schutz für
Inline-Skripte behob das nicht, weil der betreffende Code als gebündeltes Modul
ausgeliefert wird. Für einen Lighthouse-Punkt in zwei von 32 Läufen ist das
Risiko einer stillen Layout-Regression in Produktion die falsche Abwägung.

Der saubere Weg wäre, das CSS an der Quelle zu verkleinern: `global.css` umfasst
rund 1 900 Zeilen und trägt Regeln für Komponenten, die es nicht mehr gibt.
Das ist eine eigene, gut abgrenzbare Aufgabe.

### 3.4 Messumgebung

`astro preview` liefert unkomprimiert aus, GitHub Pages sendet gzip. Lighthouse
maß dadurch eine FCP, die es in Produktion nie gibt. `tools/serve.mjs` bildet die
Auslieferung nach; alle Zahlen unten stammen daraus.

---

## 4. Inhalt

### 4.1 Behoben

| Befund | Seite |
|---|---|
| Tippfehler „Was wir für Sie **tust**" in einer Überschrift | social-recruiting |
| Platzhaltertext „Kundenlogo 1–5" in der Kundenleiste, live sichtbar | Startseite |
| H1 „Sichtbarkeit, die wirkt." — kein einziges Keyword | Startseite |
| Zwei H2 mit identischem Text „Was wir für Sie tun" | Startseite |
| Zwei H2 mit identischem Text „Projekt anfragen" | Startseite |
| „Kleine Agentur.Klarer Fokus." — fehlendes Leerzeichen im H1 | ueber-uns |
| H1 nur „Leistungen" | leistungen |

Die Kundenleiste zeigt jetzt die Namen, die ohnehin in den Referenzen stehen —
TARGOBANK, BMBFSJ, Berufsförderungswerke, DU BIST GRIECHE, aposocial.

Die Startseiten-H1 lautet jetzt „Digitalagentur aus Köln für barrierefreie
WordPress-Websites". Der animierte Claim bleibt erhalten, rückt aber unter die
Überschrift — die H1 ist damit ein stabiles, keywordtragendes Element statt
eines wechselnden Textes.

### 4.2 Dünne Seiten

`leistungen.html` hatte als Einstiegsseite für alle acht Leistungen nur 358
Wörter. Ergänzt wurden die Orientierungstabelle (acht Ausgangslagen → passende
Leistung, jeweils verlinkt) und fünf übergreifende FAQ-Einträge: **358 → 618 Wörter**,
bei deutlich besserer interner Verlinkung.

**Offen** — hier fehlen Fakten, die nur die Agentur liefern kann, weshalb sie
bewusst nicht erfunden wurden:

| Seite | Wörter | Empfehlung |
|---|---|---|
| projekte | 490 | Pro Projekt Ausgangslage, Maßnahme und ein belegbares Ergebnis. Ein Fallbeispiel mit Zahl wird von KI-Systemen deutlich häufiger zitiert als eine Aufzählung. |
| ueber-uns | 496 | Gründungsjahr, Werdegang, konkrete Arbeitsweise. `foundingDate` steht derzeit auf 2005 — bitte prüfen. |
| 404 | 36 | Die drei meistgesuchten Ziele verlinken. |

Weitere Empfehlungen ohne Umsetzung:

- **Preisangaben konkretisieren.** „ab ca. 2.500 €" steht in der FAQ, auf
  `website-leasing.html` fehlt jede Zahl. Preisspannen sind der am häufigsten
  aus Agenturseiten zitierte Inhalt.
- **Ein Blog oder Wissensbereich zum BFSG.** Die Kernkompetenz hat genau eine
  Landingpage. Für ein Thema mit laufender Rechtsentwicklung ist das wenig
  Substanz gegenüber Wettbewerbern mit fortlaufenden Beiträgen.
- **`sameAs` erweitern.** Derzeit nur LinkedIn. Jedes weitere verifizierte Profil
  (Google Business, Xing, Branchenverzeichnisse) stärkt die Entitätserkennung.
- **Google Business Profile verknüpfen**, sobald vorhanden — für lokales SEO in
  Köln der wirksamste einzelne Hebel.

---

## 5. Technischer Unterbau

### 5.1 Toter Code entfernt

16 Komponenten aus Commit `efd601b` („Starter-Architektur") waren **nirgends
eingebunden**: elf UI-Primitives (`Button`, `Input`, `Card`, `Badge`, `Alert`,
`Container`, `Section`, `Icon`, `Select`, `Checkbox`, `Textarea`) sowie
`TabNav`, `ReferenceCard`, `ServiceCard`, `LogoStrip` und `JsonLd`.

Es sind dünne Hüllen um bestehende CSS-Klassen. Das tatsächlich genutzte
Designsystem ist die Token-Ebene plus BEM-Klassen. Eine nie eingebundene
Parallelstruktur veraltet und führt in die Irre — entfernt.
`git revert` holt sie zurück, falls die Ebene doch ausgebaut werden soll.

### 5.2 Nicht reproduzierbare Builds — behoben

`FaqAccordion.astro` erzeugte Element-IDs über `Math.random()`. Jeder Build
lieferte damit anderes HTML. Jetzt aus dem Slug abgeleitet.

### 5.3 Typsicherheit

`astro check` war nicht eingerichtet und meldete beim ersten Lauf 12 Fehler und
3 Warnungen — durchweg Stellen, an denen TypeScript eine Null-Prüfung nicht mehr
nachvollziehen kann, weil gehoistete Funktionsdeklarationen vor der Prüfung
stehen. Alle behoben, indem die geprüfte Referenz an eine nicht-nullable
Konstante gebunden wird; keine Unterdrückung per `!` oder `any`.
Eine dieser Warnungen war der nie aufgerufene `lockScroll` aus 2.6.

### 5.4 Prüfungen statt Snapshots

`check-meta.mjs` verglich Titel und Beschreibungen gegen einen eingefrorenen
Snapshot der Alt-Site — und konservierte damit deren Fehler, unter anderem die
acht zu langen Titel. Ersetzt durch `check-seo.mjs`, das gegen Regeln prüft.

`check-css.mjs` las nur externe Stylesheets und lief nach dem CSS-Inlining ins
Leere; es pflegte daneben eine über hundert Zeilen lange Allowlist, die bereits
gelöschte Komponenten enthielt. Neu geschrieben: liest externes **und** eingebettetes
CSS, die Allowlist ist auf neun begründete Einträge geschrumpft.

### 5.5 Neue Werkzeuge

| Werkzeug | Zweck |
|---|---|
| `tools/a11y.mjs` | axe-core, WCAG 2.2 A/AA, 16 Seiten × 3 Zustände (auch Menü und Accordion geöffnet) |
| `tools/wcag-manual.mjs` | Reflow, Textabstand, Fokus-Verdeckung, Zielgrößen |
| `tools/lighthouse.mjs` | 16 Seiten × mobil/desktop, Schwelle 100, mit begründeten Ausnahmen |
| `tools/check-seo.mjs` | Titel, Beschreibungen, Canonicals, Überschriften, JSON-LD, Sitemap |
| `tools/serve.mjs` | gzip-Auslieferung wie GitHub Pages |
| `tools/verify-live.mjs` | startet den Server und fährt die drei browserbasierten Gates |
| `tools/og-image.mjs` | OG-Bild aus den Design-Tokens rendern |
| `tools/font-metrics.mjs` | Fallback-Metriken gegen echten Seitentext messen |

`npm run verify` fährt alles. In CI trennt sich das: `deploy.yml` prüft bei jedem
Push die schnellen Gates, `quality.yml` fährt die browserbasierten bei Pull
Requests, wöchentlich und auf Zuruf.

### 5.6 Tests

74 → **91 Tests**. Die 17 neuen decken die Schema-Erzeugung ab, unter anderem
lückenlose Breadcrumb-Positionen, eindeutige `@id`-Werte und die Zusicherung,
dass keine `@id`-Referenz auf einen Knoten außerhalb des Graphen zeigt.

---

## Messwerte

Alle Zahlen aus `npm run verify` gegen `tools/serve.mjs` (gzip, wie GitHub Pages).

### Lighthouse — 16 Seiten × mobil und desktop

| | Performance | Barrierefreiheit | Best Practices | SEO |
|---|---|---|---|---|
| **Desktop**, alle 16 Seiten | **100** | **100** | **100** | **100** (404: 66, siehe unten) |
| **Mobil**, 14 von 16 Seiten | **100** | **100** | **100** | **100** (404: 66) |
| **Mobil**, Startseite und Referenzen | 99 | 100 | 100 | 100 |

**30 von 32 Läufen erreichen 100 in allen vier Kategorien.**

Zum Vergleich der Ausgangsstand: mobil 92 (Startseite), 97 (zehn Seiten);
`website-leasing` mit SEO 63; `projekte` mit Barrierefreiheit 96.

**Zu den beiden 99ern.** Beide verlieren den Punkt am First Contentful Paint
(1,5 s, Teilwertung 0,96) unter der von Lighthouse simulierten Mobilverbindung.
CLS liegt bei 0, Total Blocking Time bei 0 ms. Die Startseite schwankt über
wiederholte Läufe zwischen 99 und 100, `projekte` liegt stabil bei 99.

Ursache ist die Zahl der Schriftschnitte: sechs Dateien konkurrieren beim
Seitenaufbau mit dem HTML. Die Nutzung ist dabei stark ungleich verteilt —
gemessen über alle 16 Seiten:

| Schnitt | Zeichen auf der gesamten Site | Dateigröße |
|---|---|---|
| Manrope 400 | 191 744 | 21,9 kB |
| Space Grotesk 700 | 7 659 | 18,5 kB |
| Manrope 600 | 5 672 | 21,9 kB |
| Manrope 500 | 4 661 | 21,9 kB |
| Manrope 700 | 4 138 | 21,9 kB |
| Space Grotesk 400 | 726 | 18,5 kB |
| Space Grotesk 500 | 248 | 18,5 kB |

Zwei Schnitte tragen zusammen 974 Zeichen und kosten 37 kB. Sie
zusammenzulegen — Space Grotesk 400 und 500 auf 700, Manrope 500 und 600 auf
einen Wert — würde drei Requests sparen und den letzten Punkt mit hoher
Wahrscheinlichkeit schließen. **Das ist eine Gestaltungsentscheidung und wurde
deshalb nicht eigenmächtig getroffen**; die Schriftstärken sind sichtbar.

Umgesetzt wurde stattdessen, was ohne gestalterische Wirkung bleibt:

- **Roboto Mono entfernt.** Es stand ausschließlich auf der 404-Seite und deckte
  80 Zeichen der gesamten Site ab — dafür lagen drei Dateien im Repository.
  Ersetzt durch den System-Monospace-Stack.
- **Schriften auf den genutzten Zeichenvorrat verkleinert** (`npm run fonts:subset`):
  199 → 175 kB über alle Schnitte. Der Vorrat umfasst 211 Zeichen inklusive
  Reserve für künftige Texte, damit nicht ein neu eingefügtes Sonderzeichen im
  Fallback landet.

**Zur SEO-Wertung 66 auf der 404-Seite.** Lighthouse bemängelt `is-crawlable` —
die Seite trägt bewusst `noindex`. Das ist korrektes Verhalten für eine
Fehlerseite, kein Mangel; `tools/lighthouse.mjs` führt es als begründete Ausnahme.

### Barrierefreiheit

| Prüfung | Umfang | Ergebnis |
|---|---|---|
| axe-core (WCAG 2.0/2.1/2.2 A + AA, Best Practices) | 16 Seiten × 3 Zustände | **0 Verstöße** |
| Reflow 320 px, Textabstand, Fokus-Verdeckung, Zielgrößen | 16 Seiten | **0 Befunde** |
| Lighthouse Accessibility | 32 Läufe | **100** |

Die drei Zustände je Seite sind Ausgangszustand, geöffnetes Mobilmenü und
geöffnetes Accordion — ein rein statischer Scan übersieht sonst genau die
Komponenten, die per JavaScript eingeblendet werden.

### Build

| | vorher | jetzt |
|---|---|---|
| Unit-Tests | 74 | **91** |
| Typfehler (`astro check`) | nicht eingerichtet, 12 Fehler beim ersten Lauf | **0** |
| Interne Links | OK | OK |
| SEO-Regeln | Snapshot-Vergleich | **16/16 regelkonform** |
| CSS-Klassen ohne Regel | Prüfung lief ins Leere | **0** |
| CLS (alle Seiten) | 0,096–0,172 | **0** |
| Render-blockierende Requests | 1 (49 kB) | **0** |
| OG-Bild | 1536 × 1024, 209 kB | **1200 × 630, 31 kB** |


---

## Was als Nächstes ansteht

**Vor dem Domainumzug**

1. DNS-Einträge für `dk-dk.de` auf GitHub Pages setzen und in den
   Repository-Einstellungen „Enforce HTTPS" aktivieren.
2. Nach dem Umzug in der Google Search Console die Property `dk-dk.de` anlegen
   und die Sitemap einreichen.
3. Prüfen, ob von der alten Domain 301-Weiterleitungen nötig sind.

**Inhaltlich**

4. Referenzseite um belegbare Ergebnisse ergänzen (Abschnitt 4.2).
5. Preisspannen auf `website-leasing.html` benennen.
6. Wissensbereich zum BFSG aufbauen.
7. `foundingDate` in `site.config.ts` verifizieren (steht auf 2005).

**Technisch**

8. `global.css` verschlanken — rund 1 900 Zeilen mit Regeln für entfernte
   Komponenten. Danach lohnt ein erneuter Blick auf Abschnitt 3.3.
9. Echte Kundenlogos statt der Namensschilder in der Vertrauensleiste.
10. Über die Zusammenlegung der Schriftschnitte entscheiden (Zahlen unter
    [Messwerte](#messwerte)) — drei Requests weniger, dafür sichtbar veränderte
    Schriftstärken an einzelnen Stellen.
