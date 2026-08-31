# Formular-Endpunkt

Nimmt die Anfragen des Formulars von dk-dk.de entgegen und schickt sie
über die **MailerSend-API** raus. Kein eigener Mailer, kein PHPMailer,
kein SMTP — der Versand ist ein einziger HTTPS-Aufruf an
`api.mailersend.com`.

Diese Datei existiert aus genau einem Grund: Der API-Aufruf braucht
`Authorization: Bearer <Token>`. Stünde er im JavaScript der Website,
stünde der Token im Quelltext jeder Seite.

Die Website selbst liegt auf GitHub Pages und liefert nur Dateien aus.
Dieses Skript läuft deshalb getrennt davon auf dem goneo-Webspace.

## Einrichten

1. **Unterdomain anlegen.** Im goneo-Kundenbereich `formular.dk-dk.de`
   auf ein Verzeichnis zeigen lassen, das auf diesem Webspace liegt.
   Wichtig: Der A-Record dieser Unterdomain bleibt bei goneo, während
   `dk-dk.de` selbst auf GitHub Pages umgestellt wird.

2. **Dateien hochladen.** `send.php` und `.htaccess` in das Verzeichnis
   der Unterdomain.

3. **Konfiguration anlegen.** Am einfachsten mit dem Skript:

   ```
   bash formular/einrichten.sh
   ```

   Es fragt den Token verdeckt ab — er erscheint nicht auf dem
   Bildschirm, nicht in der Shell-History und in keinem Log —, erzeugt
   das Signatur-Geheimnis selbst und schreibt `formular/config.php` mit
   Rechten 600. Am Ende prüft es nach, dass git die Datei ignoriert.
   Danach die Datei mit auf den Webspace laden.

   Wer es von Hand machen will: `config.example.php` als `config.php`
   danebenlegen und ausfüllen:

   - `mailersend_token` — MailerSend → Integrations → API tokens.
     Das Recht „Email send" genügt.
   - `signatur_geheimnis` — einmal erzeugen mit
     `php -r "echo bin2hex(random_bytes(32));"`
   - `von_adresse` — muss zur verifizierten Sendedomain gehören.

   `config.php` steht in der `.gitignore` und darf dort auch bleiben.
   Der Schlüssel gehört auf den Server, nicht ins Repository und schon
   gar nicht ins JavaScript der Website.

4. **Prüfen.**

   ```
   bash formular/pruefen.sh https://formular.dk-dk.de/send.php
   ```

   Acht Prüfungen von außen: Herkunft, Vorabanfrage, Zeitstempel,
   POST-Weg und ob `config.php` gesperrt ist. Es wird **keine Mail**
   ausgelöst — der POST läuft mit gefülltem Honigtopf und endet im
   gespielten Erfolg, bevor irgendetwas versendet wird.

5. **Adresse im Formular eintragen.** In `src/config/site.config.ts`
   steht `FORM_ENDPOINT`.

## Zur Testdomain

`test-…​.mlsender.net` ist die Sendedomain aus dem MailerSend-Testkonto.
Dort gilt in der Regel: Empfänger darf nur die Adresse des Kontoinhabers
sein. Für ein Kontaktformular, dessen Anfragen ohnehin an die Agentur
gehen, reicht das zum Testen — vor dem Livegang aber die eigene Domain in
MailerSend verifizieren (SPF, DKIM), sonst landen die Mails im Spam und
die Empfängerbeschränkung bleibt bestehen.

## Was geprüft wird

Der Reihe nach, siehe Kommentare in `send.php`:

1. Herkunft (`Origin`) — alles außerhalb der Liste bekommt 403
2. Honigtöpfe `hp_email` und `_gotcha` — gefüllt heißt gespielter Erfolg
3. Zeit — signierter Zeitstempel vom `?challenge=1`-Weg, mindestens
   3 Sekunden, höchstens 2 Stunden alt
4. Bedienungsnachweis — ohne `interaktion=1` kein Versand
5. Rate Limit — fünf Anfragen pro IP und Stunde, gespeichert wird nur
   ein Hash und nur für die Dauer des Fensters
6. Inhalt — Links, fremde Schriftsysteme und BBCode geben Punkte, ab
   drei wird verworfen

Verworfen wird mit `200 OK`. Wer erfährt, woran er gescheitert ist, baut
es beim nächsten Versuch nach.

## Was noch fehlt

ALTCHA. Der Rechenaufgaben-Beweis braucht zusätzlich einen Weg, der
Aufgaben ausgibt und Lösungen prüft — beides ließe sich hier ergänzen,
sobald der Grundweg steht. Solange läuft im Browser die einfache
Rechenaufgabe.
