// src/utils/url.js

import { DETAIL_ROUTES, detailPath } from "./slug.js";

export function getPagePath(id, data = null) {
  if (id === "home" || id === "") return "/";
  if (id === "tracking") return "/tracking-system";

  // Detail pages are addressed as `/article/<id>/<slug>` — the id carries the
  // lookup, the slug puts the Thai title in the URL where Google can read it.
  // SEOHead, the sitemap and api/seo-prerender.js all build this exact shape
  // from the same helper; when they disagreed, Search Console reported the
  // pages as duplicates with a mismatched canonical. The slug is dropped when
  // the caller only has an id (e.g. reading history) — the detail page then
  // rewrites the URL to the canonical form once the title has loaded.
  if (DETAIL_ROUTES.includes(id) && data && data.id) {
    return detailPath(id, data.id, data.title);
  }

  let p = "/" + id;
  if (data) {
    const qParams = new URLSearchParams()
    Object.entries(data).forEach(([key, val]) => {
      if (val !== null && val !== undefined && typeof val !== "object") {
        qParams.set(key, String(val))
      }
    })
    const queryString = qParams.toString()
    if (queryString) {
      p += `?${queryString}`
    }
  }
  return p;
}
