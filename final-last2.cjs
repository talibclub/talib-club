const fs = require('fs');
let code = fs.readFileSync('src/pages/reading/components/ProNotebook.jsx', 'utf8');
const lines = code.split('\n');

const fixes = {
  2558: '                    title="เลือกกรอบเฉพาะส่วนที่ต้องการจากหน้าใดหน้าหนึ่ง"',
  2561: '                    <Camera size={14} /> แคปเฉพาะบางส่วน',
  2571: '          <p style={{ fontSize: 15, color: \'#4B5563\' }}>กรุณาเปิดแอปนี้บน Tablet หรือ Computer (Desktop) เพื่อใช้งานระบบจดโน้ตแบบสมบูรณ์</p>',
  2581: '          <p style={{ margin: \'2px 0 0\', fontSize: 12, color: \'var(--t2)\' }}>แตะเพื่อไปหน้านั้น หรือตั้งชื่อเพื่อค้นหาได้ง่ายขึ้น</p>',
  2596: '                    ไม่มีหน้ากระดาษที่ค้นหา',
  2629: '                  title="ตั้งชื่อหน้านี้ เพื่อให้หาเจอตอนพิมพ์ [["',
  2655: '                  placeholder="พิมพ์ข้อความที่ต้องการค้นหา..."',
  2690: '          onPopupBlocked={() => toast.error(\'เบราว์เซอร์บล็อกหน้าต่างใหม่ — อนุญาต pop-up ให้เว็บนี้ก่อน แล้วลองอีกครั้ง\')}'
};

for (let key in fixes) {
  lines[key] = fixes[key];
}

fs.writeFileSync('src/pages/reading/components/ProNotebook.jsx', lines.join('\n'));
