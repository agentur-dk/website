/**
 * Die Kennzeichnung KI-erzeugter Bilder.
 *
 * Agenturweite Konvention, dieselbe wie in den WordPress-Projekten und in
 * AGORA, BNM und yupik: `[KI]` an beliebiger Stelle im Alternativtext
 * markiert ein erzeugtes Bild.
 *
 *   alt: '[KI] Blick in ein Büro'   beschriebenes Motiv
 *   alt: '[KI]'                     dekoratives Bild ohne Alt-Text
 *
 * Der Marker landet **nie** im ausgelieferten HTML — `tools/check-seo.mjs`
 * prüft das am fertigen `dist/`. Stattdessen entsteht eine sichtbare
 * Bildunterschrift, weil die Kennzeichnung eine Aussage **über** das Bild ist
 * und nicht sein Inhalt: In ein `aria-label` gepackt überschriebe sie den
 * Alternativtext, im Alternativtext stünde sie da, wo das Motiv gehört.
 *
 * ── Warum das hier steht, obwohl es (noch) kein erzeugtes Bild gibt ──
 * Die Seite trägt heute zwölf Bilder, keines davon erzeugt. Der Mechanismus
 * muss trotzdem **vorher** da sein: Art. 50 der KI-Verordnung verlangt die
 * Kennzeichnung ab dem ersten Bild, nicht ab dem zweiten. Und eine Agentur,
 * die mit KI wirbt, wird das erste nicht lange vor sich herschieben.
 */
export const KI_MARKER = '[KI]';

/** Ob dieser Alternativtext ein KI-erzeugtes Bild markiert. */
export function istKiBild(alt: string | undefined): boolean {
  return alt !== undefined && alt.includes(KI_MARKER);
}

/**
 * Der Alternativtext ohne Marker — das, was ins `alt` gehört.
 *
 * Bleibt nichts übrig, ist das Bild dekorativ und bekommt einen leeren
 * Alternativtext. `alt="KI-generiert"` wäre schlechter als keiner: Es sagt
 * über das Motiv nichts und wiederholt nur die Unterschrift daneben.
 */
export function ohneKiMarker(alt: string | undefined): string {
  if (alt === undefined) return '';
  return alt.split(KI_MARKER).join('').replace(/\s+/g, ' ').trim();
}
