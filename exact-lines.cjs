const fs = require('fs');
let currLines = fs.readFileSync('src/pages/reading/components/ProNotebook.jsx', 'utf8').split('\n');

currLines[3943] = '      <button onClick={() => { deleteNode(selection[0]); setSelection([]); }} title="ลบโพสต์อิท" style={{ padding: 6, background: \'transparent\', color: HW.textDim, border: \'none\', cursor: \'pointer\', display: \'flex\' }}><Trash2 size={16} /></button>';
currLines[3964] = '        <button title="เลื่อนซ้าย" onClick={() => moveWriterFocus(-writerBoxW * 0.45, 0)} style={{ width: 32, height: 32, borderRadius: 9, border: \'none\', background: \'transparent\', color: HW.text, cursor: \'pointer\', display: \'flex\', alignItems: \'center\', justifyContent: \'center\' }}>';
currLines[3967] = '        <button title="เลื่อนขวา" onClick={() => moveWriterFocus(writerBoxW * 0.45, 0)} style={{ width: 32, height: 32, borderRadius: 9, border: \'none\', background: \'transparent\', color: HW.text, cursor: \'pointer\', display: \'flex\', alignItems: \'center\', justifyContent: \'center\' }}>';
currLines[3970] = '        <button title="บรรทัดถัดไป" onClick={() => moveWriterFocus(-writerFocus.x, writerBoxH * 0.62)} style={{ marginLeft: 6, padding: \'5px 12px\', borderRadius: 9, border: \'none\', background: HW.accentSoft, color: HW.accent, fontSize: 12.5, fontWeight: 600, cursor: \'pointer\' }}>';
currLines[3971] = '          บรรทัดถัดไป';
currLines[3973] = '        <button title="บรรทัดก่อนหน้า" onClick={() => moveWriterFocus(0, -writerBoxH * 0.62)} style={{ padding: \'5px 12px\', borderRadius: 9, border: \'none\', background: \'transparent\', color: HW.textDim, fontSize: 12.5, fontWeight: 600, cursor: \'pointer\' }}>';
currLines[3974] = '          ขึ้นบน';
currLines[3978] = '          ปิด';
currLines[4051] = '        toast(\'แตะหรือ ลาก ไปยังวัตถุปลายทางเพื่อเชื่อม เส้นจะเกาะทั้งสองฝั่ง\', { icon: \'🔗\' });';
currLines[4085] = '              // uses — the toolbar\'s native colour input was inert on tablets. */}';
currLines[4098] = '        {/* Paper template picker. The "เปลี่ยนแม่แบบกระดาษ" button set this flag but';
currLines[4099] = '            nothing ever rendered — so the whole feature looked broken. */}';
currLines[4108] = '                toast.success(\'ใช้กับทุกหน้าแล้ว\');';
currLines[4116] = '        {/* Export modal — choose format (image / PDF) and scope (this page / all) */}';
currLines[4140] = '                  title={`ไปหน้า ${im.sourcePage} ในหนังสือต้นฉบับ`}';
currLines[4145] = '                  <Link2 size={12} strokeWidth={2.4} /> น.{im.sourcePage}';
currLines[4161] = '        // sourcePage lets the image show a 🔗 that jumps back to the book page.';
currLines[4165] = '        toast.success(\'แปะภาพจากหนังสือลงโน้ตแล้ว เลือกเครื่องมือเลื่อน (มือ) เพื่อจัดตำแหน่ง\');';
currLines[4185] = '        toast.success(\'ครอบตัดรูปภาพเรียบร้อย\');';

fs.writeFileSync('src/pages/reading/components/ProNotebook.jsx', currLines.join('\n'));
