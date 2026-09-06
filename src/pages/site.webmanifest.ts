/**
 * Erzeugtes site.webmanifest.
 *
 * ── Warum erzeugt und nicht als Datei in public/ ─────────────────────
 * Weil `start_url` und `scope` den Basispfad brauchen. Eine feste Datei
 * zeigte mit `/` auf die Wurzel der Domain — bei einer Installation in einem
 * Unterverzeichnis (Vorschau!) also am eigenen Auftritt vorbei. Genau dieser
 * Fehler ist in AGORA aufgetreten und dort dokumentiert.
 *
 * ── Warum überhaupt ──────────────────────────────────────────────────
 * Niemand legt eine Agenturseite auf den Startbildschirm. Das Manifest steht
 * trotzdem im Kanon des Blueprints, und zwar für den unspektakulären Teil:
 * Name und Farbe, wenn ein Browser die Seite anheftet, teilt oder in einer
 * Leseansicht zeigt. Eine PWA wird daraus nicht — es gibt keinen Service
 * Worker, und das ist Absicht.
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
        /* Derselbe Wert wie das `theme-color` im BaseLayout. Zwei Stellen
           mit einer Farbe laufen auseinander — deshalb steht sie hier neben
           dem Kommentar, der darauf zeigt. */
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
