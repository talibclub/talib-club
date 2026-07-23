# แผนข้อ 9 — Rich Text (จัดรูปแบบต่อบรรทัด) สำหรับสมุดโน้ต

> สถานะ: **วางแผน — ยังไม่เขียนโค้ด** · เอกสารนี้กันแผนหายข้ามเครื่อง

## ปัญหา (ข้อ 9)
จัดรูปแบบเฉพาะบางบรรทัดในกล่องข้อความเดียวไม่ได้ (เช่น บรรทัด 1–2 เป็น bullet/ตัวหนา แต่บรรทัด 3 ธรรมดา) เพราะ format เป็น **ระดับกล่อง** ทั้งใบ

## โครงปัจจุบัน (อ้างอิงโค้ด)
- โมเดล: แต่ละหน้า `page.texts[]`; แต่ละกล่อง `{ id, text:"บรรทัด\nบรรทัด", x, y, color, size, fontFamily, bold, italic, underline, strikethrough, align, list, width }` — **format ทุกตัวเป็นของทั้งกล่อง**
- Render: Konva `<Text>` ใบเดียวต่อกล่อง + `applyListPrefix(t.text, t.list)` เติม `•`/`n.` ทุกบรรทัด (`ProNotebook.jsx` ~3869), `geometry.js:applyListPrefix`
- แก้ไข: `TextEditor.jsx` — `<textarea>` เดียว + overlay gutter bullet ทุกบรรทัด
- Export: render Konva stage → รูป/PDF (ถ้า canvas render ถูก export จะถูกตามอัตโนมัติ)
- เซฟ: spread `{...t}` ลง Firestore

## ขอบเขตที่เลือก: **ต่อบรรทัด (line-level)** ไม่ใช่ต่อตัวอักษร
โจทย์พูดถึง "บรรทัด" → ทำระดับบรรทัดพอ ครอบคลุมความต้องการ และเสี่ยงน้อยกว่าการทำ inline span ต่อตัวอักษรมาก (ซึ่งต้องใช้ contentEditable + เลย์เอาต์หลาย Text node/อักขระ และ Konva render inline ผสมไม่ได้ในโหนดเดียว) — เก็บ inline-span ไว้เป็นงานอนาคต

## โมเดลใหม่
```
t = {
  id, x, y, width,
  fontFamily, size, color,          // ค่าระดับกล่อง (default ร่วม)
  lines: [
    { text, bold, italic, underline, strikethrough, list, align },
    ...
  ]
}
```
- ต่อบรรทัด: `bold/italic/underline/strikethrough/list/align`
- ระดับกล่อง (คงเดิม): `fontFamily/size/color` (ต่อบรรทัดของสามตัวนี้ = งานอนาคต)

## Migration (สำคัญ — ห้ามทำโน้ตเก่าพัง)
`migrateText(t)`: ถ้าเจอ `t.text` (แบบเก่า) → split `\n` เป็น `lines[]` โดยแต่ละบรรทัดสืบทอด `bold/italic/underline/strikethrough/list/align` จากค่ากล่องเดิม รันตอนโหลดจาก Firestore และกันเหนียวตอน render ทุกจุดที่อ่าน `t.text`

## งานที่ต้องแก้ (แยกเฟสให้ ship ได้ระหว่างทาง)

### เฟส 1 — โมเดล + Migration + Render ต่อบรรทัด (เอดิเตอร์ยังเป็นระดับกล่อง)
- เพิ่ม `migrateText` + normalize ตอนโหลด
- Render: เปลี่ยน `<Text>` ใบเดียว → map เป็น `<Text>` ต่อบรรทัด เรียงตาม y (คำนวณ lineHeight ให้ตรงเอดิเตอร์) แต่ละบรรทัดใช้ fontStyle/decoration/align/prefix ของตัวเอง; เลข list เดิน/รีเซ็ตภายในกล่อง; ห่อใน `<Group>` เดิมเพื่อให้ select/drag/transform เหมือนเดิม
- อัปเดตการคำนวณ bounds ของกล่อง (สูง = ผลรวม lineHeight) ที่ใช้ select/lasso (~1718, ~2230)
- ผลลัพธ์: โน้ตเก่าหน้าตาเหมือนเดิมเป๊ะ, export ถูกตาม, ยังไม่เพิ่มความเสี่ยงฝั่งแก้ไข

### เฟส 2 — เอดิเตอร์ต่อบรรทัด (ส่วนเสี่ยงสุด)
- เปลี่ยน `<textarea>` → `contentEditable` แบบบล็อกต่อบรรทัด; ปุ่ม B/I/list/align ทำงานกับ "บรรทัดที่ caret อยู่ / บรรทัดที่เลือกคลุม"
- ต้องดูแล: caret, IME/ภาษาไทย, มือถือ/แท็บเล็ต, blur→commit, undo/redo, การ sync กับ `lines[]`
- แนะนำแยก commit/PR ของเฟสนี้ออกจากเฟส 1 เพื่อให้ย้อนได้ง่ายถ้ามีปัญหา

## ความเสี่ยง & ข้อควรระวัง
- Migration ผิด = โน้ตเก่าเสีย → เขียนเทสเคสแปลงเก่า→ใหม่ก่อน
- lineHeight เอดิเตอร์กับ canvas ต้องตรงกัน ไม่งั้นข้อความเหลื่อม
- contentEditable + ภาษาไทย/IME เป็นจุดพังบ่อย ต้องทดสอบจริง
- undo/redo เดิมทำงานบน snapshot ของ page — โมเดลใหม่ต้องเข้ากับกลไกนี้

## ประเมิน
- เฟส 1: กลาง (contained)
- เฟส 2: ใหญ่/เสี่ยง (เอดิเตอร์)
- รวม = "งานใหญ่สุด" ตามที่โน้ตเดิมบอก — ควร ship เป็น 2 เฟส
