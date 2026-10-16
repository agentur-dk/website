# 🎨 Designguide – agentur dk Website (dk-dk.de)

> **Zweck:** Dieser Guide ist die verbindliche Referenz für ALLE neuen Seiten und Weiterentwicklungen der agentur-dk-Website. Beim Bauen neuer Seiten: Guide lesen und umsetzen.
> **Stand:** 16.10.2026 · Eigenständiges Designsystem der agentur dk
>
> Alle Abschnitte beschreiben den gebauten Stand. Maßgeblich bei einem
> Widerspruch ist der Code: Farben in `src/styles/mono.css`, Schriftleiter
> und Abstände in `src/styles/tokens/`.

---

## 1. Farbpalette — monochrom, ein Akzent

Schwarz, Grau, Weiß und **ein** Blau. Hierarchie entsteht aus Grad,
Helligkeit und Laufweite, nicht aus Farbe (Herleitung:
`docs/superpowers/specs/2026-08-30-mummentum-analyse.md`).

| Rolle | Dunkel (Grundzustand) | Hell (`.section--hell`) |
|---|---|---|
| Grund | `#101010` | `#f3f3f3` |
| Fläche, Karte | `#0b0b0b` | `#ffffff` |
| Fläche abgesetzt | `#141414` | `#eaeaea` |
| Linie | `#212121` | `#dcdcdc` |
| tragende Kante | `#3a3a3a` | `#8a8a8a` |
| Text | `#f3f3f3` | `#101010` |
| Text gedämpft | `#9c9c9c` | `#565656` |
| Akzent als Text | `#5090d0` | `#1C60AD` |

Das Blau `#1C60AD` ist zugleich Knopf- und Abschlussfläche
(`.section--blau`). Der Akzent wechselt auf hellem Grund, weil `#5090d0`
auf `#f3f3f3` nur 3,03 : 1 erreicht.

**Keine weitere Akzentfarbe.** Grün und Rot für Ja/Nein, farbige
Initialenkästen und ähnliche Einzelfarben sind am 16.10.2026 entfernt
worden. Einzige benannte Ausnahme: die Sprachnachricht auf der
Startseite bildet eine WhatsApp-Blase nach und trägt deren Farben.

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

### Knöpfe
- `btn--primary` / `btn--accent`: Fläche `#1C60AD`, weiße Schrift, mindestens 44 px hoch
- `btn--outline` / `btn--secondary`: ohne Fläche, mit Rahmen
- **Eckig.** Bedienelemente tragen `--radius-md`; `--radius-full` ist nur
  für Kreise (Porträt, Punkt) da, nicht für Knöpfe oder Filter
- Fokus: `outline: 3px solid var(--color-focus)` mit Abstand

### Verzeichnis statt Kartenraster
Leistungen stehen als **Verzeichnis** (`Leistungsverzeichnis.astro`): eine
Zeile je Eintrag, Titel links, Erklärung daneben, mit Link die ganze Zeile
als Klickfläche. Die Liste der Leistungen liegt in `src/data/leistungen.ts`
und speist Startseite und Leistungsübersicht. Sechs gleich aussehende
Karten nebeneinander sind das Muster, das abgelöst wurde.

### Referenzen
Eine Quelle: `src/data/referenzen.ts`, angezeigt über `ReferenzKarte.astro`
auf Startseite (`startseite`), Projekte (alle, filterbar nach `themen`) und
Über uns (`ueberUns`). **Nur echte Kunden mit Namen**, jede mit Freigabe
und Datum; keine anonymisierten Fälle, Zahlen nur mit Nachweis. Die
Bildfläche ist ein Dither-Raster, keine Initialen, kein Screenshot.

