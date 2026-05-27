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
    if (!parsed.hostname.endsWith("abuiyaad.com")) return false
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
  try {
    const queue = [SOURCE]
    const seenPages = new Set()
    const articles = new Map()
    const maxPages = Number(req.query.maxPages || 300)

    while (queue.length && seenPages.size < maxPages) {
      const url = queue.shift()
      if (seenPages.has(url)) continue
      seenPages.add(url)

      const response = await fetch(url, {
        headers: { "user-agent": "TalibClubTranslationTracker/1.0" }
      })
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

        const isAbuiyaad = parsed.hostname.endsWith("abuiyaad.com")
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