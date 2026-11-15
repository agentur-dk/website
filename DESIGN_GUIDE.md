# 🎨 Designguide – agentur dk Website (dk-dk.de)

> **Zweck:** Dieser Guide ist die verbindliche Referenz für ALLE neuen Seiten und Weiterentwicklungen der agentur-dk-Website. Beim Bauen neuer Seiten: Guide lesen und umsetzen.
> **Stand:** 15.11.2026 · Eigenständiges Designsystem der agentur dk
>
> Alle Abschnitte beschreiben den gebauten Stand. Maßgeblich bei einem
> Widerspruch ist der Code: Farben in `src/styles/mono.css`, Schriftleiter
> und Abstände in `src/styles/tokens/`.

---

## 1. Positionierung und Farbpalette

**Seit 15.11.2026.** Die Seite sagt eine Sache: *Wir machen Ihr
Unternehmen sichtbar*, in der eigenen Zielgruppe und in einer neuen.
Zielgruppe sind Betriebe mit 10 bis 50 Mitarbeitern, das einzige Angebot
ist der **Sichtbarkeits-Check** (30 Minuten, kostenfrei,
`beratung.html`). Jeder Hauptknopf heißt „Sichtbarkeits-Check
vereinbaren“, daneben steht die Telefonnummer.

Die Farben sind hell und warm statt schwarz: Papier als Grund, Sand für
abgesetzte Abschnitte, dk-Blau als einziger Akzent, Nachtblau für
Abschluss und Fußzeile.

| Rolle | Papier (Grundzustand) | Sand (`.section--hell`) | Nachtblau (`.section--blau`, Fußzeile) |
|---|---|---|---|
| Grund | `#FBF8F3` | `#F1EADF` | `#14365F` (Fußzeile `#0F2A4A`) |
| Fläche, Karte | `#FFFFFF` | `#FFFFFF` | `#1A4271` |
| Linie, Kartenrahmen | `#8A8478` | `#8A8478` | Weiß 45 % |
| tragende Kante | `#5F5A50` | `#5F5A50` | Weiß 70 % |
| Text | `#1B1B1F` | `#1B1B1F` | `#FFFFFF` |
| Text gedämpft | `#55534E` | `#55534E` | `#C9D6E8` |
| Akzent als Text, Knopf | `#1C60AD` | `#1C60AD` | Weiß |

Kontraste: Text 16,2 : 1, gedämpft 7,3 : 1 (Sand 6,4), Akzent 6,0 : 1
(Sand 5,3), Linie 3,5 : 1 (Sand 3,1). Knopf-Hover `#164E8E`.

**Keine weitere Akzentfarbe.** Einzige benannte Ausnahme: die
Sprachnachricht bildet eine WhatsApp-Blase nach und trägt deren Farben.

**Keine Punktraster, keine Monospace-Etiketten, keine Versalien.** Die
gerasterten Flächen der Fassung vom 16.10.2026 sind entfernt; Bilder sind
echte Fotos und echte Bildschirmfotos.

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
| Überschriften, Kennzahlen | **Manrope** | 700 |
| Fließtext, Bedienelemente | **Manrope** | 400 / 500 / 600 / 700 |
| Etiketten über Überschriften | **Manrope** | 700, in Akzentblau, normale Schreibweise |

Eine Familie für alles. Lokal gehostet in `public/fonts/`, kein CDN,
`font-display: optional`, vorgeladen werden Manrope 700 und 400.

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

`npm run check:kontrast` misst seit dem 15.11.2026 jede **umrandete
Fläche** (Karten, Kästen, Felder, Knöpfe) in zwei Breiten: Ihr Rahmen,
über den Grund gemischt, oder ihre Füllung muss sich mit mindestens
3 : 1 abheben. Beim ersten Lauf meldete sie 20 Arten von Karten mit
1,24 bis 1,48 : 1; seither tragen Kartenrahmen `#8A8478`.

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
- Leicht gerundet (`--radius-md`, 6 px); `--radius-full` nur für Kreise
  (Porträt, Punkt)
- Fokus: `outline: 3px solid var(--color-focus)` mit Abstand

### Leistungen in drei Feldern
`src/data/leistungen.ts` ordnet jede Leistung einem Feld zu: `auftritt`
(gefunden werden), `reichweite` (neue Menschen erreichen), `entlastung`
(KI im Betrieb). `leistungen.astro` zeigt je Feld Karten, die mit dem
Satz eines Kunden beginnen. Die Leistungsseiten bleiben als Landeseiten,
stehen aber nicht mehr im Menü.

### Referenzen
Eine Quelle: `src/data/referenzen.ts`, angezeigt über `ReferenzKarte.astro`
auf Startseite (`startseite`), Projekte (alle, filterbar nach `themen`) und
Über uns. **Nur echte Kunden mit Namen**, jede mit Freigabe und Datum;
Zahlen nur mit Nachweis. Die Bildfläche ist ein **Bildschirmfoto der
Kundenseite** (`bildschirm`, Datei in `src/assets/referenzen/`), sonst
eine ruhige Fläche mit der Branche. Nur Aufnahmen ohne erkennbare
Personen: Das Repository ist öffentlich.

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
- Fußzeile Nachtblau `#0F2A4A`, eine Stufe dunkler als der Abschluss
- Abschluss je Seite **einmal**: `CtaSection.astro` auf der blauen Fläche
  oder das Anfrageformular, immer mit dem Sichtbarkeits-Check. Nach dem
  Abschluss folgt nur die Fußzeile

## 6. Einwilligung
CookieConsent (`vanilla-cookieconsent`) über `src/lib/einwilligung-basis.ts`,
Kategorien `necessary`, `analytics`, `einbettungen`. Fremde Einbettungen
(Podigee-Player) laden erst nach Zustimmung. Regeln und Gegenprobe: globale
`CLAUDE.md`, Abschnitt *Einwilligung*.

## 7. Navigation
- **Hauptnavigation:** Leistungen · Referenzen · Über uns · „Sichtbarkeits-Check“,
  davor die Telefonnummer (unter 1024 px nur als Symbol)
- Marken und Jobs stehen in der Fußzeile; „Referenzen“ bzw. „Über uns“
  sind auf diesen Seiten als Bereich markiert (`nav-link--bereich`),
  ebenso „Leistungen“ auf jeder Leistungsseite
- **Fußzeile:** vier Spalten (Agentur, Leistungen, Unternehmen, Kontakt),
  dazu Impressum, Datenschutz, Barrierefreiheit und „Cookie-Einstellungen“

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
