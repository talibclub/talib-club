const fs = require('fs');
let currLines = fs.readFileSync('src/pages/reading/components/ProNotebook.jsx', 'utf8').split('\n');

currLines[2558] = '                    <BookOpen size={14} /> ดึง PDF ทุกหน้าเข้าโน้ต';
currLines[2562] = '                    title="เลือกกรอบเฉพาะส่วนที่ต้องการจากหน้าใดหน้าหนึ่ง"';
currLines[2575] = '          <p style={{ fontSize: 15, color: \'#4B5563\' }}>กรุณาเปิดแอปนี้บน Tablet หรือ Computer (Desktop) เพื่อใช้งานระบบจดโน้ตแบบสมบูรณ์</p>';
currLines[2600] = '                    ไม่มีหน้ากระดาษที่ค้นหา';
currLines[2660] = '                  placeholder="พิมพ์ข้อความที่ต้องการค้นหา..."';
currLines[2695] = '          onPopupBlocked={() => toast.error(\'เบราว์เซอร์บล็อกหน้าต่างใหม่ — อนุญาต pop-up ให้เว็บนี้ก่อน แล้วลองอีกครั้ง\')}';
currLines[2722] = '                <span style={{ fontSize: 15, fontWeight: 600, color: \'#111827\' }}>กำลังเตรียมหน้า PDF...</span>';
currLines[2752] = '          {connectorSourceId ? \'เลือกวัตถุปลายทางเพื่อเชื่อม\' : \'ลากจากวัตถุหนึ่งไปยังอีกวัตถุ\'}';
currLines[2754] = '        <button onClick={cancelConnector} title="ยกเลิกโหมดเชื่อม (Esc)" style={{ display: \'flex\', alignItems: \'center\', gap: 3, border: \'none\', borderRadius: 999, padding: \'4px 7px\', background: \'rgba(255,255,255,0.18)\', color: \'white\', cursor: \'pointer\', fontFamily: \'Kanit, sans-serif\', fontSize: 11.5, fontWeight: 600 }}><X size={14} /> ยกเลิก</button>';

fs.writeFileSync('src/pages/reading/components/ProNotebook.jsx', currLines.join('\n'));
