# Analyse mummentum.de — Typografie und Dither-Bildsprache

Aufgenommen am 30.08.2026 aus dem ausgelieferten HTML, dem CSS-Bundle
(`365u72w4zm1ad.css`) und dem JS-Chunk `18wplodw3r_4r.js`, dazu vier
Screenshots bei 1440 px. Alles hier Beschriebene ist nachgemessen, nicht
geschätzt.

---

## 1 · Was die Seite typografisch tut

### 1.1 Ein einziger Schriftschnitt

Der auffälligste Befund zuerst: **auf der ganzen Seite steht kein einziges
fettes Wort.** Im Markup kommt `font-semibold` und `font-bold` kein Mal vor,
`font-normal` acht Mal. Alle Überschriften — bis zur 80-px-Zeile im Hero —
laufen in Regular (400).

Hierarchie entsteht stattdessen aus drei anderen Größen:

| Mittel | Beispiel |
|---|---|
| Schriftgrad | 10 px Label ↔ 80 px Headline, Faktor 8 |
| Helligkeit | `chalk` → `chalk/75` → `chalk/65` → `chalk/60` |
| Laufweite | Headline −0,04 em ↔ Mono-Label +0,20 em |

Das ist der Grund, warum die Seite ruhig wirkt. Fett erzeugt Lärm; ein
großer, eng laufender Regular-Satz erzeugt Gewicht ohne Lärm.

### 1.2 Zwei Familien mit strikt getrennten Aufgaben

- **Geist (Sans)** — alles, was gelesen wird: Headlines, Fließtext, Karten.
- **Geist Mono** — ausschließlich Mikro-Beschriftungen: Rubriken
  („AUSGANGSLAGE"), Zähler („01"), Navigation, Buttons, Bildunterschriften.
  Nie größer als 12,5 px, immer Versalien, immer weit laufend.

Der Mono-Satz ist damit kein zweiter Textstil, sondern **Beschilderung**.
Er sagt „das hier ist Metatext" und trennt Struktur von Inhalt, ohne dass
eine Farbe oder ein Rahmen dafür nötig wäre.

### 1.3 Die Laufweiten-Kurve

Laufweite ist an den Schriftgrad gekoppelt, streng monoton:

| Grad | tracking |
|---|---|
| clamp(42–80 px) | −0,04 em |
| clamp(32–54 px) | −0,035 em |
| clamp(30–46 px) | −0,03 em |
| 22–26 px | −0,02 em |
| 17–19 px | −0,01 … −0,015 em |
| 14–15 px | 0 |
| Mono 9–12 px | **+0,16 … +0,20 em** |

Große Grade werden enger, kleine weiter. Bei 80 px schließen sich sonst die
Wortbilder nicht; bei 10 px Versalien zerfällt der Satz ohne Sperrung.

### 1.4 Die Durchschuss-Kurve — gegenläufig

| Rolle | line-height |
|---|---|
| Display 42–80 px | 0,97 – 1,03 |
| H2 32–54 px | 1,01 |
| H3 18–26 px | 1,25 (`leading-tight`) |
| Fließtext 13,5–17 px | 1,625 (`leading-relaxed`) |

Groß = eng, klein = luftig. In Kombination mit der Laufweiten-Kurve ergibt
das den geschlossenen Block oben und den atmenden Absatz unten.

### 1.5 Zeilenlänge in Zeichen, nicht in Pixeln

Jede Textspalte hat ein `max-w` in `ch`:

- Headlines: **15–22 ch** — bewusst kurz, dazu `text-balance`.
  Die Hero-Zeile bricht dadurch in vier Zeilen und wird zum Block.
- Lead: **52–58 ch**
- Kartentext: **32–38 ch**

Die Headline ist kein Satz, der zufällig umbricht, sondern eine gesetzte
Fläche.

### 1.6 Headline + Subheadline — drei Muster

**a) Zweifarbige Headline (Hero).** Ein Satz, zwei Helligkeiten:

> **Mach dein Unternehmen bereit für KI,** (chalk)
> *die im Alltag funktioniert.* (smoke)

Kein zweites Element, kein zweiter Grad — die Subheadline ist der zweite
Halbsatz, nur heller. Das ist die stärkste Idee auf der Seite.

**b) Rubrik über Headline.** `—— AUSGANGSLAGE` in Mono, Versalien,
+0,2 em, `smoke`, mit vorangestelltem kurzen Strich. Darunter `mt-7` die
Headline.

