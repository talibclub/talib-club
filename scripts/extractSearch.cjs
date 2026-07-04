const fs = require('fs');
const path = require('path');

const quranPath = path.join(__dirname, '../src/pages/Quran.jsx');
const searchHookPath = path.join(__dirname, '../src/pages/quran/hooks/useQuranSearch.js');

let content = fs.readFileSync(quranPath, 'utf8');

const hookCode = `import { useState, useEffect } from "react";

export function useQuranSearch() {
  const [sidebarTab, setSidebarTab] = useState("surah") // "surah" | "search"
  const [keywordQuery, setKeywordQuery] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchError, setSearchError] = useState(null)
  const [searchHasRun, setSearchHasRun] = useState(false)

  const performSearch = async (query) => {
    if (!query.trim()) return
    setSearchLoading(true)
    setSearchError(null)
    try {
      const res = await fetch(\`https://api.alquran.cloud/v1/search/\${encodeURIComponent(query)}/all/th.thai\`)
      const data = await res.json()
      if (data.code === 200 && data.status === "OK" && data.data?.matches) {
        setSearchResults(data.data.matches)
      } else {
        setSearchResults([])
      }
      setSearchHasRun(true)
    } catch (err) {
      console.error(err)
      setSearchError("ไม่พบข้อมูล หรือการเชื่อมต่อเครือข่ายขัดข้อง")
    } finally {
      setSearchLoading(false)
    }
  }

  useEffect(() => {
    if (!keywordQuery.trim()) {
      setSearchResults([])
      setSearchHasRun(false)
      setSearchError(null)
      return
    }
    setSearchHasRun(false)
    const delayDebounceFn = setTimeout(() => {
      performSearch(keywordQuery)
    }, 600)
    return () => clearTimeout(delayDebounceFn)
  }, [keywordQuery])

  const handleKeywordSearch = (e) => {
    if (e) e.preventDefault()
    performSearch(keywordQuery)
  }

  return {
    sidebarTab, setSidebarTab,
    keywordQuery, setKeywordQuery,
    searchResults, setSearchResults,
    searchLoading, setSearchLoading,
    searchError, setSearchError,
    searchHasRun, setSearchHasRun,
    handleKeywordSearch
  }
}
`;

fs.writeFileSync(searchHookPath, hookCode);

// Attempt to remove these states from Quran.jsx, but honestly, it's risky via regex.
// I'll use multi_replace_file_content or manual replace.
console.log("Created useQuranSearch.js");
