// src/utils/url.js

export function getPagePath(id, data = null) {
  if (id === "home" || id === "") return "/";
  if (id === "tracking") return "/tracking-system";

  let p = "/" + id;
  if (data) {
    // Deliberately no category segment here: SEOHead, the sitemap, and
    // api/seo-prerender.js all declare the canonical URL as the plain
    // `/article?id=X` form (no category). Adding one here made every
    // internally-linked detail page disagree with its own declared
    // canonical, which Search Console reported as duplicate content with
    // a mismatched canonical on ~84 pages.
    const qParams = new URLSearchParams()
    if (["article", "library-detail", "media-detail"].includes(id) && data.id) {
      qParams.set("id", String(data.id))
    } else {
      Object.entries(data).forEach(([key, val]) => {
        if (val !== null && val !== undefined && typeof val !== "object") {
          qParams.set(key, String(val))
        }
      })
    }
    const queryString = qParams.toString()
    if (queryString) {
      p += `?${queryString}`
    }
  }
  return p;
}
