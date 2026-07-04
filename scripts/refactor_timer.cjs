const fs = require('fs');
let code = fs.readFileSync('src/pages/ReadingApp.jsx', 'utf8');

// Insert import
code = code.replace(
  'import TutorialModal from "./reading/components/TutorialModal.jsx"',
  'import TutorialModal from "./reading/components/TutorialModal.jsx"\nimport TimerPanel from "./reading/components/TimerPanel.jsx"'
);

// Replace block
const blockStart = '<div className="card reader-form-card" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14, overflowY: "auto", height: "100%" }}>';
const blockEnd = '          {/* Right Panel: Embedded Google Preview Viewer */}';

const startIndex = code.indexOf(blockStart);
const endIndex = code.indexOf(blockEnd);

if (startIndex !== -1 && endIndex !== -1) {
  const toReplace = code.substring(startIndex, endIndex);
  const newBlock = `          <TimerPanel
            seconds={seconds}
            displayTimer={displayTimer}
            startPage={startPage}
            setStartPage={setStartPage}
            endPage={endPage}
            setEndPage={setEndPage}
            reflection={reflection}
            setReflection={setReflection}
            saving={saving}
            saveReadingProgress={saveReadingProgress}
            MIN_VERIFIED_SECONDS={MIN_VERIFIED_SECONDS}
            MIN_REFLECTION_CHARS={MIN_REFLECTION_CHARS}
          />
` + '\n';
  code = code.replace(toReplace, newBlock);
  fs.writeFileSync('src/pages/ReadingApp.jsx', code);
  console.log('Success');
} else {
  console.log('Not found');
}
