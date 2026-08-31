# Formular-Endpunkt als Cloudflare Worker

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

## Wo der API-Key hingehört

**In keine Datei.** Er wird als Secret gesetzt und liegt verschlüsselt
bei Cloudflare:

```
cd formular/worker
npx wrangler secret put MAILERSEND_TOKEN
```

Der Befehl fragt den Wert danach verdeckt ab. Er landet nicht in der
`wrangler.toml`, nicht im Repository und nicht in der Shell-History.

Dasselbe für das Geheimnis, mit dem die Zeitstempel signiert werden:

```
npx wrangler secret put SIGNATUR_GEHEIMNIS
```

Als Wert irgendetwas Langes und Zufälliges, etwa aus
`openssl rand -hex 32`. Kennen muss diesen Wert niemand.

Für Läufe auf dem eigenen Rechner (`npm run dev`) gibt es stattdessen
`.dev.vars` — Vorlage liegt als `.dev.vars.example` daneben, die Datei
selbst steht in der `.gitignore`.

---

## Einrichten, der Reihe nach

```
cd formular/worker

# 1. Anmelden (öffnet den Browser)
npx wrangler login

# 2. Zähler für das Rate Limit anlegen
npx wrangler kv namespace create RATE_LIMIT
#    → gibt eine id aus. Diese id in wrangler.toml eintragen,
#      dort wo HIER_DIE_ID_AUS_WRANGLER_EINTRAGEN steht.

# 3. Die beiden Secrets setzen (siehe oben)
npx wrangler secret put MAILERSEND_TOKEN
npx wrangler secret put SIGNATUR_GEHEIMNIS

# 4. Veröffentlichen
npx wrangler deploy
#    → gibt die Adresse aus, etwa
#      https://dk-formular.dein-konto.workers.dev
```

**Danach**: Diese Adresse in `src/config/site.config.ts` bei
`FORM_ENDPOINT` eintragen, Website neu bauen, fertig.

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

Zwölf Tests: Herkunft, Vorabanfrage, Signatur, gültige Anfrage, jede
einzelne Abwehrstufe und das Rate Limit.

## Was geprüft wird

Der Reihe nach:

1. **Herkunft** — alles außerhalb von `ERLAUBTE_HERKUNFT` bekommt 403
2. **Zwei Honigtöpfe** (`hp_email`, `_gotcha`) — gefüllt heißt gespielter Erfolg
3. **Zeit** — signierter Zeitstempel vom `?challenge=1`-Weg, mindestens
   3 Sekunden und höchstens 2 Stunden alt. Fehlen beide Zeitfelder, wird
   verworfen: Ein echter Browser setzt `form_started` beim Laden.
4. **Bedienungsnachweis** — ohne `interaktion=1` kein Versand
5. **Rate Limit** — fünf pro IP und Stunde. Gespeichert wird nur ein Hash
   der IP, und KV räumt ihn nach einer Stunde selbst weg. Hochgezählt
   wird erst kurz vor dem Versand, damit ein Tippfehler in der Adresse
   keinen Versuch kostet.
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
