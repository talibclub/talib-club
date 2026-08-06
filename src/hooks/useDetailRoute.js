import { useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { detailPath, parseDetailId } from "../utils/slug.js"

// Which document a detail page is showing, read from the URL rather than from
// navigation state, so a cold load / shared link / crawler hit resolves the
// same way an in-app click does. Falls back to the item handed over in
// `location.state` when the URL carries nothing usable.
export function useDetailId(fallbackItem) {
  const location = useLocation()
  return parseDetailId(location.pathname, location.search) || fallbackItem?.id || null
}

// Legacy `/article?id=X` links (and `/article/<id>` without a slug, which is
// what a click from reading history produces) are rewritten in place to the
// canonical `/article/<id>/<slug>` once the title is known. `replace` keeps the
// back button working, and the existing history state is carried over so the
// page does not lose the item it was handed.
export function useCanonicalDetailUrl(route, id, title) {
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    if (!id || !title) return
    const canonical = detailPath(route, id, title)
    if (`${location.pathname}${location.search}` === canonical) return
    navigate(canonical, { replace: true, state: location.state })
  }, [route, id, title, location.pathname, location.search, location.state, navigate])
}
