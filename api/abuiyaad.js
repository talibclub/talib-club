import admin, { verifyIdToken } from './_firebase-admin.js';

// Merged scrape (GET) + translate (POST) into one function — Vercel Hobby
// plan caps Serverless Functions at 12 per deployment, and these two were
// always used together from StaffTranslation.jsx, never independently.

const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "https://talibclub.org"
const STAFF_ROLES = new Set(["staff", "admin", "owner"])
const SOURCE = "https://abuiyaad.com/"
const OPENAI_URL = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1/chat/completions"
const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages"

function decodeEntities(value = "") {
  return value
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&rsquo;/g, "'")
    .replace(/&lsquo;/g, "'")
    .replace(/&ldquo;/g, "“")
    .replace(/&rdquo;/g, "”")
    .replace(/&nbsp;/g, " ")
}

function cleanText(value = "") {
  return decodeEntities(value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim())
}

async function requireStaff(req) {
  const authHeader = req.headers?.authorization || req.headers?.Authorization
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    const err = new Error("Unauthorized: Missing authentication token")
    err.status = 401
    throw err
  }

  const decodedToken = await verifyIdToken(authHeader.substring(7))
  const userSnap = await admin.firestore().doc(`users/${decodedToken.uid}`).get()
  const role = userSnap.exists ? userSnap.data()?.role : null
  if (!STAFF_ROLES.has(role)) {
    const err = new Error("Forbidden: Staff access required")
    err.status = 403
    throw err
  }

  return decodedToken
}

// --- Scrape (GET) ---

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
    const title = cleanText(match[2])
    if (!title || title.length < 8) continue
    try {
      const url = new URL(decodeEntities(match[1]), baseUrl).href.split("#")[0]
      links.push({ title, url })
    } catch {
      // Ignore malformed links from the source page.
    }
  }
  return links
}

async function handleScrape(req, res) {
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
      } catch {
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

// --- Translate (POST) ---

function parseBody(req) {
  if (!req.body) return {}
  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body)
    } catch {
      return {}
    }
  }
  return req.body
}

function extractArticleContent(html) {
  const contentStart = html.indexOf('<div class="articleContent">')
  if (contentStart === -1) return ""
  const sub = html.slice(contentStart)
  let depth = 1
  const regex = /<\/?div\b/gi
  let match
  regex.lastIndex = 28 // length of '<div class="articleContent">'
  let closingIndex = -1
  while ((match = regex.exec(sub))) {
    if (match[0].toLowerCase() === "<div") {
      depth++
    } else {
      depth--
    }
    if (depth === 0) {
      closingIndex = match.index
      break
    }
  }
  if (closingIndex === -1) return sub
  return sub.slice(0, closingIndex + 6)
}

function repairParagraphs(html) {
  const tokens = html.split(/(<\/?[a-zA-Z0-9]+(?:\s+[^>]*)?>)/g)
  let result = []
  let pOpen = false

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]
    if (i % 2 === 1) { // It is a tag
      const isStartTag = token.startsWith("<") && !token.startsWith("</") && !token.endsWith("/>")
      const isEndTag = token.startsWith("</")
      const tagName = token.replace(/[<>/]/g, "").split(/\s+/)[0].toLowerCase()

      if (isStartTag) {
        if (tagName === "p") {
          if (pOpen) {
            result.push("</p>")
          }
          pOpen = true
          result.push("<p>")
        } else if (["div", "blockquote", "h1", "h2", "h3", "h4", "h5", "h6", "ul", "ol", "li", "hr", "br"].includes(tagName)) {
          if (pOpen) {
            result.push("</p>")
            pOpen = false
          }
          result.push(token)
        } else {
          result.push(token)
        }
      } else if (isEndTag) {
        if (tagName === "p") {
          if (pOpen) {
            result.push("</p>")
            pOpen = false
          }
        } else if (["div", "blockquote", "h1", "h2", "h3", "h4", "h5", "h6", "ul", "ol", "li"].includes(tagName)) {
          if (pOpen) {
            result.push("</p>")
            pOpen = false
          }
          result.push(token)
        } else {
          result.push(token)
        }
      } else {
        result.push(token)
      }
    } else { // It is text
      result.push(token)
    }
  }

  if (pOpen) {
    result.push("</p>")
  }

  return result.join("")
}

