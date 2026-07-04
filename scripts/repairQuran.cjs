const fs = require('fs');
const path = require('path');

const quranPath = path.join(__dirname, '../src/pages/Quran.jsx');
let content = fs.readFileSync(quranPath, 'utf8');

// Find where the state starts in the broken file
const stateIndex = content.indexOf('const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)');

if (stateIndex !== -1) {
  // We keep everything from isMobileNavOpen onwards
  const remainingContent = content.substring(stateIndex);
  
  const correctHeader = `import { useState, useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import { useAudio } from "../context/AudioContext.jsx"
import { SURA_LIST } from "../data/surahs.js"
import { getSurahTheme } from "../data/quranThemes.js"
import { useUserCollection, useUserDoc } from "../lib/contentStore.js"
import toast from "react-hot-toast"
import { confirmAction } from "../utils/feedback.jsx"
import DOMPurify from "dompurify"
import { getOfflineItem, setOfflineItem } from "../lib/offlineStore.js"

import "./quran/Quran.css"
import {
  JUZ_STARTS,
  normalizeSuraNumber,
  normalizeAyahNumber,
  stripTajweedTags,
  stripAllTags,
  cleanTajweedTags
} from "./quran/utils/quranUtils.js"

export default function Quran({ initialSura, initialAyah, authState }) {
  const [selectedSura, setSelectedSura] = useState(() => normalizeSuraNumber(initialSura))
  const readingAreaRef = useRef(null)

  const scrollToReadingArea = () => {
    if (readingAreaRef.current) {
      readingAreaRef.current.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    return localStorage.getItem("quran-sidebar-collapsed") === "true"
  })
  `;
  
  const finalContent = correctHeader + remainingContent;
  fs.writeFileSync(quranPath, finalContent);
  console.log("Successfully repaired Quran.jsx");
} else {
  console.log("Could not find the hook to repair the file.");
}
