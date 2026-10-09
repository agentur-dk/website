/**
 * Erzeugt statt in public/, weil `start_url` und `scope` den Basispfad
 * brauchen — eine feste Datei zeigte in einer Vorschau im Unterverzeichnis
 * an der eigenen Seite vorbei. Das Manifest liefert Name und Farbe fürs
 * Anheften und Teilen; eine PWA wird daraus absichtlich nicht.
 */
import type { APIRoute } from 'astro';
import { siteConfig, BASE_PATH } from '../config/site.config';

export const GET: APIRoute = () =>
  new Response(
    JSON.stringify(
      {
        name: siteConfig.name,
        short_name: 'agentur dk',
        description: siteConfig.description,
        lang: 'de',
        dir: 'ltr',
        /* `BASE_PATH` endet bereits auf einem Schrägstrich (`/` an der
           Wurzel, `/unterordner/` sonst) — anhängen würde ihn verdoppeln. */
        start_url: BASE_PATH,
        scope: BASE_PATH,
        /* Kein `standalone`: Die Seite ist eine Website, keine App-Attrappe.
           Wer sie anheftet, soll sie im Browser bekommen, mit Adresszeile. */
        display: 'browser',
        background_color: '#121212',
        /* Muss mit `theme-color` im BaseLayout übereinstimmen. */
        theme_color: '#121212',
        icons: [
          {
            src: `${BASE_PATH}favicon.svg`,
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any',
          },
        ],
      },
      null,
      2,
    ),
    { headers: { 'Content-Type': 'application/manifest+json; charset=utf-8' } },
  );