// The Thai transliterations below were mojibake — UTF-8 Thai that had been
// decoded as Latin-1 and written back out, so the model was handed a glossary
// of replacement characters and fell back to its own spellings. Restored to the
// spellings the rest of the site uses.
function translationPrompt(elements) {
  return `You are an expert English-to-Thai translator specializing in Islamic studies (Aqeedah, Manhaj, Tawhid) and the understanding of the Salaf.
Translate the following English article blocks into Thai.
Requirements:
1. Translate line-by-line and retain the exact array length and element mapping.
2. Translate accurately and naturally into Thai, ensuring correct Islamic terminology transliterations (e.g., Aqeedah -> อะกีดะฮ์, Manhaj -> มันฮัจญ์, Tawhid -> เตาฮีด, Salaf -> สะลัฟ, Sunnah -> สุนนะฮ์, Bid'ah -> บิดอะฮ์, Jahiliyyah -> ญาฮิลียะฮ์, Shirk -> ชิริก).
3. Do not add any commentary or extra text outside the translation.
4. Return the result strictly as a JSON object containing a "translations" field, which is an array of the translated objects: { id: number, tag: string, english: string, thai: string }.

Article blocks:
${JSON.stringify(elements, null, 2)}`
}

async function translateWithOpenAI(elements, apiKey) {
  const response = await fetch(OPENAI_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: "You translate article blocks into Thai. You return strictly a JSON object with a translations array." },
        { role: "user", content: translationPrompt(elements) },
      ],
      temperature: 0.1,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error("OpenAI translate error:", response.status, errorText)
    throw new Error(`OpenAI error: ${response.status} - ${errorText}`)
  }

  const data = await response.json()
  const resultText = data.choices?.[0]?.message?.content?.trim() || "{}"
  try {
    return JSON.parse(resultText)
  } catch (e) {
    console.error("JSON parse error from OpenAI:", e);
    throw new Error("Failed to parse JSON from AI response");
  }
}

async function translateWithAnthropic(elements, apiKey) {
  const response = await fetch(ANTHROPIC_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL || "claude-3-5-haiku-20241022",
      max_tokens: 4000,
      temperature: 0.1,
      messages: [{
        role: "user",
        content: `${translationPrompt(elements)}

Return ONLY a valid JSON object with the "translations" array, no markdown blocks.`,
      }],
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error("Anthropic translate error:", response.status, errorText)
    throw new Error(`Anthropic error: ${response.status} - ${errorText}`)
  }

  const data = await response.json()
  const text = data.content?.map(part => part.text || "").join("\n").trim() || "{}"
  const jsonText = text.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "").trim()
  try {
    return JSON.parse(jsonText)
  } catch (e) {
    console.error("JSON parse error from Anthropic:", e);
    throw new Error("Failed to parse JSON from AI response");
  }
}

async function translateWithGemini(elements, apiKey, modelName = "gemini-2.5-flash") {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: `${translationPrompt(elements)}\n\nReturn the output as a valid JSON object containing the translations array. Do not wrap in markdown code blocks.`
        }]
      }],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.1
      }
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error("Gemini translate error:", response.status, errorText)
    throw new Error(`Gemini error: ${response.status} - ${errorText}`)
  }

  const data = await response.json()
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "{}"
  const jsonText = text.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "").trim()
  try {
    return JSON.parse(jsonText)
  } catch (e) {
    console.error("JSON parse error from Gemini:", e);
    throw new Error("Failed to parse JSON from AI response");
  }
}

