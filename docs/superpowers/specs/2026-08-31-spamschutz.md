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
| **Honigtopf `hp_email`** | `display: none`, `aria-hidden="true"`, `tabindex="-1"`. Wer es füllt, ist ein Skript. Antwort: der normale Dankeblock, gesendet wird nichts. | speichert nichts |
| **Honigtopf `_gotcha`** | Dasselbe, aber aus dem Bildschirm geschoben statt `display: none`. Manche Bots erkennen `display: none` und lassen solche Felder aus, andere füllen stur alles im Markup. | speichert nichts |
| **Zeitschranke** (`form_started`) | Absenden in unter **3 Sekunden** gilt als maschinell. Nicht signiert — ohne Server nicht möglich. | ein Zeitstempel im Formular, nichts im Browser gespeichert |
| **Rechenaufgabe** (`lf-rechenprobe`) | Zwei einstellige Zahlen, Summe höchstens 18. Entsteht erst im Browser, sonst wäre sie für alle Besucher dieselbe. Falsche Antwort → sofort eine neue. | reiner Text, kein Bild, keine Übermittlung — die Antwort wird nicht mitgesendet |
| **Bedienungsnachweis** (`interaktion`) | Ein Bot, der Werte per Skript setzt, löst kein `pointerdown`, `keydown` oder `input` aus. Ohne eine einzige Bedienung wird nicht gesendet. | zählt keine Ereignisse, speichert keine Bewegung — nur „ja/nein" |

Der Honigtopf spielt Erfolg vor, die übrigen verwerfen stillschweigend
oder melden nur die Rechenaufgabe zurück. Wer erfährt, woran er
gescheitert ist, baut es beim nächsten Versuch nach.

Die Rechenaufgabe steht als Text in der Beschriftung, nicht als
verzerrtes Bild: Ein Screenreader liest „Wie viel ist 7 + 4?" vor, ein
Bild wäre eine Barriere und widerspräche allem, wofür diese Seite wirbt.

Gegenprobe im Browser, mit abgefangenem Request:

```
falsche Antwort               → nicht gesendet, neue Aufgabe steht bereit
richtige Antwort              → gesendet, `rechenprobe` nicht im Payload
hp_email gefüllt              → Dankeblock, nichts gesendet
Absenden 1,5 s nach Aufruf    → nicht gesendet
Werte per Skript, ohne Events → nicht gesendet
```

## 4 · Was ein Server ergänzen könnte — falls es einen gibt

Dieser Abschnitt gilt **nur**, wenn der Endpunkt nach Abschnitt 6 auf
einem Rechner landet, der Code ausführen kann. Auf GitHub Pages ist
nichts davon möglich. Nach Wirkung sortiert; nichts davon braucht einen
Drittanbieter.

1. **Die Felder gegenprüfen, die das Formular mitschickt.**
   `_gotcha` und `hp_email` müssen leer sein, `interaktion` muss `1`
   sein, `form_started` muss mindestens 3 Sekunden zurückliegen und
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

Für eine spätere Auswertung auf einem Server stehen bereit:

```
page          sprechender Seitenname, z. B. „SEO & GEO"
page_url      vollständige Adresse der Seite
form_started  Zeitstempel in Millisekunden
interaktion   „1", wenn das Formular bedient wurde
hp_email      Honigtopf, muss leer sein
_gotcha       Honigtopf, muss leer sein
```

Die Antwort auf die Rechenaufgabe ist bewusst **nicht** dabei: Sie wird
im Browser geprüft und hat auf der Empfängerseite nichts zu suchen.

---

## 6 · Wohin sendet das Formular? (offen)

### Der Stand

`public/CNAME` enthält `dk-dk.de`. Nach dem Umschalten der DNS liefert
GitHub Pages unter diesem Namen aus. Gemessen am 31.08.2026:

```
dk-dk.de                          →  Server: Apache        (goneo, alte Seite)
agentur-dk.github.io/website/     →  Server: GitHub.com    (neue Seite)
dk-dk.de/formular/send.php        →  HTTP 404
```

Das Formular schickt an `https://dk-dk.de/formular/send.php`. Heute
antwortet dort niemand, und nach dem Umzug liegt diese Adresse auf
GitHub Pages — dort läuft kein PHP, dort läuft überhaupt nichts.
**Ohne eine Entscheidung an dieser Stelle kommt keine Anfrage an.**

### Die Möglichkeiten

**a) Unterdomain, die bei goneo bleibt — empfohlen.**
Ein A-Record für `formular.dk-dk.de` zeigt weiter auf goneo, während
`dk-dk.de` auf GitHub Pages umgestellt wird. Das PHP-Skript liegt dort
und wird von der statischen Seite aus angesprochen.

Vorteile: Der Webspace ist bezahlt und läuft. Alles bleibt auf eigenen
Servern, keine Datenverarbeitung durch Dritte. Und — der eigentliche
Gewinn — mit einem Server sind die beiden Stufen wieder möglich, die
ohne ihn wegfallen: ein **signierter Zeitstempel** und **ALTCHA**.

Zu beachten: Der Aufruf geht dann über Domaingrenzen. Das Skript muss
auf `OPTIONS` antworten und `Access-Control-Allow-Origin:
https://dk-dk.de` setzen. Alternativ als
`application/x-www-form-urlencoded` senden, dann entfällt die
Vorabanfrage — das ist die kleinere Änderung im Formular.

**b) Serverlose Funktion.**
Cloudflare Workers oder ein vergleichbarer Dienst, kostenloses Kontingent
reicht für ein Kontaktformular um Größenordnungen. Derselbe Ablauf, nur in
JavaScript statt PHP — auch dort ist der Versand ein Aufruf der
MailerSend-API mit dem Schlüssel im Kopf. Nachteil: ein weiterer Anbieter
im Spiel und ein zweites System, das gepflegt werden will.

**c) Formulardienst.**
Ausgeschlossen — die Vorgabe im Projekt lautet ausdrücklich „kein
Formspree", und jeder solche Dienst verarbeitet die Anfragedaten als
Auftragsverarbeiter, was einen Vertrag nach Art. 28 DSGVO nötig macht.

**d) `mailto:`.**
Funktioniert ohne Server, öffnet aber das Mailprogramm des Besuchers.
Auf dem Telefon oft gar keins eingerichtet, kein Spamschutz möglich, kein
Absendebeleg. Als alleiniger Weg nicht tragfähig.

### Empfehlung

(a). Solange das nicht entschieden ist, sollte das Formular vor dem
Livegang nicht in dem Zustand bleiben, in dem es jetzt ist: Es zeigt nach
dem Absenden einen Dankeblock, obwohl die Anfrage ins Leere läuft.
