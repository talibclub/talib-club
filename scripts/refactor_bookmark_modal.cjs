const fs = require('fs');
const bookmarkModalStr = fs.readFileSync('scratch/bookmark_modal.txt', 'utf8');

const modalCode = `import React from 'react';
import { createPortal } from 'react-dom';
import { stripTajweedTags } from '../utils/quranUtils.js';

export default function BookmarkModal({
  activeBookmarkModal,
  setActiveBookmarkModal,
  modalNotes,
  setModalNotes,
  tajweedEnabled,
  handleDeleteBookmark,
  handleSaveBookmark
}) {
  if (!activeBookmarkModal) return null;

  return (` + bookmarkModalStr.replace(/\{activeBookmarkModal && createPortal\(/g, '{createPortal(') + `  );
}
`;

fs.writeFileSync('src/pages/quran/components/BookmarkModal.jsx', modalCode);
console.log('Saved BookmarkModal.jsx');

let quranCode = fs.readFileSync('src/pages/Quran.jsx', 'utf8');

// Insert import
quranCode = quranCode.replace(
  'import AyahMenuModal from "./quran/components/AyahMenuModal.jsx"',
  'import AyahMenuModal from "./quran/components/AyahMenuModal.jsx"\nimport BookmarkModal from "./quran/components/BookmarkModal.jsx"'
);

// Replace block
const startStr = '{/* BOOKMARK REFLECTION MODAL */}';
const endStr = '<AyahMenuModal';
const startIndex = quranCode.indexOf(startStr);
const endIndex = quranCode.indexOf(endStr);

if (startIndex !== -1 && endIndex !== -1) {
  const toReplace = quranCode.substring(startIndex, endIndex);
  const replacement = `<BookmarkModal
        activeBookmarkModal={activeBookmarkModal}
        setActiveBookmarkModal={setActiveBookmarkModal}
        modalNotes={modalNotes}
        setModalNotes={setModalNotes}
        tajweedEnabled={tajweedEnabled}
        handleDeleteBookmark={handleDeleteBookmark}
        handleSaveBookmark={handleSaveBookmark}
      />\n\n      ` + endStr;
  
  quranCode = quranCode.replace(toReplace + endStr, replacement);
  fs.writeFileSync('src/pages/Quran.jsx', quranCode);
  console.log('Updated Quran.jsx');
}
