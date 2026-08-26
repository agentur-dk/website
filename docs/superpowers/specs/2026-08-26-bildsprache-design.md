# Bildsprache für dk-dk.de — Design

**Stand:** 26.08.2026
**Status:** abgestimmt, bereit für die Planung
**Umfang:** visuelle Ebene. Texte, Struktur und Navigation bleiben unverändert.

---

## 1 · Ausgangslage

Die Website wirkt sachlich bis unterkühlt. Der Auslöser ist messbar:

```
SVGs pro Seite
 0   404, barrierefreiheit, bfsg-wordpress-website-agentur, corporate-design,
     datenschutz, impressum, ki-services, online-marketing, projekte,
     seo-geo, social-recruiting, website-leasing, wordpress-entwicklung
 3   ueber-uns
 9   leistungen
18   index
```

**13 von 16 Seiten enthalten keine einzige Grafik.** Darunter alle sieben
Leistungsseiten — die Seiten, über die verkauft wird — und `projekte.astro`,
die Portfolioseite.

Ein einziges `<img>` existiert im gesamten Projekt (`LogoStrip.astro`).
`public/logos/` enthält nur eine README, keine Logodateien; die Leiste fällt
deshalb auf reine Wortmarken zurück.

Die elf Case-Cards zeigen an der Stelle, an der ein Beleg stehen müsste, einen
farbigen Kasten mit Buchstabenkürzel (`case-card__visual` + `case-card__initials`).

**Was nicht fehlt:** Eine Icon-Sprache ist vorhanden — 37 Inline-SVGs, einheitlich
1,5–1,8 px Stroke, `currentColor`, `aria-hidden`. Sie ist konsistent und wird
weiterverwendet. Die Lücke ist Bildsprache, nicht Ikonografie.

## 2 · Ziel und Nicht-Ziele

**Ziel:** Die Seite soll zeigen, was die Agentur geleistet hat, statt es zu
behaupten — innerhalb des bestehenden Looks.

**Nicht-Ziele:**

- Kein Redesign. Farbpalette, Typografie, Raster und Sektionsrhythmus bleiben.
- Keine Textänderungen. Copy ist ausdrücklich außerhalb des Umfangs.
- Keine Fotografie. Es liegt kein Personenmaterial vor.
- Keine Screenshots fremder Websites (Begründung in Abschnitt 3).

## 3 · Getroffene Entscheidungen

### 3.1 Keine Screenshots von Kundenwebsites

Geprüft und verworfen. Vier Gründe:

1. **Im Repo steht keine einzige Kunden-URL.** Alle externen Links sind
   Platzhalter (`beispiel.de`, `example.de`, `ihre-domain.de`).
2. **Vier Cases sind bewusst anonymisiert** — „Öffentlicher Auftraggeber
   (Bundesministerium)", „Apotheken-Netzwerk", „KMU Handel", „Dienstleister B2B".
   Ein Screenshot hebt genau diese Anonymisierung auf.
3. **Beim BMFSFJ ist die Begründung bereits im Code hinterlegt** (`src/data/kunden.ts`):
   Das Corporate Design des Bundes erlaubt keine Veränderung des Behördenlogos,
   und eine Referenznennung mit Logo erweckt „den Anschein einer amtlichen
   Empfehlung". Für einen Screenshot des Portals gilt dasselbe Argument.
4. **Bei TARGOBANK passt das Medium nicht.** Das Projekt war eine
   Social-Recruiting-Kampagne mit Videodreh, keine Website.

Hinzu kommt: Ein Screenshot einer fremden Live-Seite altert. Nach einem
Redesign beim Kunden zeigt das Portfolio die Arbeit einer anderen Agentur.

### 3.2 Zwei Behandlungen, weil es zwei Kartentypen gibt

Die elf Cases zerfallen inhaltlich in zwei Gruppen:

| Gruppe | Anzahl | Inhalt | Behandlung |
|---|---|---|---|
| Erzählte Projekte | 3 | Beschreibungstext, keine Kennzahl | **Ablauf-/Wandel-Schema** |
| Kennzahl-Projekte | 8 | keine Beschreibung, nur eine Kennzahl | **Zahl-Visual** |

Eine Karte, deren gesamter Inhalt „+180 % organischer Traffic" lautet, braucht
keine Ablaufskizze — sie braucht diese Zahl groß. Umgekehrt lässt sich für die
acht anonymen Projekte kein Ablauf zeichnen, ohne ihn zu erfinden: im Code steht
zu ihnen nichts außer der Kennzahl.

