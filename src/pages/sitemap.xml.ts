/**
 * Generierte sitemap.xml — Quelle ist das Seitenregister in site.config.ts.
 * Ersetzt die frühere handgepflegte Datei, die mit den echten URLs
 * auseinandergelaufen war.
 */
import type { APIRoute } from 'astro';
import { indexablePages, absolute, NOINDEX_ALL } from '../config/site.config';
import { pageLastModified } from '../lib/lastmod';

export const GET: APIRoute = () => {
  // Eine Sitemap lädt Suchmaschinen ausdrücklich zum Indexieren ein — das
  // widerspricht der Sperre. Solange sie steht, bleibt die Datei leer,
  // statt sie zu entfernen: so bleibt eine bereits eingereichte Sitemap
  // gültig abrufbar, meldet aber keine URLs mehr.
  if (NOINDEX_ALL) {
    return new Response(
      '<?xml version="1.0" encoding="UTF-8"?>\n' +
      '<!-- Die Seite ist noch nicht veröffentlicht; bewusst keine URLs. -->\n' +
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n</urlset>\n',
      { headers: { 'Content-Type': 'application/xml; charset=utf-8' } },
    );
  }

  const urls = indexablePages
    .map((p) => [
      '  <url>',
      `    <loc>${absolute(p.slug)}</loc>`,
      `    <lastmod>${pageLastModified(p.slug)}</lastmod>`,
      `    <changefreq>${p.changefreq}</changefreq>`,
      `    <priority>${p.priority.toFixed(1)}</priority>`,
      '  </url>',
    ].join('\n'))
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
