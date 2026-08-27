# Kundenlogos

Hier liegen die Bildmarken für die Vertrauensleiste auf der Startseite.
Eingetragen werden sie in `src/data/kunden.ts`, dargestellt von
`src/components/LogoStrip.astro`.

## Was hier hineingehört

**SVG, einfarbig, ohne Hintergrundfläche.** Die Leiste färbt jede Datei
weiß (`brightness(0) invert(1)`). Das heißt:

- Eine weiße Fläche im Logo wird schwarz und ist auf dem dunklen Grund
  als Kasten sichtbar. Freisteller ohne Hintergrund verwenden.
- Mehrfarbige Logos werden zur Silhouette. Wo die Aussage an der Farbe
  hängt (zwei Farbflächen, die sich nur farblich trennen), fällt sie weg —
  in dem Fall die offizielle Weiß-/Negativversion aus dem Markenhandbuch
  anfordern und die statt der bunten Datei ablegen.
- Eingebettete Rasterbilder (`<image>` im SVG) funktionieren zwar, werden
  aber beim Skalieren unscharf. Pfade sind besser.

Dateiname = Slug, klein, mit Bindestrich: `bfw-dueren.svg`.

## Eintragen

```ts
{ name: 'Berufsförderungswerk Düren', logo: 'bfw-dueren.svg', hoehe: 1.6 }
```

`hoehe` gleicht die optische Größe aus: eine breite Wortmarke wirkt bei
gleicher Pixelhöhe größer als ein quadratisches Signet. Vorgabe ist
`1.75` rem; breite Wortmarken meist `1.4`–`1.6`, Signete `2.0`–`2.2`.

Fehlt der `logo`-Eintrag, setzt die Leiste den Namen als Wortmarke. Die
Seite bleibt also vollständig, solange noch nicht alle Dateien da sind.
Steht ein Dateiname drin, den es hier nicht gibt, bricht der Build ab —
lieber ein klarer Fehler als eine stille Lücke in der Reihe.

## Was hier nicht hineingehört

Logos von Bundesbehörden. Das Corporate Design des Bundes lässt keine
Einfärbung und keine sonstige Veränderung zu, und eine Referenznennung
mit Behördenlogo erweckt den Anschein einer amtlichen Empfehlung. Der
Eintrag in `src/data/kunden.ts` trägt dafür das Feld `ohneLogo` mit der
Begründung — bitte nicht ohne Rücksprache entfernen.

## Vor dem Ablegen klären

Ein Logo auf der eigenen Website ist eine öffentliche Referenznennung.
Die braucht die Freigabe des Kunden, unabhängig davon, ob das Logo frei
im Netz steht. Bei Auftraggebern mit Markenhandbuch (Banken, Konzerne,
öffentliche Stellen) kommt die zulässige Negativversion in aller Regel
zusammen mit dieser Freigabe.
