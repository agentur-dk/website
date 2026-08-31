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

## Der empfohlene Weg: ein `action`, kein JavaScript

Das Formular sendet klassisch. Es funktioniert damit auch, wenn kein
Skript läuft — und das ist keine Kleinigkeit: Ein Formular, das ohne
JavaScript nicht absendet, ist für einen Teil der Besucher schlicht
kaputt, und man merkt es nie, weil sich niemand beschwert, der gar
nicht senden konnte.

```html
<form method="post" action="https://vorschau.dk-dk.de/formular/send.php"
      enctype="multipart/form-data">
  <input type="hidden" name="weiter"        value="/mein-projekt/danke/">
  <input type="hidden" name="weiter_fehler" value="/mein-projekt/kontakt/">

  <!-- Honigtopf: für Menschen unsichtbar, für Skripte verlockend -->
  <input type="text" name="hp_email" tabindex="-1" autocomplete="off"
         aria-hidden="true" style="display:none">

  <input name="vorname"  required>
  <input name="nachname" required>
  <input name="email" type="email" required>
  <textarea name="message" required></textarea>

  <!-- Beliebige weitere Felder: sie landen von selbst in der Mail -->
  <input name="immobilientyp">
  <input type="file" name="unterlagen">

  <button>Absenden</button>
</form>
```

Was dabei von selbst passiert:

- **Beliebige Feldnamen.** Alles, was nicht zur Technik gehört, wird als
  eigene Zeile in die Mail übernommen — `immobilientyp` wird zu
  „Immobilientyp". Am Endpunkt ist dafür nichts einzutragen.
- **Dateianhänge.** Bis zu fünf Dateien, zusammen 8 MB, als PDF, JPEG,
  PNG, WebP oder Text. Der Typ wird am Inhalt geprüft, nicht an dem, was
  der Absender behauptet. Ein abgelehnter Anhang verwirft nicht die
  Anfrage — sie kommt an, mit einem Hinweis.
- **Weiterleitung mit 303** auf `weiter`. Nur seiteneigene Pfade werden
  angenommen; ein fremdes Ziel fällt auf die Vorgabe zurück, sonst wäre
  das Formular eine offene Weiterleitung.
- **Herkunft** wird über `Origin` geprüft, ersatzweise über den
  `Referer` — den `Origin` schickt ein klassisches Formular nicht in
  jedem Browser mit.

Eine Einschränkung, die dazugehört: Ohne Skript gibt es weder einen
signierten Zeitstempel noch `form_started`, die Zeitschranke entfällt
also. Es tragen dann die beiden Honigtöpfe, die Inhaltsheuristik und die
Sperre pro Stunde. Wer `client.js` einbindet, bekommt die Zeitprüfung
zusätzlich — und das Absenden ohne Seitenwechsel.

## Der JSON-Weg (client.js)

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

## Der kürzeste Weg: ein Script-Tag

Auf dem Server liegt `client.js` neben `send.php`. Ein Projekt bindet es
ein und markiert sein Formular — mehr nicht:

```html
<script src="/formular/client.js" defer></script>

<form data-dk-formular data-dk-danke="/danke/">
  <input name="vorname"  required>
  <input name="nachname" required>
  <input name="email" type="email" required>
  <textarea name="message" required></textarea>
  <button type="submit">Anfrage senden</button>
</form>
```

Das Skript legt den Honigtopf an, holt den signierten Zeitstempel beim
ersten Anfassen, schreibt mit, ob das Formular bedient wurde, fasst
Mehrfachauswahlen zusammen und sendet. `data-dk-danke` leitet nach
Erfolg weiter; wer die Rückmeldung selbst gestalten will, hört auf das
Ereignis:

```js
formular.addEventListener('dk:gesendet', (e) => {
  e.detail.ok ? zeigeDanke() : zeigeFehler();
});
```

Heißen die Felder im Projekt anders, hilft ein Attribut:
`<input name="mail" data-dk-feld="email">`.

## Kleinstes vollständiges Beispiel (ohne client.js)

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
