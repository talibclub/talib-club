import { useEffect } from 'react'
import { toSchemaDate } from '../utils/dates.js'

export const BASE_URL = 'https://talibclub.org'
const SITE_NAME = 'Talib Club'

export function stripHtml(html) {
  if (!html) return ''
  return html.replace(/<[^>]+>/g, '').replace(/&nbsp;|&amp;|&lt;|&gt;|&#\d+;/g, ' ').replace(/\s+/g, ' ').trim()
}

export function truncate(text, maxLen = 160) {
  if (!text) return ''
  const clean = text.trim()
  if (clean.length <= maxLen) return clean
  return clean.substring(0, maxLen - 3).trim() + '...'
}

// Kept as a named export because the detail pages import it; the rules for
// what a schema.org date has to look like — including the Buddhist-year
// conversion the admin's `date` field needs — live in src/utils/dates.js, so
// the crawler prerender and this page agree on every date they both print.
export const toIsoDate = toSchemaDate

function setMetaTag(attr, attrValue, content) {
  let el = document.querySelector(`meta[${attr}="${attrValue}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, attrValue)
    el.setAttribute('data-seo', 'true')
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function setLinkTag(rel, href) {
  let el = document.querySelector(`link[rel="${rel}"][data-seo="true"]`)
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', rel)
    el.setAttribute('data-seo', 'true')
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

export default function SEOHead({ title, description, canonical, ogImage, ogType = 'website', jsonLd, noIndex = false }) {
  useEffect(() => {
    // Title
    if (title) document.title = title
    
    // Description
    if (description) {
      setMetaTag('name', 'description', truncate(description, 160))
    }
    
    // Canonical. Both tags are rewritten on every page, never just added: this
    // is a SPA, so the <head> left behind by the previous route is still in the
    // document. A canonical or a noindex that outlives its page points Google
    // at the wrong URL for the one it is actually looking at.
    if (canonical) {
      setLinkTag('canonical', canonical)
    } else {
      const stale = document.querySelector('link[rel="canonical"][data-seo="true"]')
      if (stale) stale.remove()
    }

    // Robots
    setMetaTag('name', 'robots', noIndex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1')

    // Open Graph
    if (title) setMetaTag('property', 'og:title', title)
    if (description) setMetaTag('property', 'og:description', truncate(description, 200))
    if (canonical) setMetaTag('property', 'og:url', canonical)
    setMetaTag('property', 'og:type', ogType)
    setMetaTag('property', 'og:site_name', SITE_NAME)
    setMetaTag('property', 'og:locale', 'th_TH')
    if (ogImage) {
      setMetaTag('property', 'og:image', ogImage)
      setMetaTag('property', 'og:image:width', '1200')
      setMetaTag('property', 'og:image:height', '630')
    }
    
    // Twitter Card
    setMetaTag('name', 'twitter:card', ogImage ? 'summary_large_image' : 'summary')
    if (title) setMetaTag('name', 'twitter:title', title)
    if (description) setMetaTag('name', 'twitter:description', truncate(description, 200))
    if (ogImage) setMetaTag('name', 'twitter:image', ogImage)
    
    // JSON-LD
    let scriptEl = document.querySelector('script[data-seo-jsonld="true"]')
    if (jsonLd) {
      if (!scriptEl) {
        scriptEl = document.createElement('script')
        scriptEl.setAttribute('type', 'application/ld+json')
        scriptEl.setAttribute('data-seo-jsonld', 'true')
        document.head.appendChild(scriptEl)
      }
      scriptEl.textContent = JSON.stringify(jsonLd)
    } else if (scriptEl) {
      scriptEl.remove()
    }
    
    // Cleanup
    return () => {
      // Remove JSON-LD on unmount
      const script = document.querySelector('script[data-seo-jsonld="true"]')
      if (script) script.remove()
    }
  }, [title, description, canonical, ogImage, ogType, jsonLd, noIndex])
  
  return null // This component doesn't render anything
}