**c) Zweispalter mit Bodenausrichtung.** Links die Headline
(`max-w-[16ch]`), rechts der Lead (`max-w-[56ch]`, 17 px), der Container
auf `items-end`. Der Lead sitzt damit auf der Grundlinie der letzten
Headline-Zeile statt oben zu kleben.

### 1.7 Abstände

Rhythmus in wenigen, wiederkehrenden Schritten:

- Sektion: `py-20` → `lg:py-24`/`lg:py-28`; seitlich `px-5` → `sm:px-8` → `lg:px-12`
- Rubrik → Headline: `mt-7`
- Headline-Block → Karten: `mt-14`
- In der Karte: Zähler → H3 `mt-5`, H3 → Text `mt-4`, Text → Fazit `mt-7` mit
  Trennlinie und `pt-5`

Der Fazitsatz jeder Karte hängt unter einer Linie und ist heller gesetzt als
der Absatz darüber — dieselbe Mechanik wie bei der zweifarbigen Headline.

### 1.8 Farbe

```
--canvas    #101010   Seitengrund
--obsidian  #0b0b0b   Karten, Sektionen
--panel     #141414
--chalk     #f3f3f3   Text
--smoke     #9c9c9c   Metatext
--graphite  #212121   Rahmen
```

Keine Markenfarbe. Kein Verlauf außer als Maske. Die einzige „Farbe" auf der
Seite ist die weiße Pille des Primärknopfes.

---

## 2 · Die „ASCII-Videos" — was sie technisch sind

Es sind **keine** Videos und keine ASCII-Zeichen. Es ist
**1-Bit-Ordered-Dithering auf einem winzigen Canvas**, hochskaliert mit
`image-rendering: pixelated`. Deshalb sieht es aus wie ein Zeichenraster.

### 2.1 Das Verfahren

```
paintDither(canvas, feld, zeit, { cell, matrix, transparent })
```

1. `getBoundingClientRect()` messen.
2. `canvas.width = Math.round(breite / cell)` — bei `cell: 3` ist ein
   Canvas-Pixel 3 CSS-Pixel groß. Ein 1200 px breites Band rechnet also nur
   400 Spalten.
3. Für jedes Pixel `lum = feld(x, y, W, H, zeit)`, geklemmt auf 0…1.
4. **Schwelle:** `an = lum > BAYER[y % n][x % n]`.
5. `an` → RGB(243,243,243) α255, sonst transparent (oder RGB(11,11,11)).
6. `putImageData`.

Die Bayer-Matrix ist normalisiert `(v + 0.5) / n²`:

```
BAYER4 = [[0,8,2,10],[12,4,14,6],[3,11,1,9],[15,7,13,5]]
BAYER8 = 8×8-Variante für weichere Verläufe
```

Kein WebGL, keine Bibliothek, keine Bilddatei. Die gesamte Zeichenlogik ist
eine Handvoll Mathematik.

### 2.2 Die Felder — jede Sektion ein anderes

| Feld | Formel (Kern) | Wirkung |
|---|---|---|
| `sphere` | Lambert-Beleuchtung einer Kugel, Lichtvektor rotiert mit `cos(0.00035·t)` | Der Hero-Ball |
| `wave` | zwei überlagerte Sinus-Bänder, Abstand zur Mittellinie | fließendes Band |
| `noise` | zwei Oktaven Value-Noise, driftend | körniger Nebel |
| `tonal` | `x / (W-1)` | statischer Verlauf links→rechts |
| `ripple` | `sin(0.14·r − 0.0026·t)` um die Mitte | konzentrische Ringe |
| `stream` | `sin(0.55·y)` × Noise | horizontale Fäden |
| `ramp` / `edge` / `glow` / `horizon` | Verläufe mit Sinus-Störung | Kartenköpfe |

### 2.3 Wo sie stehen — 13 Instanzen

| Ort | Maße | Behandlung |
|---|---|---|
| **Hero** | rechte Spalte | `mask-image: radial-gradient(72% 72% at 50% 48%, black 46%, transparent 88%)`, `cell: 2`, interaktiv ab `sm` |
| **Kartenköpfe** (3×) | `h-32` | `opacity-45`, im Hover `opacity-70`, darüber `bg-gradient-to-t from-obsidian` |
| **Trenner** (8×) | `h-28 sm:h-32` | `opacity-80`, `mask-image: linear-gradient(to right, transparent, black 16%, black 84%, transparent)`, dazu ein Mono-Label unten links |
| **Abschluss-CTA** | rechte 58 % | `opacity-22`, Verlauf darüber |

Die Trenner sind das tragende Element: acht Mal dieselbe Bauform, jedes Mal
ein anderes Feld und ein anderes Label. Sie ersetzen die Abstände zwischen
den Sektionen.

