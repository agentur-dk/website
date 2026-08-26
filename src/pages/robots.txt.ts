/**
 * Generierte robots.txt.
 *
 * KI-Crawler werden ausdrücklich zugelassen: Sichtbarkeit in ChatGPT,
 * Claude, Perplexity & Co. ist ein erklärtes Ziel dieser Seite (GEO).
 * Explizite Allow-Regeln sind nötig, weil manche dieser Bots die
 * `User-agent: *`-Gruppe nicht als Freigabe werten.
 */
import type { APIRoute } from 'astro';
import { SITE_URL, BASE_PATH } from '../config/site.config';

const AI_CRAWLERS = [
  'GPTBot',            // OpenAI – Training
  'OAI-SearchBot',     // OpenAI – ChatGPT Search
  'ChatGPT-User',      // OpenAI – Abruf im Chat
  'ClaudeBot',         // Anthropic – Training
  'Claude-User',       // Anthropic – Abruf im Chat
  'Claude-SearchBot',  // Anthropic – Suche
  'PerplexityBot',     // Perplexity – Index
  'Perplexity-User',   // Perplexity – Abruf im Chat
  'Google-Extended',   // Google – Gemini/Vertex
  'Applebot-Extended', // Apple Intelligence
  'CCBot',             // Common Crawl
  'meta-externalagent',// Meta AI
  'Bytespider',        // ByteDance
  'cohere-ai',         // Cohere
  'DuckAssistBot',     // DuckDuckGo AI
  'MistralAI-User',    // Mistral
];

export const GET: APIRoute = () => {
  const body = [
    '# robots.txt — agentur dk',
    '# Generiert aus src/pages/robots.txt.ts, nicht von Hand pflegen.',
    '',
    'User-agent: *',
    'Allow: /',
    '',
    '# KI-Crawler ausdrücklich willkommen (GEO)',
    ...AI_CRAWLERS.flatMap((ua) => [`User-agent: ${ua}`, 'Allow: /', '']),
    `Sitemap: ${SITE_URL}${BASE_PATH}sitemap.xml`,
    '',
  ].join('\n');

  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