Nebeneffekt: Nur drei Schemata werden von Hand komponiert; die acht Zahl-Visuals
teilen sich eine Komponente mit vier Ausprägungen.

### 3.3 Inline-SVG, kein Bitmap

Alle Visuals sind Inline-SVG. Das ist keine Stilentscheidung, sondern
Konsequenz des Performance-Budgets (Abschnitt 6): Ein Inline-SVG erzeugt keinen
Netzwerk-Request und kann den LCP nicht verschlechtern.

## 4 · Das visuelle System

### 4.1 Gemeinsames Vokabular

Alle Visuals teilen:

| Eigenschaft | Wert | Begründung |
|---|---|---|
| Strichstärke | 1,5 px | identisch zur vorhandenen Icon-Sprache |
| Farbe | `currentColor` + `--dk-color-accent` | passt sich `section--light` automatisch an |
| Linienenden | `round` | wie die bestehenden Icons |
| Knotenformen | Kreis (Akteur), Rechteck (System), Haken (Ergebnis) | feste Bedeutung, seitenübergreifend gleich |
| Label-Typografie | Space Grotesk 500, 12–14 px | Displayschrift wie Überschriften |
| Raster | 8-px-Schritte | entspricht `tokens/spacing.css` |

### 4.2 Drei Schema-Typen

Gegen Gleichförmigkeit bei 17 Visuals: drei Grundformen statt einer.

**Ablauf** — Schritt → Schritt → Ergebnis. Für Prozesse.
**Wandel** — Zustand vorher ↔ Zustand nachher. Für Sanierungen und Umbauten.
**Aufbau** — verschachtelte Struktur. Für Plattformen und Netzwerke.

In Stufe 1 kommen nur *Ablauf* (BMFSFJ, TARGOBANK) und *Wandel* (BFW) zum
Einsatz; *Aufbau* ist für Stufe 2 vorgesehen, wo Leistungen wie KI-Services
oder Website-Leasing eher eine Struktur als einen Ablauf beschreiben. Der Typ
wird je Seite aus dem Inhalt gewählt, nicht vorab festgelegt.

### 4.3 Vier Zahl-Formen

Die acht Kennzahlen sind nicht gleichartig; jede Form kodiert ihre Art:

| Form | Kennzahlen | Darstellung |
|---|---|---|
| `wachstum` | +45 %, +180 %, +120 %, +38 % | steigende Kurve, Zahl dominant |
| `vollstaendig` | 100 % WCAG 2.2 AA | geschlossener Ring |
| `anzahl` | 8/8 Standorte, 42 Bewerbungen | gezählte Marken |
| `rang` | Top-3 in ChatGPT-Empfehlungen | Positionsmarke |

Die Panel-Hintergrundfarben (`case-card__visual--blue` … `--slate`) bleiben
unverändert erhalten — sie tragen den heutigen Farbrhythmus der Seite.
Kontrast gegen Weiß ist für alle acht geprüft:

```
blue  #1C60AD  6,31    green  #2b7a4b  5,27    purple #412848 12,95
teal  #116b7a  6,16    indigo #474078  9,24    orange #b85400  4,88
rose  #9f1239  8,02    slate  #475569  7,58
```

Alle ≥ 4,5:1, also auch für normal große Labels ausreichend — nicht nur für die
Großziffer, für die 3:1 genügen würde.

## 5 · Komponenten

```
src/components/visual/
  Schema.astro          Rahmen: viewBox, role="img", <title>, aspect-ratio
  KpiVisual.astro       Zahl-Visual, Prop `form`: wachstum|vollstaendig|anzahl|rang
  schemas/
    bmfsfj.astro        Ablauf  — Familie fragt an → Portal prüft → Hotel sagt zu
    targobank.astro     Ablauf  — Reichweite → Video → Bewerbung → Konzernprozess
    bfw.astro           Wandel  — Barrieren markiert ↔ geräumt
```

`Schema.astro` kapselt alles, was jedes Visual gleich machen muss: festes
`viewBox`, `role="img"`, verpflichtendes `<title>`, `aspect-ratio` gegen CLS.
Die einzelnen Schemata liefern nur ihren Inhalt. Damit lässt sich eine Regel
(etwa eine Anpassung der Strichstärke) an einer Stelle ändern.

`KpiVisual.astro` erhält `wert`, `label`, `form` und rendert daraus die passende
Ausprägung. Acht Karten, eine Komponente.

**Ersetzt wird** in `projekte.astro` und `index.astro` jeweils der Inhalt von
`.case-card__visual` — der Kürzel-`<span>` entfällt. Die Klasse und ihre
Hintergrundfarbe bleiben.

