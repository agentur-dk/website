/**
 * dk-formular — Anbindung an den gemeinsamen Endpunkt.
 *
 * Für jedes Projekt unter vorschau.dk-dk.de. Einbinden mit
 *
 *   <script src="/formular/client.js" defer></script>
 *
 * und dem Formular ein `data-dk-formular` geben. Alles Weitere macht
 * dieses Skript: versteckte Felder anlegen, den signierten Zeitstempel
 * holen, Bedienung mitschreiben, absenden.
 *
 * Kein Token im Browser — der liegt auf dem Server. Keine Abhängigkeit,
 * kein Bauwerkzeug, keine Konfiguration.
 *
 * Erwartete Feldnamen im Formular: vorname, nachname, email, message;
 * freiwillig firma, website_url. Wer andere Namen benutzt, setzt
 * `data-dk-feld="vorname"` an das jeweilige Eingabefeld.
 */
(() => {
  'use strict';

  const ENDPUNKT = document.currentScript?.dataset.endpunkt
    || 'https://vorschau.dk-dk.de/formular/send.php';

  for (const formular of document.querySelectorAll('form[data-dk-formular]')) {
    anbinden(formular);
  }

  function anbinden(formular) {
    const gestartet = Date.now();
    let bedient = false;
    for (const art of ['pointerdown', 'keydown', 'input']) {
      formular.addEventListener(art, () => { bedient = true; }, { once: true, passive: true });
    }

    // Honigtopf. Zwei Verstecke, weil manche Bots `display: none`
    // erkennen und solche Felder auslassen, andere stur alles füllen.
    const topf = document.createElement('input');
    topf.type = 'email';
    topf.name = 'hp_email';
    topf.tabIndex = -1;
    topf.autocomplete = 'off';
    topf.setAttribute('aria-hidden', 'true');
    topf.style.cssText = 'position:absolute;left:-9999px;width:1px;height:1px;opacity:0';
    formular.append(topf);

    /** Signierter Zeitstempel. Ohne ihn geht es auch, nur schwächer. */
    let zeit = {};
    let geholt = false;
    const holen = async () => {
      if (geholt) return;
      geholt = true;
      try {
        const r = await fetch(`${ENDPUNKT}?challenge=1`);
        if (!r.ok) return;
        const d = await r.json();
        if (d.ts && d.sig) zeit = { ts_server: String(d.ts), ts_sig: d.sig };
      } catch { /* ohne Signatur weiter */ }
    };
    // Beim ersten Anfassen holen: ein Aufruf je Anfrage, keiner je Aufruf.
    formular.addEventListener('pointerdown', holen, { once: true, passive: true });
    formular.addEventListener('keydown', holen, { once: true, passive: true });

    formular.addEventListener('submit', async (e) => {
      e.preventDefault();
      await holen;

      const daten = {};
      for (const [name, wert] of new FormData(formular)) {
        // Mehrfach vorkommende Namen (Checkbox-Gruppen) zusammenfassen
        // statt überschreiben — sonst kommt nur der letzte Wert an.
        daten[name] = daten[name] === undefined || daten[name] === ''
          ? wert
          : `${daten[name]}, ${wert}`;
      }
      for (const el of formular.querySelectorAll('[data-dk-feld]')) {
        daten[el.dataset.dkFeld] = el.value;
      }

      Object.assign(daten, zeit, {
        form_started: String(gestartet),
        interaktion: bedient ? '1' : '0',
        page: document.title,
        page_url: location.href,
      });

      const knopf = formular.querySelector('[type="submit"]');
      const beschriftung = knopf?.textContent;
      if (knopf) { knopf.disabled = true; knopf.textContent = 'Wird gesendet…'; }

      let ok = false;
      try {
        const antwort = await fetch(ENDPUNKT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(daten),
        });
        ok = antwort.ok;
      } catch { /* Netz weg */ }

      if (knopf) { knopf.disabled = false; if (beschriftung) knopf.textContent = beschriftung; }

      // Das Projekt entscheidet, wie es die Rückmeldung zeigt.
      formular.dispatchEvent(new CustomEvent('dk:gesendet', {
        bubbles: true,
        detail: { ok },
      }));

      const ziel = formular.dataset.dkDanke;
      if (ok && ziel) location.assign(ziel);
    });
  }
})();
