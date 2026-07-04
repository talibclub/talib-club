// src/utils/url.js

export function getPagePath(id, data = null) {
  if (id === "home" || id === "") return "/";
  if (id === "tracking") return "/tracking-system";
  
  let p = "/" + id;
  if (data) {
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
