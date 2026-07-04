const fs = require('fs');
const ayahMenuStr = fs.readFileSync('scratch/ayah_menu.txt', 'utf8');

const modalCode = `import React from 'react';
import { createPortal } from 'react-dom';
import { useAudioContext } from '../../../context/AudioContext.jsx';
import { SURA_LIST } from '../../../data/surahs.js';
import { stripTajweedTags } from '../utils/quranUtils.js';

export default function AyahMenuModal({
  activeAyahMenu,
  setActiveAyahMenu,
  quranFont,
  tajweedEnabled,
  selectedPage,
  pageVerses,
  verses,
  modalDetails,
  updateLastRead,
  lastRead,
  getBookmarkForVerse,
  getVerseTranslation,
  handleOpenBookmarkModal
}) {
  const { playingAudio, audioState, play, pause, resume } = useAudioContext();

  if (!activeAyahMenu) return null;

  return (` + ayahMenuStr.replace(/\{activeAyahMenu && createPortal\(/g, '{createPortal(') + `  );
}
`;

fs.writeFileSync('src/pages/quran/components/AyahMenuModal.jsx', modalCode);
console.log('Saved AyahMenuModal.jsx');

let quranCode = fs.readFileSync('src/pages/Quran.jsx', 'utf8');

// Insert import
quranCode = quranCode.replace(
  'import { useQuranData } from "./quran/hooks/useQuranData.js"',
  'import { useQuranData } from "./quran/hooks/useQuranData.js"\nimport AyahMenuModal from "./quran/components/AyahMenuModal.jsx"'
);

// Replace block
const startStr = '{/* AYAH OPTIONS POPUP (MUSHAF MODE MENU) */}';
const endStr = '      {/* MOBILE BOTTOM SHEET NAVIGATION DRAWER */}';
const startIndex = quranCode.indexOf(startStr);
const endIndex = quranCode.indexOf(endStr);

if (startIndex !== -1 && endIndex !== -1) {
  const toReplace = quranCode.substring(startIndex, endIndex);
  const replacement = `<AyahMenuModal
        activeAyahMenu={activeAyahMenu}
        setActiveAyahMenu={setActiveAyahMenu}
        quranFont={quranFont}
        tajweedEnabled={tajweedEnabled}
        selectedPage={selectedPage}
        pageVerses={pageVerses}
        verses={verses}
        modalDetails={modalDetails}
        updateLastRead={updateLastRead}
        lastRead={lastRead}
        getBookmarkForVerse={getBookmarkForVerse}
        getVerseTranslation={getVerseTranslation}
        handleOpenBookmarkModal={handleOpenBookmarkModal}
      />\n\n      ` + endStr;
  
  quranCode = quranCode.replace(toReplace + endStr, replacement);
  fs.writeFileSync('src/pages/Quran.jsx', quranCode);
  console.log('Updated Quran.jsx');
}
