const fs = require('fs');
const file = 'src/pages/reading/components/ProNotebook.jsx';
let content = fs.readFileSync(file, 'utf8');

const t1 = `         // Backup locally\n         localStorage.setItem(\`talib_notebook_\${notebookId}\`, JSON.stringify(pages));\n         if (!isAuto) toast.success("บันทึกคลาวด์เรียบร้อย!", { id: "cloud-save", icon: '💾' });\n      } catch (err) {`;
const r1 = `         // Backup locally\n         try { localStorage.setItem(\`talib_notebook_\${notebookId}\`, JSON.stringify(pages)); } catch (e) { console.warn("Local storage quota exceeded on backup", e); }\n         if (!isAuto) toast.success("บันทึกคลาวด์เรียบร้อย!", { id: "cloud-save", icon: '💾' });\n      } catch (err) {`;

const t2 = `         console.error(err);\n         localStorage.setItem(\`talib_notebook_\${notebookId}\`, JSON.stringify(pages));\n         toast.error("บันทึกคลาวด์ล้มเหลว (เซฟลงเครื่องแล้ว)", { id: "cloud-save" });\n      } finally {`;
const r2 = `         console.error(err);\n         let localSaved = false;\n         try { localStorage.setItem(\`talib_notebook_\${notebookId}\`, JSON.stringify(pages)); localSaved = true; } catch (e) { console.warn("Local storage quota exceeded on fallback", e); }\n         if (localSaved) {\n            toast.error("บันทึกคลาวด์ล้มเหลว (เซฟลงเครื่องแล้ว)", { id: "cloud-save" });\n         } else {\n            toast.error("บันทึกคลาวด์ล้มเหลว และพื้นที่ในเครื่องเต็ม (ไม่สามารถบันทึกได้)", { id: "cloud-save" });\n         }\n      } finally {`;

let changed = false;
if (content.includes(t1)) { content = content.replace(t1, r1); changed = true; } else { console.log('T1 not found'); }
if (content.includes(t2)) { content = content.replace(t2, r2); changed = true; } else { console.log('T2 not found'); }

if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('SUCCESS');
}
