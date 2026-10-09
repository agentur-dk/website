/**
 * Prüft, ob unter der Test-URL wirklich dieses Projekt läuft. Belegt ein
 * fremdes Projekt den Port, sehen dessen Befunde aus wie eigene, und man
 * repariert an der falschen Stelle. Kostet einen Seitenaufruf.
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
