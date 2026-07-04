const fs = require('fs');
let code = fs.readFileSync('src/pages/Quran.jsx', 'utf8');

const regexSura = /\/\/\s*Fetch Sura verses\s*useEffect\(\(\) => \{[\s\S]*?\}, \[selectedSura, translationKey, reloadKey\]\)/;
const regexPage = /\/\/\s*Fetch verses for page-based reading\s*useEffect\(\(\) => \{[\s\S]*?\}, \[selectedPage\]\)/;

// Replace import to include useQuranData
code = code.replace(
  'import { useQuranSettings } from "./quran/hooks/useQuranSettings.js"',
  'import { useQuranSettings } from "./quran/hooks/useQuranSettings.js"\nimport { useQuranData } from "./quran/hooks/useQuranData.js"'
);

// Replace state variables
code = code.replace(/const \[verses, setVerses\] = useState\(\[\]\)\r?\n\s*const \[loading, setLoading\] = useState\(false\)\r?\n\s*const \[error, setError\] = useState\(null\)\r?\n\s*const cache = useRef\(\{\} \/\/ Cache fetches/, '');
code = code.replace(/const \[pageVerses, setPageVerses\] = useState\(\[\]\)\r?\n\s*const \[pageLoading, setPageLoading\] = useState\(false\)/, '');

// Insert hook call where 'const inFlightModalRequests...' is
code = code.replace(
  'const inFlightModalRequests = useRef(new Map()) // Deduplication for modal fetches',
  'const { verses, pageVerses, loading, pageLoading, error, cache } = useQuranData({ selectedSura, setSelectedSura, selectedPage, translationKey, reloadKey, isMobile, setIsMobileNavOpen, setTargetScrollAyah })\n  const inFlightModalRequests = useRef(new Map()) // Deduplication for modal fetches'
);

// Remove the useEffect blocks
code = code.replace(regexSura, '');
code = code.replace(regexPage, '');

fs.writeFileSync('src/pages/Quran.jsx', code);
console.log('Success');
