# Spamschutz des Anfrageformulars

Stand 31.08.2026, überarbeitet nach der Festlegung auf reines
GitHub-Pages-Hosting. Gilt für `src/components/LeadForm.astro`.

> **Vorbemerkung, die alles andere bestimmt:** Die Seite wird statisch
> ausgeliefert. Es gibt keinen eigenen Server, auf dem etwas geprüft
> werden könnte. Damit fallen alle Verfahren weg, die einen signierten
> Wert vom Server brauchen — also auch ALTCHA und ein fälschungssicherer
> Zeitstempel. Was bleibt, läuft im Browser des Besuchers und lässt sich
> von jemandem, der es darauf anlegt, umgehen. Es hält den Massenversand
> ab, nicht den gezielten Angriff. Diese Unterscheidung ist wichtig, weil
> sonst eine Sicherheit behauptet würde, die es nicht gibt.
>
> **Offen und dringend:** Wohin das Formular überhaupt sendet, ist
> ungeklärt — siehe Abschnitt 6.

---

## 1 · Die unangenehme Wahrheit zuerst

Alles, was im Browser passiert, kann ein Bot überspringen. Wer den
Endpunkt kennt und direkt dorthin sendet, sieht weder Honigtopf noch
Zeitschranke noch Rechenaufgabe. Auch die Rechenaufgabe selbst ist
clientseitig lösbar: `7 + 4` steht als Text im DOM, ein Skript liest sie
und rechnet.

Was diese drei Stufen wirklich leisten: Sie halten die Skripte ab, die
das Netz nach Formularen absuchen und stumpf ausfüllen — und das ist der
allergrößte Teil des Formularspams. Gegen einen Angreifer, der sich diese
eine Seite ansieht, helfen sie nicht.

## 2 · Warum kein reCAPTCHA

reCAPTCHA überträgt IP-Adresse und Nutzungsverhalten an Google in die
USA. Das ist eine Verarbeitung personenbezogener Daten durch einen
Drittanbieter und braucht eine Einwilligung nach Art. 6 Abs. 1 lit. a
DSGVO — mehrere Landesdatenschutzbehörden haben das so bewertet. Damit
entsteht ein Widerspruch: Die Einwilligung muss vor der Verarbeitung
eingeholt werden, der Spamschutz soll aber vor der Einwilligung greifen.
Ein Banner, das man wegklicken kann, schützt nichts.

hCaptcha ist etwas besser, überträgt aber ebenfalls an einen Dritten.

Was hier eingesetzt wird, verarbeitet **keine personenbezogenen Daten
und überträgt nichts an Dritte**. Es fällt damit unter Art. 6 Abs. 1
lit. f (berechtigtes Interesse an der Abwehr missbräuchlicher Nutzung)
und braucht keine Einwilligung. In der Datenschutzerklärung muss dafür
nichts ergänzt werden, weil nichts gespeichert und nichts weitergegeben
wird.

## 3 · Was im Formular steckt

| Maßnahme | Wirkung | Datenschutz |
|---|---|---|
| **Zwei Honigtöpfe** (`_gotcha`, `homepage`) | Felder, die kein Mensch sieht. Wer sie füllt, ist ein Skript. | speichert nichts |
| **Zeitschranke** (`form_started`) | Absenden in unter 2,5 Sekunden gilt als maschinell. | ein Zeitstempel im Formular, nichts im Browser gespeichert |
| **Bedienungsnachweis** (`interaktion`) | Ein Bot, der Werte per Skript setzt, löst kein `pointerdown`, `keydown` oder `input` aus. Ohne eine einzige Bedienung wird nicht gesendet. | zählt keine Ereignisse, speichert keine Bewegung — nur „ja/nein" |

Alle drei verwerfen stillschweigend. Wer erfährt, woran er gescheitert
ist, baut es beim nächsten Versuch nach.

Gegenprobe im Browser, mit abgefangenem Request:

```
A) Bot füllt alles per Skript, ohne Ereignisse   → verworfen
B) Honigtopf gefüllt, sonst echte Bedienung      → verworfen
C) Echte Eingabe                                 → durchgelassen
```

## 4 · Was das PHP-Skript ergänzen sollte

Nach Wirkung sortiert. Nichts davon braucht einen Drittanbieter.

1. **Die Felder gegenprüfen, die das Formular mitschickt.**
   `_gotcha` und `homepage` müssen leer sein, `interaktion` muss `1`
   sein, `form_started` muss mindestens 2,5 Sekunden zurückliegen und
   plausibel jung sein. Ein Bot, der direkt POSTet, schickt diese Felder
   meist gar nicht mit — schon deren Fehlen ist ein Signal.

2. **Rate Limit pro IP.** Etwa fünf Anfragen pro Stunde. Die IP darf
   dafür verarbeitet werden (berechtigtes Interesse), sollte aber nur
   als Hash und nur für die Dauer des Zeitfensters gespeichert werden.
   Das ist die wirksamste einzelne Maßnahme überhaupt.

3. **Inhaltsheuristik.** Mehr als zwei bis drei Links in der Nachricht,
   kyrillische Schrift in einem deutschen Formular, `[url=` oder BBCode,
   Nachricht identisch zum Namen — jedes für sich ein Punkt, ab einer
   Schwelle aussortieren statt zustellen.

4. **Wegwerf-Adressen** gegen eine lokale Liste prüfen
   (`mailinator.com` und Verwandte). Liste im Skript, kein Dienst.

5. **Referrer und Origin** prüfen: Der Request soll von `dk-dk.de`
   kommen. Leicht zu fälschen, kostet aber nichts.

6. **Falls doch ein sichtbares Captcha nötig wird: ALTCHA.** Quelloffen,
   selbst hostbar, arbeitet mit einer Rechenaufgabe im Browser statt mit
   Verhaltensanalyse. Keine personenbezogenen Daten, keine Übermittlung
   in Drittstaaten, keine Einwilligung nötig. Braucht einen eigenen
   Endpunkt, der Aufgaben ausgibt und Lösungen prüft — deshalb hier
   nicht eingebaut, sondern als Option notiert.

## 5 · Was das Formular zusätzlich schickt

Für die Auswertung im PHP stehen bereit:

```
page          sprechender Seitenname, z. B. „SEO & GEO"
page_url      vollständige Adresse der Seite
form_started  Zeitstempel in Millisekunden
interaktion   „1", wenn das Formular bedient wurde
_gotcha       Honigtopf, muss leer sein
homepage      Honigtopf, muss leer sein
```
