# prebas: Zustellung über die MailerSend-API

Am 01.09.2026 auf dem Server unter `vorschau.dk-dk.de` umgesetzt. Diese
Notiz gehört zu einem **fremden Projekt** — sie steht hier, damit die
Änderung nachvollziehbar bleibt und in dessen Quellcode nachgezogen
werden kann.

> **Wichtig:** Geändert wurden die ausgelieferten Dateien auf dem Server.
> Beim nächsten Deploy von prebas sind sie überschrieben. Dauerhaft
> gehört beides in das prebas-Repository.

## Warum

`prebas/api/service.php` baute die Nachricht als MIME-Mehrteiler selbst
zusammen und übergab sie an PHPs `mail()`. Das geht an den lokalen MTA,
ohne SPF- und DKIM-Bindung an die Absenderdomain; GMX, Web.de und Gmail
sortieren so etwas regelmäßig in den Spam oder verwerfen es
stillschweigend. Eine Störungsmeldung, die nie ankommt, ist schlimmer
als eine, die sichtbar scheitert.

agora und bnm-immobilien senden auf demselben Webspace längst über die
API und beziehen Token und Absender aus `_intern/`.

## Was geändert wurde

**1. `prebas/.htaccess`** — zwei Zeilen im vorhandenen
`<IfModule mod_env.c>`-Block, auf dieselbe Ablage wie bei den anderen
Projekten:

```apache
SetEnv PREBAS_MAIL_KEYFILE  ".../vorschau.dk-dk.de/_intern/mailersend.key"
SetEnv PREBAS_MAIL_FROMFILE ".../vorschau.dk-dk.de/_intern/mailersend.from"
```

**2. `prebas/api/service.php`** — vor dem bestehenden Versandblock ein
Aufruf der MailerSend-API. Token und Absender kommen über die beiden
Variablen oben, wahlweise direkt aus `PREBAS_MAIL_TOKEN` /
`PREBAS_MAIL_FROM`. Anhänge werden aus dem vorhandenen `$attachments`
übernommen und base64-kodiert mitgeschickt. Bei einem 429 wird nach zwei
Sekunden einmal nachgefasst — nur dort, denn ein 429 heißt eindeutig
»nicht angenommen«, während ein Serverfehler die Mail schon ausgelöst
haben kann.

**Der bisherige Weg bleibt.** Fehlt der Token oder lehnt die API ab,
läuft der unveränderte `mail()`-Block wie zuvor. Eine Störungsmeldung
darf nicht daran scheitern, dass ein Dienst gerade nicht antwortet.
Der Grund steht dann im Server-Fehlerprotokoll.

Weder Formulare noch Feldschema noch das Empfänger-Routing
(`PREBAS_MAIL_SERVICE` / `_RETURNS` / `_CONTACT`) wurden angefasst.

## Gegenprobe am laufenden System

```
/prebas/, /kontakt/, /en/contact/, /services/stoerung-melden/   200
Kontaktformular                        303 → /prebas/danke/
Störungsmeldung mit PDF-Anhang         303 → /prebas/danke/
Umgebung: KEYFILE und FROMFILE gesetzt, beide Dateien lesbar, curl vorhanden
```

Laufzeit als Beleg, dass die API wirklich gerufen wird — `mail()` ist
nach wenigen Millisekunden zurück, ein API-Aufruf braucht die Runde zum
Dienst:

```
statische Seite            0,134 s
bnm-immobilien (API)       0,254 s
prebas (nach Umstellung)   0,273 s
```