### 2.4 Performance und Barrierefreiheit

Sauber gelöst, das übernehmen wir mit:

- `IntersectionObserver` mit `rootMargin: 120px` — außerhalb des Bildschirms
  läuft keine Schleife.
- Feste **30 fps** (Trenner) bzw. ~18 fps (`DitherCanvas`, 55 ms) statt
  `requestAnimationFrame` in voller Rate.
- `prefers-reduced-motion: reduce` → **ein einziges Standbild** bei `t = 1600`,
  kein Animationsframe.
- Resize entprellt (120–130 ms).
- Jedes `<canvas>` trägt `aria-hidden="true"`; der Hero-Container hat ein
  `aria-label` mit Beschreibung.
- `tonal` ist bewusst statisch (`animate: false`).

### 2.5 Weitere Details

- **Reveal:** `opacity 0 → 1`, `translateY(20px) → 0`, 750 ms
  `cubic-bezier(.22,1,.36,1)`, Staffelung 90/180/270 ms, per
  IntersectionObserver bei `threshold .05`, Fallback-Timeout 2 s, bei
  `prefers-reduced-motion` sofort sichtbar.
- **Hintergrundraster:** sehr schwache senkrechte Linien über die volle
  Seitenhöhe, an den Spaltenkanten.
- **Knöpfe:** vollrunde Pille, weiß gefüllt, Mono-Versalien 12,5 px mit `→`.
  Sekundär: Mono-Versalien mit dünner Unterlinie.

---

## 3 · Übertragung auf dk-dk.de — Stand 30.08.2026

Abgestimmt: monochrom mit Blau als einzigem Akzent, eigene Schriften mit
den Regeln der Vorlage, Dither statt echter ASCII-Zeichen, Startseite als
Muster. Die übrigen 15 Seiten bleiben unverändert.

### 3.1 Was gebaut wurde

| Datei | Rolle |
|---|---|
| `src/lib/dither.ts` | Bayer-Matrizen, Wertrauschen, sieben Felder, `paintDither` |
| `src/lib/dither.test.ts` | 11 Tests: Schwellen, Determinismus, Stetigkeit, Spannweite, 1×1-Fläche |
| `src/components/ui/Dither.astro` | Das `<canvas>` plus die gemeinsame Laufzeit |
| `src/components/DitherBand.astro` | Der Trenner zwischen zwei Sektionen |
| `src/styles/mono.css` | Farbwelt und Typografie der Bildsprache |

Vier Einsatzarten auf der Startseite, wie besprochen:

- **Hero** — `sphere`, Raster 4, radial ausmaskiert, rechts neben dem Satz
- **Kartenköpfe** — `ripple` und `noise` auf den beiden Schwerpunkt-Karten,
  Deckkraft 0,45 → 0,7 im Hover, darüber ein Verlauf zur Kartenfarbe
- **Trenner** — sechs Bänder mit `wave`, `noise`, `stream`, `ripple`,
  `horizon`, `gradient`, jedes mit eigenem Mono-Etikett
- **Footer** — `stream`, in der unteren Hälfte, nach oben ausgeblendet

### 3.2 Typografie

Die Schriftfamilien bleiben: Space Grotesk für Überschriften, Manrope für
Text. Keine neue Datei, kein Tausch.

Übernommen sind die Regeln: ein Schnitt (400) für alle Überschriften, die
Laufweiten- und Durchschusskurve als Tokens in `tokens/typography.css`,
Zeilenlänge in `ch`. Die H1 setzt den zweiten Halbsatz in
`--color-text-muted` — Headline und Subheadline in einem Satz.