## 6 · Barrierefreiheit

Verbindlich, da die Agentur Barrierefreiheit verkauft:

- **`role="img"` mit `<title>`**, nicht `aria-hidden`. Ein Schema, das den
  Projektablauf zeigt, trägt Bedeutung; Screenreader-Nutzer erhalten sie als
  Text. Das unterscheidet die Visuals von den bestehenden Deko-Icons.
- Der `<title>`-Text **beschreibt den Inhalt**, nicht die Form: „Ablauf: Familie
  stellt Anfrage, Portal prüft die Eignung, Hotel sagt zu" — nicht „Diagramm".
- Kontraste nach Abschnitt 4.3, geprüft.
- Keine Bewegung. Falls später Animation dazukommt, ausschließlich über den
  vorhandenen `MotionToggle` und `prefers-reduced-motion`.
- Texte im SVG sind echte `<text>`-Elemente, keine Pfade — sie skalieren mit
  der Zoomstufe und bleiben durchsuchbar.

## 7 · Performance-Budget

Das Gate steht auf `LH_THRESHOLD=99`. Bilder sind die häufigste Ursache für
LCP-Einbrüche, deshalb harte Grenzen:

- **Kein zusätzlicher Netzwerk-Request.** Alle Visuals inline.
- **≤ 2 kB pro Visual**, unkomprimiert.
- **Festes `viewBox` + `aspect-ratio`** → kein Layout-Shift.
- **Kein `<foreignObject>`**, keine Filter, keine Masken — teuer beim Rastern.
- Gesamtzuwachs `projekte.html` (11 Visuals): **≤ 22 kB** vor Kompression.

Die Seite liefert bereits `inlineStylesheets: 'always'` und `compressHTML`; die
SVGs profitieren von derselben gzip-Auslieferung über `tools/serve.mjs`.

## 8 · Verifikation

Vor Abschluss jeder Stufe:

1. `npm run check:types` — 0 Fehler
2. `npm test` — alle Unit-Tests grün
3. `npm run build && npm run check:links && npm run check:seo && npm run check:css`
4. `node tools/verify-live.mjs` — axe-core 0 Verstöße, Lighthouse ≥ 99
5. Seitengewicht `projekte.html` vor/nach vergleichen, Budget aus Abschnitt 7

Ergänzend ein Unit-Test, der sicherstellt, dass jedes `Schema` ein nicht-leeres
`<title>` besitzt — eine vergessene Beschriftung ist der wahrscheinlichste
Barrierefreiheitsfehler dieser Änderung und fällt visuell nicht auf.

## 9 · Umsetzung in zwei Stufen

**Stufe 1 — Cases.** `Schema.astro`, `KpiVisual.astro`, die drei Schemata,
Einbau in `projekte.astro` (11 Karten) und `index.astro` (3 Karten).
Ergebnis wird deployt und angesehen, bevor Stufe 2 beginnt.

**Stufe 2 — Leistungsseiten.** Sieben Schemata, eines je Leistungsseite, Typ
nach Abschnitt 4.2 je nach Inhalt der Leistung.
Setzt die in Stufe 1 bestätigte Bildsprache fort.

Der Zwischenstopp ist bewusst gesetzt: Die Bildsprache wird an drei Beispielen
überprüfbar, bevor sie siebenfach wiederholt wird.

## 10 · Offene Punkte

- **`public/logos/` ist leer.** Die Logo-Freigaben liegen laut Abstimmung vor.
  Sechs Dateien nach `public/logos/` würden `LogoStrip.astro` sofort von
  Wortmarken auf echte Bildmarken heben — unabhängig von diesem Design und mit
  dem besten Aufwand-Wirkung-Verhältnis der gesamten Seite. Nicht Teil dieser
  Spec, aber empfohlen.
- **Tippfehler:** `case-card__initials` enthält `BMBFSFJ`, `case-card__title`
  und `kunden.ts` schreiben `BMFSFJ`. Wird beim Ersetzen der Kürzel gegenstandslos,
  in `kunden.ts` aber separat zu korrigieren.
- **`DESIGN_GUIDE.md` ist veraltet.** Er führt `ServiceCard`, `ReferenceCard`
  und `TabNav` auf; diese Komponenten existieren nicht mehr. Der Guide sollte um
  die neue Bildsprache ergänzt und dabei bereinigt werden.
- **Die acht Kennzahlen werden grafisch hervorgehoben** und damit stärker
  wahrgenommen. Sollten einzelne Werte Schätzungen oder Momentaufnahmen sein,
  ist das vor der Umsetzung zu klären.
