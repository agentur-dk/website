# Startseite: Brief zur Neuordnung

**Self-authored under explicit creative delegation.** Auftrag vom
11.10.2026: „Startseite mit scroll-craft optimieren, Codequalität und
Barrierefreiheit müssen bleiben" — auf Rückfrage „entscheide du,
Variante B". Was unten steht, ist eine Entscheidung, kein Zitat.

## Befund vorher

```
Länge mobil        20 673 px, 14 Abschnitte
gleiche Form       Bausteine, Leistungen, Warum wir, Referenzen:
                   viermal ein Kartenraster hintereinander
Rubrik             über jeder Überschrift eine Großbuchstabenzeile
Zählung            „01" bis „07" an den Leistungen, die keine Folge sind
doppelt            „Kurze Wege" zweimal, „Projekt anfragen" dreimal,
                   „Mehr erfahren" achtmal
Ende               nach dem Formular noch Referenzen, Zahlen, ein
                   zweiter Aufruf: die Seite hört auf, statt zu enden
Anrede             Seite in Sie, Leistungs-Check in du
```

## Die acht Punkte

1. **Stimmung:** ruhig, direkt, belegt. Zeitungsseite, nicht Prospekt.
2. **Reihenfolge:** erkennen, was es gibt → sehen, für wen es schon
   gemacht wurde → hören, wer antwortet → nachschlagen → wissen, wie es
   abläuft → anfragen.
3. **Energie:** laut nur oben und an einer Stelle in der Mitte, sonst
   leise. Das Ende ist ruhig und konkret.
4. **Gefühl und der eine Moment:** siehe Kurve unten.
5. **Was keine andere Seite tut:** Der Leistungs-Check oben verändert die
   Seite darunter. Wer „Neue Mitarbeiter gewinnen" wählt, findet weiter
   unten in der Übersicht Social Recruiting markiert.
6. **Abstand zu Premium-Minimal:** redaktionell, schwarz-weiß wie bisher.
   Keine neue Farbwelt, keine Animation, die Inhalte zurückhält.
7. **Eine Welt oder Szenen:** Kapitel. Kein durchgehender Kameraflug,
   kein Pinning, kein Scroll-Hijacking (siehe BNM-Referenz: „Eigentümer
   sollen Kontakt aufnehmen, nicht scrollen" gilt für uns genauso).
8. **Bestand:** Sprachnachricht, freigegebene Referenzen, Dither-Flächen,
   Kennzahlen 20+/600+/500+ (Angabe Daniel, 11.10.2026). Nichts
   generiert; kie.ai ist ausgeschlossen.

## Gefühlskurve

```
Kopf          Wiedererkennen   „Das ist, was ich suche" — H1 + Check
Logos         Vertrauen        bekannte Namen, kurz
Bausteine     Klarheit         drei Dinge, nicht acht
Referenzen    Spiegel          Praxis, Kanzlei, Verwaltung wie meine
Kurze Wege    NÄHE (Gipfel)    eine Stimme statt eines Absatzes
Leistungen    Überblick        nachschlagen, nicht scrollen
Vorgehen      Ruhe             vier Schritte, nichts Neues
Fragen        Entlastung       Einwände beantwortet
Anfrage       Entschluss       Formular, Telefon, Zahlen, Anschrift
```

Keine zwei Nachbarn tragen dasselbe Gefühl.

**Der Gipfel**, als Satz an einen Bekannten: „Auf deren Seite hab ich
eine Sprachnachricht bekommen, und man hört, wer da rangeht." Er liegt
im Abschnitt *Kurze Wege* und bekommt den meisten Raum: das einzige
Trennband der Seite davor, weiter Abschnittsabstand.

**„Das ist die Seite, auf der** man hört, wer einem antwortet, bevor man
irgendetwas ausfüllt."

## Bewusst gestrichen

- *Warum wir*: wiederholt „Kurze Wege"; BFSG steht bei den Bausteinen,
  Köln im Kopf.
- *Eigene Projekte* als ganzer Abschnitt: steht auf `/marken.html`, hier
  nur noch ein Verweis neben den Referenzen.
- Kennzahlenleiste und zweiter Abschlussaufruf: Die Zahlen stehen jetzt
  am Formular, dort, wo jemand entscheidet.
- Zwei von drei Trennbändern, alle Rubrikzeilen außer Kopf und Gipfel,
  die Zählung an den Leistungen, der Aufruf hinter den vier Schritten.

## Was gleich bleibt

Überschriftenhierarchie, ein `<h1>`, alle Prüfungen (axe, wcag-manual,
Kontrast, Reflow, Lighthouse ≥ 99). Ohne JavaScript ist jede Leistung
erreichbar; die Markierung aus dem Check ist Zugabe, keine Bedingung.