Monospace ist auf Etiketten beschränkt: Rubriken, Zähler,
Footer-Überschriften, CTA-Labels. **Navigation und Knöpfe bleiben
ausdrücklich außen vor.** Sie hatten kurzzeitig Monospace, Versalien und
Pillenform; das ging über die Absprache hinaus ("Mono nur für
Mikro-Labels"), und die Pillenform widersprach zusätzlich der Vorgabe im
`@theme`-Block, dass UI-Elemente eckig bleiben.

### 3.3 Drei Fallen, alle im gebauten HTML nachgemessen

**Custom Properties lösen sich dort auf, wo sie deklariert sind.**
`--color-bg-light: var(--dk-color-bg-light)` steht durch `@theme` auf
`:root`. Ein `--dk-`-Wert weiter unten im Baum kommt nie an: Die
Substitution ist an `:root` schon passiert. Mit dem `--dk-`-Override blieb
`.section--light` auf `rgb(245,246,248)` stehen. Überschrieben werden
deshalb die `--color-*`-Namen.

**Astros Scope-Attribut landet nicht auf Kindkomponenten.** Eine Klasse,
die eine Komponente an `<Icon>` oder `<Dither>` durchreicht, trägt den
Hash nicht. Betroffen waren `.nav-chevron`, die Umschaltung im
Bewegungs-Schalter und die Maske der Trennerbänder — Letztere lief
dadurch ungedämpft bis an die Fensterkante. Lösung: `:global()` für die
zwei Zustandsregeln, ein eigener Container für die Flächen.

**Komponenten-Styles schlagen `.theme-mono h2`.** Scoped Regeln erreichen
(0,2,0), `.theme-mono h2` nur (0,1,1). Footer-Überschriften und der
Abschluss-CTA blieben in 700 stehen. Die doppelt notierte Klasse
`.theme-mono.theme-mono` hebt die Regel auf (0,2,1).

### 3.4 Messwerte

- axe-core 0 Verstöße, WCAG-Zusatzprüfung ohne Befund, 105 Tests grün
- Bewegung: Schalter im Footer und `prefers-reduced-motion` halten die
  Raster an — im Browser gegengeprüft (Frames identisch)
- CLS 0. Die Kugel hing zuerst an `top: 50%` und damit an der Höhe des
  Hero; beim Schriftwechsel rutschte sie um gut 60 px (CLS 0,061). Sie
  steht jetzt vom oberen Rand aus.
- Lighthouse mobil: alle Seiten 100, die **Startseite schwankt zwischen
  98 und 100** — siehe 3.5.

### 3.5 Warum die Startseite an der Schwelle liegt

Nachtrag, wichtig für die Einordnung: Die ersten Messreihen liefen auf
einer Maschine, auf der parallel ein zweiter Server und ein
Vergleichsbau beschäftigt waren, und meldeten fünfmal hintereinander 98.
Auf ruhiger Maschine sind es 100, 100, 98, 100 bei FCP 1,4 s. Die Seite
liegt also nicht unter der Schwelle, sondern **auf** ihr: FCP pendelt um
den Punkt, an dem Lighthouse von 1,0 auf 0,9 abwertet. Für das Gate
heißt das, dass ein Lauf durchfallen kann, ohne dass sich am Code etwas
geändert hat.

Die Ursachenanalyse darunter bleibt gültig — sie erklärt, warum die
Seite überhaupt so nah an die Kante gerückt ist.

FCP 1,7 s statt 1,1 s (unter Last gemessen). Nicht die Flächen: Ein Testbau ganz ohne Dither
misst dieselben 1,7 s. Es sind die Bytes im Dokument — das Stylesheet
liegt inline (`inlineStylesheets: 'always'`), und die Startseite trägt
jetzt **beide** Bildsprachen.

Gegenprobe: Der Basisbau mit 2,4 kB Füllstoff im `<style>` fällt von
FCP 1,1 s auf 1,5 s. In diesem Bereich kostet jedes Kilobyte im Dokument
rund 0,17 s simulierte Ladezeit.

Im CSS der Startseite stehen:

- helle Sektionen: **11.717 B** in 47 Regeln — auf dieser Seite tot,
  seit kein Element mehr `.section--light` trägt
- monochrome Bildsprache: **4.744 B** in 28 Regeln

Der Ausweg ist also nicht, die Bildsprache zu verkleinern, sondern sie
fertig auszurollen: Fallen die hellen Sektionen weg, verliert das
Dokument netto 7 kB und liegt **unter** dem heutigen Stand. Bis dahin
bleibt die Startseite bei 98, und `npm run verify` meldet 31/32.

Ein Zwischenweg wäre, die hellen Regeln genauso in eine eigene Datei zu
legen wie `mono.css` und sie nur von den 15 Seiten laden zu lassen, die
sie brauchen. Das bringt die Startseite sofort zurück, kostet aber einen
Eingriff in `global.css` mit Wirkung auf alle Seiten.

### 3.6 Nebenbefund: falsch vorgeladener Schriftschnitt

`Fonts.astro` lud Space Grotesk **700** vor — den Schnitt der
Überschriften. Auf einer monochromen Seite setzen die aber in **400**.
Damit lagen 19 kB Bandbreite für eine ungenutzte Datei im kritischen
Pfad, während der gebrauchte Schnitt nicht vorgeladen war; bei
`font-display: optional` heißt das, dass die Überschrift für den
Seitenaufruf in der Ersatzschrift bleiben kann. Der Preload folgt jetzt
der Bildsprache.
