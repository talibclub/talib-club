import { next, rewrite } from '@vercel/functions'

// Why the homepage needs its own mechanism when every other route is handled by
// a rewrite in vercel.json:
//
// Vercel applies `rewrites` only *after* the filesystem check, and the Vite
// build puts index.html at the site root. So `/` always matched a real file and
// the bot rewrite could never fire for it — Googlebot asking for the site root
// got the empty SPA shell, no canonical and no links, on the one page every
// crawl of this site starts from. Vercel's own guidance is that a rewrite
// `source` must not be a path that exists as a file.
//
// Routing Middleware runs before the request is processed at all, which makes
// it the only place `/` can be handed to the prerenderer without renaming the
// SPA entry file out from under the service worker.
export const config = { matcher: '/' }

// Same list as the two user-agent conditions in vercel.json and the redirect
// script in api/seo-prerender.js. All three have to agree.
const CRAWLERS = /Googlebot|Google-InspectionTool|GoogleOther|AdsBot-Google|Storebot-Google|bingbot|Baiduspider|YandexBot|Applebot|DuckDuckBot|PetalBot|facebookexternalhit|Twitterbot|LinkedInBot|Slackbot|WhatsApp|LINE|Discordbot|TelegramBot/i

export default function middleware(request) {
  try {
    if (!CRAWLERS.test(request.headers.get('user-agent') || '')) return next()
    return rewrite(new URL('/api/seo-prerender', request.url))
  } catch {
    // This runs in front of the homepage for every visitor. Whatever goes
    // wrong here, serving the normal app is the right answer — a broken
    // middleware must not be able to take the front page down.
    return next()
  }
}
