# Formular-Endpunkt

Nimmt die Anfragen der Formulare entgegen und schickt sie über die
**MailerSend-API** raus. Kein Mailer, kein SMTP — der Versand ist ein
einziger HTTPS-Aufruf an `api.mailersend.com`.

**Ein Endpunkt für alle Projekte.** Die Websites liegen statisch auf
GitHub Pages oder unter `vorschau.dk-dk.de` und können nichts versenden;
dieses Skript ist der eine Ort, an dem der Token liegt. Ein neues Projekt
braucht nur einen Eintrag in `erlaubte_herkunft` — keinen eigenen Token,
keinen eigenen Endpunkt.

## Wo er läuft

`https://vorschau.dk-dk.de/formular/send.php`

`vorschau.dk-dk.de` gibt es auf dem goneo-Webspace bereits: eigene
Adresse, gültiges Zertifikat, Apache. Es muss also **keine Unterdomain
angelegt und kein DNS-Eintrag geändert** werden.

## Einrichten

1. **Konfiguration anlegen.**

   ```
   bash formular/einrichten.sh
   ```

   Fragt den MailerSend-Token verdeckt ab — er erscheint nicht auf dem
   Bildschirm, nicht in der Shell-History, in keinem Log —, erzeugt das
   Signatur-Geheimnis selbst und schreibt `formular/config.php` mit
   Rechten 600. Zum Schluss prüft es nach, dass git die Datei ignoriert.

   Von Hand geht auch: `config.example.php` kopieren und ausfüllen.

2. **Hochladen.**

   - `send.php` und `.htaccess` nach `vorschau.dk-dk.de/formular/`
   - `config.php` nach `vorschau.dk-dk.de/_intern/`, dort umbenannt in
     `formular-config.php`

   `_intern` ist auf dem Server gesperrt — geprüft: 403 auf alles, auch
   auf `config.php` und `.env`. Der Token liegt dort sicherer als neben
   dem Skript, weil die Sperre nicht davon abhängt, dass eine `.htaccess`
   gelesen wird. PHP kommt trotzdem heran: Die Sperre gilt für Anfragen
   über das Web, nicht für den Dateizugriff.

   Ohne `_intern` geht es auch — dann `config.php` neben `send.php`
   legen, dafür ist die `.htaccess` da.

3. **Prüfen.**

   ```
   bash formular/pruefen.sh https://vorschau.dk-dk.de/formular/send.php
   ```

   Acht Prüfungen von außen. Es wird dabei **keine Mail** ausgelöst — der
   POST läuft mit gefülltem Honigtopf und endet im gespielten Erfolg.

Fertig. `FORM_ENDPOINT` in `src/config/site.config.ts` zeigt bereits
dorthin.

## Ein neues Projekt anschließen

**Unter `vorschau.dk-dk.de`: gar nichts.** Der Browser schickt als
`Origin` nur Schema und Host, nie den Pfad — alle Projekte dort teilen
sich denselben Origin, und der eine Eintrag deckt sie alle ab. Ein neues
Projekt sendet einfach.

Nur ein Projekt auf einer anderen Domain braucht eine Zeile in
`erlaubte_herkunft`.

Wie ein Projekt anzubinden ist, steht in
[ANSCHLIESSEN.md](ANSCHLIESSEN.md). Welches Projekt gesendet hat, leitet
das Skript aus `page_url` ab und schreibt es in den Betreff:

```
Anfrage: dk-dk.de — SEO & GEO
Anfrage: vorschau.dk-dk.de/bnm-immobilien — Kontakt
Anfrage: vorschau.dk-dk.de/agora — Startseite
```

## Was geprüft wird

Der Reihe nach, siehe Kommentare in `send.php`:

1. **Herkunft** (`Origin`) — alles außerhalb der Liste bekommt 403
2. **Zwei Honigtöpfe** `hp_email` und `_gotcha` — gefüllt heißt
   gespielter Erfolg
3. **Zeit** — signierter Zeitstempel vom `?challenge=1`-Weg, mindestens
   3 Sekunden und höchstens 2 Stunden alt. Fehlen beide Zeitfelder, wird
   verworfen: Ein echter Browser setzt `form_started` beim Laden.
4. **Bedienungsnachweis** — ohne `interaktion=1` kein Versand
5. **Rate Limit** — fünf pro IP und Stunde. Gespeichert wird nur ein Hash
   der IP und nur für diese Stunde. Hochgezählt wird erst kurz vor dem
   Versand, damit ein Tippfehler in der Adresse keinen Versuch kostet.
6. **Inhalt** — Links, fremde Schriftsysteme und BBCode geben Punkte, ab
   drei wird verworfen

Verworfen wird mit `200 OK`. Wer erfährt, woran er gescheitert ist, baut
es beim nächsten Versuch nach.

## Zur MailerSend-Testdomain

`test-….mlsender.net` ist die Sendedomain des Testkontos. Dort gilt in
der Regel: Empfänger darf nur die Adresse des Kontoinhabers sein. Für
Anfragen, die ohnehin an die Agentur gehen, reicht das — vor dem Livegang
aber `dk-dk.de` in MailerSend verifizieren (SPF, DKIM), sonst landen die
Mails im Spam.

## Datenschutz

MailerSend ist Auftragsverarbeiter: AV-Vertrag, Eintrag ins
Verarbeitungsverzeichnis, eine Zeile in der Datenschutzerklärung. Keine
Cookies, keine Verhaltensanalyse, kein reCAPTCHA. Vom Rate Limit bleibt
ein Hash der IP, und der für eine Stunde.

## Die Cloudflare-Variante

In `worker/` liegt derselbe Ablauf als Cloudflare Worker — entstanden,
als noch unklar war, ob es überhaupt einen Server gibt. Sie wird nicht
gebraucht, solange `vorschau.dk-dk.de` läuft, und bleibt als Reserve
liegen: Beide Fassungen prüfen dasselbe und sprechen dieselbe
Schnittstelle, ein Wechsel wäre eine geänderte Adresse in
`site.config.ts`.
