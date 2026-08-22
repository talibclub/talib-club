const fs = require('fs');
let code = fs.readFileSync('src/pages/reading/components/ProNotebook.jsx', 'utf8');
const lines = code.split('\n');

const fixes = {
  2734: '          <span style={{ fontSize: 12.5, color: HW.textDim, fontFamily: \'Kanit, sans-serif\' }}>กำลังประมวลผลเครือข่าย...</span>',
  2745: '          {connectorSourceId ? \'เลือกวัตถุปลายทางเพื่อเชื่อม\' : \'ลากจากวัตถุหนึ่งไปยังอีกวัตถุ\'}',
  2747: '        <button onClick={cancelConnector} title="ยกเลิกโหมดเชื่อม (Esc)" style={{ display: \'flex\', alignItems: \'center\', gap: 3, border: \'none\', borderRadius: 999, padding: \'4px 7px\', background: \'rgba(255,255,255,0.18)\', color: \'white\', cursor: \'pointer\', fontFamily: \'Kanit, sans-serif\', fontSize: 11.5, fontWeight: 600 }}>ยกเลิกโหมดเชื่อม</button>',
  3220: '      // that start past the bottom is not enough on its own —',
  3964: '          บรรทัดถัดไป',
  3967: '          ขึ้นบน',
  3971: '          ปิด',
  4044: '        toast(\'แตะหรือ ลาก ไปยังวัตถุปลายทางเพื่อเชื่อม เส้นจะเกาะทั้งสองฝั่ง\', { icon: \'🔗\' });',
  4133: '                  title={`ไปหน้า ${im.sourcePage} ในหนังสือต้นฉบับ`}',
  4158: '        toast.success(\'แปะภาพจากหนังสือลงโน้ตแล้ว เลือกเครื่องมือเลื่อน (มือ) เพื่อจัดตำแหน่ง\');'
};

for (let key in fixes) {
  lines[key] = fixes[key];
}

fs.writeFileSync('src/pages/reading/components/ProNotebook.jsx', lines.join('\n'));
