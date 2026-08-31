# Ein neues Projekt anschließen

Für alles unter `vorschau.dk-dk.de` ist am Endpunkt **nichts** zu tun.

Der Grund: Der Browser schickt als `Origin` nur Schema, Host und Port —
niemals den Pfad. Alle Projekte dort teilen sich denselben Origin:

```
https://vorschau.dk-dk.de/agora/de/kontakt.html   →  Origin: https://vorschau.dk-dk.de
https://vorschau.dk-dk.de/bnm-immobilien/         →  Origin: https://vorschau.dk-dk.de
https://vorschau.dk-dk.de/naechstes-projekt/      →  Origin: https://vorschau.dk-dk.de
```

Der eine Eintrag in `erlaubte_herkunft` deckt sie also alle ab, heute und
in Zukunft. Ein neues Projekt braucht keinen Token, keine Konfiguration
und keinen Eintrag — es sendet einfach.

Nur ein Projekt auf einer **anderen Domain** braucht eine Zeile in
`_intern/formular-config.php`.

## Was das Projekt schicken muss

`POST` mit `Content-Type: application/json` an

```
https://vorschau.dk-dk.de/formular/send.php
```

| Feld | Pflicht | Bedeutung |
|---|---|---|
| `vorname`, `nachname` | ja | |
| `email` | ja | wird `reply_to` der Mail |
| `message` | ja | |
| `interaktion` | ja | `"1"`, sobald der Besucher das Formular angefasst hat |
| `form_started` | ja¹ | Zeitstempel in Millisekunden beim Laden |
| `ts_server`, `ts_sig` | nein¹ | signierter Zeitstempel, siehe unten |
| `hp_email`, `_gotcha` | ja | Honigtöpfe, müssen leer sein |
| `page`, `page_url` | empfohlen | landen im Betreff |
| `firma`, `website_url`, `interesse[]`, `anliegen_text` | nein | erscheinen in der Mail, wenn gefüllt |

¹ Eins von beiden muss da sein. Fehlen beide, wird verworfen.

## Der signierte Zeitstempel

Optional, aber empfohlen: Er ist die einzige Zeitangabe, die sich nicht
fälschen lässt. Einmal abholen, bevor abgesendet wird:

```js
const r = await fetch(ENDPUNKT + '?challenge=1');
const { ts, sig } = await r.json();   // → als ts_server und ts_sig mitschicken
```

Zwischen Abholen und Absenden müssen mindestens 3 Sekunden liegen,
höchstens 2 Stunden.

## Kleinstes vollständiges Beispiel

```js
const ENDPUNKT = 'https://vorschau.dk-dk.de/formular/send.php';
const gestartet = Date.now();
let bedient = false;
formular.addEventListener('input', () => { bedient = true; }, { once: true });

async function absenden(felder) {
  let zeit = {};
  try {
    const r = await fetch(ENDPUNKT + '?challenge=1');
    if (r.ok) { const d = await r.json(); zeit = { ts_server: d.ts, ts_sig: d.sig }; }
  } catch { /* ohne signierte Zeit weiter */ }

  const antwort = await fetch(ENDPUNKT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...felder,                     // vorname, nachname, email, message, …
      ...zeit,
      form_started: String(gestartet),
      interaktion: bedient ? '1' : '0',
      hp_email: '', _gotcha: '',     // die versteckten Felder aus dem Formular
      page: document.title,
      page_url: location.href,
    }),
  });
  return antwort.ok;
}
```

Fertiges, barrierefreies Formular mit allen Stufen:
`src/components/LeadForm.astro` in diesem Repository.

## Antworten

| Code | Bedeutung |
|---|---|
| `200` | angenommen — **oder** als maschinell verworfen. Der Unterschied bleibt absichtlich verborgen. |
| `403` | Origin steht nicht in der Liste |
| `422` | Pflichtfeld fehlt oder E-Mail unplausibel |
| `429` | Rate Limit erreicht (fünf pro IP und Stunde) |
| `502` | MailerSend hat abgelehnt |

## Was der Empfänger sieht

```
Betreff: Anfrage: vorschau.dk-dk.de/agora — Startseite

Name:     Maria Musterfrau
E-Mail:   maria@beispiel.de
Projekt:  vorschau.dk-dk.de/agora
Seite:    Startseite
Adresse:  https://vorschau.dk-dk.de/agora/de/

Nachricht:
…
```

Das Projekt leitet der Endpunkt selbst aus `page_url` ab — Host plus
erster Pfadabschnitt. Das Projekt muss dafür nichts tun.
