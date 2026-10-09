/**
 * Die Kennzeichnung KI-erzeugter Bilder, agenturweit gleich: `[KI]` irgendwo
 * im Alternativtext markiert ein erzeugtes Bild (`'[KI]'` allein: dekorativ).
 *
 * Der Marker wird nie ausgeliefert (`tools/check-seo.mjs` prüft `dist/`),
 * sondern zur sichtbaren Bildunterschrift. Die Kennzeichnung ist eine Aussage
 * über das Bild, nicht sein Inhalt: In `aria-label` überschriebe sie den
 * Alternativtext, im Alternativtext stünde sie da, wo das Motiv hingehört.
 *
 * Der Mechanismus steht vor dem ersten erzeugten Bild, weil Art. 50 der
 * KI-Verordnung die Kennzeichnung ab diesem verlangt.
 */
export const KI_MARKER = '[KI]';

export function istKiBild(alt: string | undefined): boolean {
  return alt !== undefined && alt.includes(KI_MARKER);
}

/**
 * Bleibt ohne Marker nichts übrig, ist das Bild dekorativ und bekommt
 * `alt=""`. `alt="KI-generiert"` sagte über das Motiv nichts und wiederholte
 * nur die Unterschrift daneben.
 */
export function ohneKiMarker(alt: string | undefined): string {
  if (alt === undefined) return '';
  return alt.split(KI_MARKER).join('').replace(/\s+/g, ' ').trim();
}
