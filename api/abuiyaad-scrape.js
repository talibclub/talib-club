import { verifyIdToken } from './_firebase-admin.js';

const SOURCE = "https://abuiyaad.com/"

function decodeEntities(value = "") {
  return value
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&rsquo;/g, "'")
    .replace(/&lsquo;/g, "'")
    .replace(/&ldquo;/g, "\u201c")
    .replace(/&rdquo;/g, "\u201d")
    .replace(/&nbsp;/g, " ")
}

function textOnly(value = "") {
  return decodeEntities(value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim())
}

function isArticleUrl(url) {
  try {
    const parsed = new URL(url)
    const isAbuiyaad = parsed.hostname === "abuiyaad.com" || parsed.hostname.endsWith(".abuiyaad.com")
    if (!isAbuiyaad) return false
    return /^\/[a-z]\//.test(parsed.pathname)
  } catch {
    return false
  }
}

function canonicalUrl(url) {
  const parsed = new URL(url)
  parsed.hostname = "abuiyaad.com"
  parsed.hash = ""
  parsed.search = ""
  return parsed.href
}

function extractLinks(html, baseUrl) {
  const links = []
  const regex = /<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi
  let match
  while ((match = regex.exec(html))) {
    const title = textOnly(match[2])
    if (!title || title.length < 8) continue
    try {
      const url = new URL(decodeEntities(match[1]), baseUrl).href.split("#")[0]
      links.push({ title, url })
    } catch {}
  }
  return links
}

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", process.env.ALLOWED_ORIGIN || "https://talib.club");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Authentication
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized: Missing token" });
  }

  try {
    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await verifyIdToken(token);
    if (decodedToken.role !== 'staff' && decodedToken.role !== 'admin' && decodedToken.role !== 'owner') {
      return res.status(403).json({ error: "Forbidden: Staff access required" });
    }
  } catch (error) {
    return res.status(401).json({ error: "Unauthorized: Invalid token" });
  }

  try {
    const queue = [SOURCE]
    const seenPages = new Set()
    const articles = new Map()
    // Cap maxPages to prevent abuse (e.g. 100 max)
    const maxPages = Math.min(Number(req.query.maxPages || 100), 200)

    while (queue.length && seenPages.size < maxPages) {
      const url = queue.shift()
      if (seenPages.has(url)) continue
      seenPages.add(url)

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000); // 8s timeout per request
      
      let response;
      try {
        response = await fetch(url, {
          headers: { "user-agent": "TalibClubTranslationTracker/1.0" },
          signal: controller.signal
        });
      } catch (err) {
        clearTimeout(timeout);
        continue; // skip on timeout or network error
      }
      clearTimeout(timeout);
      
      if (!response.ok) continue

      const html = await response.text()

      for (const link of extractLinks(html, url)) {
        const parsed = new URL(link.url)

        if (isArticleUrl(link.url)) {
          const cleanUrl = canonicalUrl(link.url)
          articles.set(cleanUrl, {
            title: link.title,
            url: cleanUrl,
            source: "abuiyaad.com",
          })
        }

        const isAbuiyaad = parsed.hostname === "abuiyaad.com" || parsed.hostname.endsWith(".abuiyaad.com")
        const isNavigable = parsed.pathname === "/" ||
          /\/(archive|archives|articles|news|reports|categories|tags|category|page|[a-z])\//.test(parsed.pathname)

        if (isAbuiyaad && isNavigable && !seenPages.has(link.url) && !queue.includes(link.url)) {
          queue.push(link.url)
        }
      }
    }

    res.setHeader("Cache-Control", "no-store")
    res.status(200).json({
      source: SOURCE,
      scannedPages: seenPages.size,
      count: articles.size,
      articles: [...articles.values()].sort((a, b) => a.title.localeCompare(b.title)),
    })
  } catch (error) {
    res.status(500).json({ error: error.message || "Cannot scrape abuiyaad.com" })
  }
}