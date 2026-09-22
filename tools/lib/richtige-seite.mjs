/**
 * Prüft, ob unter der Test-URL wirklich DIESES Projekt läuft.
 *
 * ── Warum es das gibt ─────────────────────────────────────────────────
 * Am 22.09.2026 meldete `wcag-manual.mjs` sechs Befunde auf „index",
 * darunter Elemente mit Klassen, die es in diesem Projekt gar nicht
 * gibt (`p.slug`). Die Suche danach kostete zwei Runden — bis sich
 * herausstellte, dass auf Port 4321 ein ganz anderes Projekt lief.
 * Das Werkzeug hatte eine fremde Website gemessen und die Ergebnisse
 * ohne jeden Zweifel als eigene ausgegeben.
 *
 * Das ist die gefährlichste Sorte Messfehler: Die Zahlen sehen echt
 * aus, sie sind nur von etwas anderem. Man repariert dann an der
 * falschen Stelle — oder hält für Bestand, was in Wahrheit gar nicht
 * existiert.
 *
 * Die Prüfung kostet einen Seitenaufruf und schließt das aus.
 */

/**
 * @param {import('playwright').Page} page  bereits geladene Seite
 * @param {string} url                      zur Fehlermeldung
 * @param {string} erwartet                 Text, der im publisher stehen muss
 */
export async function pruefeProjekt(page, url, erwartet = 'agentur dk') {
  const publisher = await page
    .locator('meta[name="publisher"]')
    .getAttribute('content')
    .catch(() => null);

  if (publisher && publisher.includes(erwartet)) return;

  const titel = await page.title().catch(() => '(kein Titel)');
  throw new Error(
    `\nFALSCHE SEITE unter ${url}\n\n` +
    `  erwartet   meta[name="publisher"] enthält „${erwartet}"\n` +
    `  gefunden   ${publisher ? `„${publisher}"` : '(kein publisher-Tag)'}\n` +
    `  Titel      ${titel}\n\n` +
    `Dort läuft ein anderes Projekt. Entweder den fremden Server\n` +
    `beenden oder die eigene Adresse angeben:\n\n` +
    `  LH_ORIGIN=http://localhost:4323 npm run check:wcag\n`,
  );
}
