import sys

file_path = 'src/pages/reading/components/ProNotebook.jsx'
with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
for i, line in enumerate(lines):
    line_num = i + 1
    if line_num == 824:
        new_lines.append('         try { localStorage.setItem(`talib_notebook_${notebookId}`, JSON.stringify(pages)); } catch (e) { console.warn("Local storage quota exceeded on backup", e); }\n')
    elif line_num == 828:
        new_lines.append('         let localSaved = false;\n')
        new_lines.append('         try { localStorage.setItem(`talib_notebook_${notebookId}`, JSON.stringify(pages)); localSaved = true; } catch (e) { console.warn("Local storage quota exceeded on fallback", e); }\n')
    elif line_num == 829:
        new_lines.append('         if (localSaved) {\n')
        new_lines.append(line)
        new_lines.append('         } else {\n')
        new_lines.append('            toast.error("บันทึกคลาวด์ล้มเหลว และพื้นที่ในเครื่องเต็ม (ไม่สามารถบันทึกได้)", { id: "cloud-save" });\n')
        new_lines.append('         }\n')
    else:
        new_lines.append(line)

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)
print("SUCCESS")
