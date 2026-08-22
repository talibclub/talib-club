const fs = require('fs');
let code = fs.readFileSync('src/pages/reading/components/ProNotebook.jsx', 'utf8');
const lines = code.split('\n');

const fixes = {
  1627: '        if (shp.points.length / 2 <= 3) { toast(\'วาดเส้นเล็กเกินไป จะถูกลบ\'); return; }',
  1678: '          toast.success(\'วางแล้ว\');',
  1797: '    toast.success(name ? `สร้างหน้า "${name}" แล้ว` : \'สร้างหน้าใหม่แล้ว\');',
  1820: '      toast.success(\'ทำซ้ำแล้ว\');',
  1877: '      toast.loading(\'กำลังอัปโหลดไฟล์ PDF...\', { id: \'pdf-widget\' });',
  1914: '        toast.success(\'แทรก PDF สำเร็จ\', { id: \'pdf-widget\' });',
  1917: '        toast.error(\'อัปโหลด PDF ล้มเหลว\', { id: \'pdf-widget\' });',
  1926: '      toast.loading(`กำลังโหลดหน้า ${newPage}...`, { id: \'pdf-page\' });',
  1946: '        toast.success(`เปลี่ยนเป็นหน้า ${newPage} แล้ว`, { id: \'pdf-page\' });',
  1949: '        toast.error(\'โหลดหน้าไม่สำเร็จ\', { id: \'pdf-page\' });',
  2432: '      <span style={{ fontSize: 13, fontWeight: 600 }}>ย่อหน้าต่าง</span>',
  2477: '      <button onClick={() => setShowMinimap(!showMinimap)} title="แผนที่ย่อ" aria-label="แผนที่ย่อ" style={{ position: \'absolute\', right: 15, bottom: 20, width: 44, height: 44, borderRadius: \'50%\', background: \'white\', border: \'1px solid #E5E7EB\', boxShadow: \'0 2px 8px rgba(0,0,0,0.08)\', cursor: \'pointer\', display: \'flex\', alignItems: \'center\', justifyContent: \'center\', color: HW.textDim, zIndex: 10 }}>',
  2481: '        <Map size={20} strokeWidth={2.2} />',
  2488: '          <button onPointerDown={(event) => event.stopPropagation()} onClick={() => setShowMinimap(false)} title="ปิดแผนที่" aria-label="ปิดแผนที่" style={{ position: \'absolute\', right: 5, top: 5, width: 22, height: 22, padding: 0, border: \'none\', borderRadius: 7, background: \'rgba(255,255,255,0.85)\', color: HW.textDim, cursor: \'pointer\', display: \'flex\', alignItems: \'center\', justifyContent: \'center\' }}><X size={14} /></button>',
  2511: '                    title={`ไปหน้า ${b.index + 1}`}',
  2548: '          <span style={{ fontSize: 12.5, color: \'#92400E\', lineHeight: 1.4 }}>หน้า PDF ของหนังสือ <b>เขียนทับตรงๆ ไม่ได้</b> — ต้องดึงเข้ามาในโน้ตก่อน</span>'
};

for (let key in fixes) {
  lines[key] = fixes[key];
}

fs.writeFileSync('src/pages/reading/components/ProNotebook.jsx', lines.join('\n'));
