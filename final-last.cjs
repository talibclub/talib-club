const fs = require('fs');
let code = fs.readFileSync('src/pages/reading/components/ProNotebook.jsx', 'utf8');
const lines = code.split('\n');

const fixes = {
  494: '      toast.success(\'เพิ่มไอคอนแล้ว\', { id: \'icon-add\' });',
  867: '      toast.success(\'อัปโหลดเสียงเสร็จสิ้น!\', { id: `upload-${stickerId}`, icon: \'🎤\' });',
  880: '      toast(\'กำลังอัดเสียง... (กดอีกครั้งเพื่อหยุด)\', { icon: \'🎙️\', duration: 4000 });',
  883: '      toast.error(\'ไม่สามารถเข้าถึงไมโครโฟนได้\');',
  909: '      toast.success(\'ล้างเส้นทั้งหมดแล้ว\');',
  937: '      toast.success(\'ลบหน้ากระดาษเรียบร้อย\');',
  960: '      toast.success(pages[currentPageIndex]?.isBookmarked ? "ปลดบุ๊กมาร์กแล้ว" : "บุ๊กมาร์กหน้านี้แล้ว");',
  1042: '      toast(\'ตรวจพบปากกาสไตลัส: ปิดการเขียนด้วยนิ้วแล้ว ใช้นิ้วเลื่อน/ซูมหน้าได้เลย\', { icon: \'🖊️\', duration: 5000 });',
  1101: '    // scribbles, so a finger must always be allowed to drop a text box / sticker —',
  1517: '      toast(\'ลากจากวัตถุหนึ่งไปยังอีกวัตถุเพื่อเชื่อม\', { icon: \'🔗\' });',
  3216: '      // that start past the bottom is not enough on its own —'
};

for (let key in fixes) {
  lines[key] = fixes[key];
}

fs.writeFileSync('src/pages/reading/components/ProNotebook.jsx', lines.join('\n'));