### Ablauf
`process-list`: vier nummerierte Schritte. Die Überschrift ist je Seite
eigen („Vom Audit zur messbaren Sichtbarkeit"), nicht dieselbe Formel
auf jeder Leistungsseite.

### Anfrageformular (`LeadForm.astro`)
- **Drei Schritte:** Anliegen → Nachricht → Kontakt, mit Fortschrittsleiste
- Ohne JavaScript stehen alle Schritte untereinander und das Formular
  schickt ein klassisches POST
- Datenschutzhinweis als Link, keine Einwilligungs-Checkbox
- Verstecktes Feld `page` mit dem Seitennamen
- Spamschutz: Honigtopf und Zeitschranke, kein reCAPTCHA (IP-Übertragung)

## 5. Fußzeile und Abschluss
- Fußzeile dunkel (`#0b0b0b`) mit gerasterter Fläche als Streifen an der
  Oberkante, über dem kein Text steht; kein Farbverlauf mehr
- Abschluss je Seite **einmal**: `CtaSection.astro` auf der blauen Fläche
  oder das Anfrageformular. Nach dem Abschluss folgt nur die Fußzeile

## 6. Einwilligung
CookieConsent (`vanilla-cookieconsent`) über `src/lib/einwilligung-basis.ts`,
Kategorien `necessary`, `analytics`, `einbettungen`. Fremde Einbettungen
(Podigee-Player) laden erst nach Zustimmung. Regeln und Gegenprobe: globale
`CLAUDE.md`, Abschnitt *Einwilligung*.

## 7. Navigation
- **Hauptnavigation:** Start · Leistungen (Aufklappmenü mit allen
  Leistungsseiten) · Referenzen · Marken · Jobs · Über uns · „Erstgespräch"
- Aktuelle Seite: `aria-current="page"` am zutreffenden Link. Auf einer
  Leistungsseite trägt es der Unterpunkt; „Leistungen" ist dort nur
  sichtbar als Bereich markiert (`nav-link--bereich`)
- **Fußzeile:** vier Spalten (Agentur, Leistungen, Unternehmen, Kontakt),
  dazu Impressum, Datenschutz, Barrierefreiheit und „Cookie-Einstellungen"

## 8. Barrierefreiheit (Pflicht)
- Kontraste ≥4,5:1 (Text) bzw. ≥3:1 (UI), siehe Farbtabelle
- Fokus-Ringe überall (`:focus-visible`)
- Skip-Link, Landmarks, `aria-label`s, sr-only-Texte
- Target-Size ≥24px (Checkboxen/Radios 24px, Touch-Ziele 44px)
- `prefers-reduced-motion` respektieren

## 9. Performance (Pflicht)
- CSS wird in jede Seite eingebettet (`inlineStylesheets: 'always'`): ein
  Roundtrip weniger, auf dem Telefon der entscheidende Punkt (`AUDIT.md` 3.1)
- Schriften lokal, `font-display: optional`, kritische Schnitte vorgeladen
- Lighthouse-Schwelle 99 in allen Kategorien, gemessen über `npm run verify`

## 10. Konsistenz-Pflicht
Bei jeder Weiterentwicklung oder Wegfall von Bereichen: **Nav, Footer, Startseiten-Karten, Cross-Links, sitemap.xml und llms.txt mit anpassen** (Daniel-Vorgabe, in MEMORY.md verankert).

---

## 11. Wo was steht

| Was | Datei |
|---|---|
| Farben der Bildsprache | `src/styles/mono.css` |
| Schriftleiter, Abstände, Rinnen | `src/styles/tokens/` |
| Seiten, Navigation, Kontaktdaten | `src/config/site.config.ts` |
| Leistungen | `src/data/leistungen.ts` |
| Referenzen | `src/data/referenzen.ts` |
| FAQ (Akkordeon, JSON-LD, llms.txt) | `src/data/faq.ts` |
| Dramaturgie der Startseite | `docs/startseite-brief.md` |

Neue Seiten nutzen `BaseLayout.astro` mit `mono`; der Dateiname ist die
URL. Gate vor jedem Push: `npm run verify`, Exitcode lesen.
