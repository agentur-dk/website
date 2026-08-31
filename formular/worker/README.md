# Formular-Endpunkt als Cloudflare Worker (Reserve)

> **Wird derzeit nicht gebraucht.** Im Einsatz ist `../send.php` auf
> `vorschau.dk-dk.de` — die Adresse gibt es auf dem goneo-Webspace
> bereits, damit entfällt der Umweg über einen weiteren Anbieter. Diese
> Fassung ist entstanden, als noch unklar war, ob es überhaupt einen
> Server gibt, und bleibt als Reserve liegen.

Nimmt die Anfragen des Formulars entgegen und schickt sie über die
**MailerSend-API** raus. Kein Mailer, kein SMTP — der Versand ist ein
`fetch` auf `api.mailersend.com`.

Warum es diesen Worker gibt: Der API-Aufruf braucht
`Authorization: Bearer <Token>`. Stünde er im JavaScript der Website,
stünde der Token im Quelltext jeder Seite und jeder könnte über diesen
Account Mails verschicken. Der Worker ist der Rechner, der den Token
hält — mehr tut er nicht.

Gewählt wurde Cloudflare, weil es die einzige Variante ist, die **keinen
DNS-Eintrag, keine Unterdomain und kein Zertifikat** verlangt: Die
Adresse `https://dk-formular.<konto>.workers.dev/` stellt Cloudflare.

---

## Einrichten — drei Befehle

```
cd formular/worker

npx wrangler login                        # öffnet den Browser
npx wrangler secret put MAILERSEND_TOKEN  # fragt den Token verdeckt ab
npx wrangler deploy                       # gibt die fertige Adresse aus
```

Das war es. `wrangler deploy` nennt am Ende die Adresse, etwa
`https://dk-formular.dein-konto.workers.dev` — die kommt in
`src/config/site.config.ts` bei `FORM_ENDPOINT`, dann Website neu bauen.

### Wo der API-Key liegt

**In keiner Datei.** `wrangler secret put` legt ihn verschlüsselt bei
Cloudflare ab: nicht in der `wrangler.toml`, nicht im Repository, nicht
in der Shell-History.

Für Läufe auf dem eigenen Rechner (`npm run dev`) gibt es `.dev.vars` —
Vorlage daneben als `.dev.vars.example`, die Datei selbst steht in der
`.gitignore`.

### Was nicht eingerichtet werden muss

- **Kein zweites Geheimnis.** Der Schlüssel für die Zeitstempel-Signatur
  wird aus dem Token abgeleitet. Beide lägen ohnehin im selben
  Secret-Speicher, also gewinnt ein eigener Wert nichts —
  außer einem Einrichtungsschritt. Wer trotzdem einen will, setzt
  `SIGNATUR_GEHEIMNIS`.
- **Keine Datenbank.** Das Rate Limit ist optional. Ohne gebundenen
  KV-Namensraum entfällt es, die übrigen fünf Stufen greifen weiter.

### Optional: Rate Limit nachrüsten

```
npx wrangler kv namespace create RATE_LIMIT
```

gibt eine id aus; die drei auskommentierten Zeilen in `wrangler.toml`
einkommentieren, id eintragen, neu deployen. Fünf Anfragen pro IP und
Stunde, gespeichert wird nur ein Hash und nur für diese Stunde.

## Prüfen

```
bash ../pruefen.sh https://dk-formular.dein-konto.workers.dev/
```

Acht Prüfungen von außen; es wird dabei **keine Mail** ausgelöst.

Die Logik selbst prüft sich ohne Cloudflare, weil der Einstieg eine
gewöhnliche `fetch`-Funktion ist und Node seit Version 18 `Request` und
`Response` mitbringt:

```
npm test
```

Vierzehn Tests: Herkunft, Vorabanfrage, Signatur, gültige Anfrage, jede
einzelne Abwehrstufe, das Rate Limit — und die beiden Fälle ohne
eigenes Geheimnis und ohne gebundenen Zähler.

## Was geprüft wird

Der Reihe nach:

1. **Herkunft** — alles außerhalb von `ERLAUBTE_HERKUNFT` bekommt 403
2. **Zwei Honigtöpfe** (`hp_email`, `_gotcha`) — gefüllt heißt gespielter Erfolg
3. **Zeit** — signierter Zeitstempel vom `?challenge=1`-Weg, mindestens
   3 Sekunden und höchstens 2 Stunden alt. Fehlen beide Zeitfelder, wird
   verworfen: Ein echter Browser setzt `form_started` beim Laden.
4. **Bedienungsnachweis** — ohne `interaktion=1` kein Versand
5. **Rate Limit** *(optional)* — fünf pro IP und Stunde, sofern ein
   KV-Namensraum gebunden ist. Gespeichert wird nur ein Hash der IP, und
   KV räumt ihn nach einer Stunde selbst weg. Hochgezählt wird erst kurz
   vor dem Versand, damit ein Tippfehler in der Adresse keinen Versuch
   kostet.
6. **Inhalt** — Links, fremde Schriftsysteme und BBCode geben Punkte, ab
   drei wird verworfen

Verworfen wird mit `200 OK`. Wer erfährt, woran er gescheitert ist, baut
es beim nächsten Versuch nach.

## Datenschutz

Name, E-Mail und Nachricht laufen durch Cloudflare und MailerSend. Beide
sind damit Auftragsverarbeiter:

- **AV-Vertrag** mit beiden abschließen (Cloudflare und MailerSend bieten
  einen an)
- Beide ins **Verarbeitungsverzeichnis** eintragen
- Je eine Zeile in die **Datenschutzerklärung**

Keine Tracking-Cookies, keine Verhaltensanalyse, kein reCAPTCHA. Vom
Rate Limit bleibt nur ein Hash, und der nur für eine Stunde.

## Falls doch einmal PHP

Im Ordner darüber liegt derselbe Ablauf als `send.php` für einen
klassischen Webspace. Beide Fassungen prüfen dasselbe und sprechen
dieselbe Schnittstelle; das Formular merkt keinen Unterschied.
