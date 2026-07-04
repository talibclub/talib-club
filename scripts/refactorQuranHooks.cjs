const fs = require('fs');
const path = require('path');

const quranPath = path.join(__dirname, '../src/pages/Quran.jsx');
let content = fs.readFileSync(quranPath, 'utf8');

// The hooks we're importing
const importsToAdd = `
import { useQuranSettings } from "./quran/hooks/useQuranSettings.js"
import { useQuranNavigation } from "./quran/hooks/useQuranNavigation.js"
import { useQuranSearch } from "./quran/hooks/useQuranSearch.js"
`;

// 1. Add imports
const importTarget = 'import { getOfflineItem, setOfflineItem } from "../lib/offlineStore.js"';
content = content.replace(importTarget, importTarget + '\n' + importsToAdd);

// 2. Replace Navigation state
const navStateRegex = /const \[selectedSura, setSelectedSura\][\s\S]*?if \(changed\) {[\s\S]*?window.history.replaceState\([\s\S]*?\}[\s\S]*?\}[\s\S]*?\}, \[selectedSura, targetScrollAyah\]\)/;

const navHookCall = `
  const { mode, setMode, translationKey, setTranslationKey, arabicSize, setArabicSize, thaiSize, setThaiSize, quranFont, tajweedEnabled, setTajweedEnabled, showTajweedLegend, setShowTajweedLegend } = useQuranSettings();
  
  const [selectedPage, setSelectedPage] = useState(null)
  
  const { selectedSura, setSelectedSura, targetScrollAyah, setTargetScrollAyah, navMode, setNavMode, pageInput, setPageInput } = useQuranNavigation({ initialSura, initialAyah, mode, setSelectedPage });
  
  const { sidebarTab, setSidebarTab, keywordQuery, setKeywordQuery, searchResults, setSearchResults, searchLoading, setSearchLoading, searchError, setSearchError, searchHasRun, setSearchHasRun, handleKeywordSearch } = useQuranSearch();
`;

// Need to match exactly what's in the file to avoid regex errors. 
// Alternatively, let's do this manually using a series of specific string replaces.
// Because it's so large, using regex to match 100 lines might fail due to subtle variations.

// For now, I'll just write this file to show intent, but it's risky to auto-replace.
console.log("Refactoring hooks is better done via targeted AST or manual chunk replacement.");