async function handleTranslate(req, res) {
  const params = parseBody(req)
  const { url } = params
  if (!url) {
    return res.status(400).json({ error: "Missing article URL" })
  }

  let parsedUrl
  try {
    parsedUrl = new URL(url)
  } catch {
    return res.status(400).json({ error: "Invalid URL format" })
  }

  const isAbuiyaad = parsedUrl.hostname === "abuiyaad.com" || parsedUrl.hostname.endsWith(".abuiyaad.com")
  if (!isAbuiyaad) {
    return res.status(400).json({ error: "Only abuiyaad.com domain is permitted" })
  }

  try {
    // 1. Fetch HTML
    const pageResponse = await fetch(url, {
      headers: { "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" }
    })

    if (!pageResponse.ok) {
      return res.status(500).json({ error: `Failed to fetch article from abuiyaad.com: Status ${pageResponse.status}` })
    }

    const html = await pageResponse.text()

    // 2. Extract content
    const contentHtml = extractArticleContent(html)
    if (!contentHtml) {
      return res.status(404).json({ error: "Article content wrapper (.articleContent) not found on the page." })
    }

    const repairedHtml = repairParagraphs(contentHtml)

    // 3. Extract text elements
    const elements = []
    const regex = /<(p|h1|h2|h3|h4|h5|li|blockquote)\b[^>]*>([\s\S]*?)<\/\1>/gi
    let match
    let index = 0
    while ((match = regex.exec(repairedHtml))) {
      const tag = match[1].toLowerCase()
      const text = cleanText(match[2])

      // Filter out footer links, empty rows, PDF download boxes
      if (!text || text.length < 3) continue
      if (text.includes("View PDF File") || text.includes("View File") || text.includes("Read the full article")) continue
      if (text.startsWith("Filed under") || text.startsWith("Posted by")) continue

      elements.push({ id: index++, tag, english: text })
    }

    if (elements.length === 0) {
      return res.status(404).json({ error: "No translateable text blocks found inside the article content." })
    }

    // 4. Translate using LLM (Try OpenAI, then Anthropic, then Gemini)
    let translationResult = null
    let source = ""
    const openaiKey = process.env.OPENAI_API_KEY
    const anthropicKey = process.env.ANTHROPIC_API_KEY
    const geminiKey = process.env.GEMINI_API_KEY
    let lastError = null;

    if (openaiKey) {
      try {
        translationResult = await translateWithOpenAI(elements, openaiKey)
        source = "openai"
      } catch (err) {
        lastError = err.message;
        console.error("OpenAI translation failed:", err)
      }
    }

    if (!translationResult && anthropicKey) {
      try {
        translationResult = await translateWithAnthropic(elements, anthropicKey)
        source = "anthropic"
      } catch (err) {
        lastError = err.message;
        console.error("Anthropic translation failed:", err)
      }
    }

    if (!translationResult && geminiKey) {
      const geminiModels = [
        process.env.GEMINI_MODEL || "gemini-2.5-flash-lite",
        "gemini-3-flash",
        "gemini-2.5-flash"
      ];

      for (const model of geminiModels) {
        try {
          translationResult = await translateWithGemini(elements, geminiKey, model)
          source = "gemini"
          lastError = null; // Clear error on success
          console.log(`Successfully translated using ${model}`);
          break; // Stop looping when successful
        } catch (err) {
          lastError = err.message;
          console.warn(`Gemini (${model}) translation failed:`, err.message)
        }
      }
    }

    if (!translationResult) {
      if (lastError) {
        return res.status(500).json({ error: `AI translation failed: ${lastError}` })
      }
      return res.status(500).json({ error: "AI translation service is currently unavailable. Set up API keys." })
    }

    return res.status(200).json({
      source,
      url,
      translations: translationResult.translations || []
    })
  } catch (error) {
    console.error("Translation API handler error:", error)
    return res.status(500).json({ error: error.message || "An error occurred during translation processing." })
  }
}

// --- Dispatch ---

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    await requireStaff(req)
  } catch (error) {
    return res.status(error.status || 401).json({ error: error.message || "Unauthorized: Invalid token" });
  }

  if (req.method === "GET") return handleScrape(req, res)
  return handleTranslate(req, res)
}
