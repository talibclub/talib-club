import { PenTool, Highlighter, Eraser, Type, Square, Lasso, Pencil, Pointer, StickyNote, Brush, Feather, Ruler, Compass, Smile, Mic, Wand2, Image as ImageIcon, FileText } from 'lucide-react';

// The notebook's tools, grouped.
//
// They used to be one flat, horizontally scrolling strip in this order:
// pan, pen, fountain, pencil, marker, highlighter, eraser, lasso, ruler,
// protractor, TEXT, shape, image, sticker, emoji, laser, mic.
//
// "ข้อความ" was the eleventh item. Anyone who types rather than draws had to
// scroll past ten pens to reach the one tool they use, every single time. The
// groups below let the capsule show a short, relevant row and keep the rest one
// tap away — see WRITE_MODES.
export const TOOL_GROUPS = {
  // Always visible, whichever mode you are in.
  core: [
    { id: 'text', icon: Type, title: 'พิมพ์ข้อความ', label: 'ข้อความ' },
    { id: 'sticker', icon: StickyNote, title: 'โน้ตติดกระดาษ', label: 'โน้ต' },
    { id: 'image', icon: ImageIcon, title: 'แทรกรูปภาพ', label: 'รูป' },
    { id: 'pdfWidget', icon: FileText, title: 'วาง PDF บนกระดาน', label: 'PDF' },
    { id: 'shape', icon: Square, title: 'รูปทรง เส้น ลูกศร', label: 'รูปทรง' },
    { id: 'eraser', icon: Eraser, title: 'ยางลบ', label: 'ลบ' },
  ],
  // The pens. Hidden in typing mode behind "เครื่องมือเขียน".
  ink: [
    { id: 'pen', icon: PenTool, title: 'ปากกาลูกลื่น', label: 'ปากกา' },
    { id: 'fountain', icon: Feather, title: 'ปากกาหมึกซึม', label: 'หมึกซึม' },
    { id: 'pencil', icon: Pencil, title: 'ดินสอ', label: 'ดินสอ' },
    { id: 'marker', icon: Brush, title: 'มาร์กเกอร์', label: 'มาร์กเกอร์' },
    { id: 'highlighter', icon: Highlighter, title: 'ปากกาเน้นข้อความ', label: 'ไฮไลต์' },
    { id: 'lasso', icon: Lasso, title: 'เลือกลายมือเป็นกลุ่ม', label: 'เลือกกลุ่ม' },
    { id: 'ruler', icon: Ruler, title: 'ไม้บรรทัด — ลากเส้นตรง', label: 'ไม้บรรทัด' },
    { id: 'protractor', icon: Compass, title: 'ไม้โปรแทรกเตอร์ — วัดมุม', label: 'วัดมุม' },
  ],
  // Occasional extras, never in the main row.
  extras: [
    { id: 'emoji', icon: Smile, title: 'อิโมจิและสติกเกอร์', label: 'สติกเกอร์' },
    { id: 'laser', icon: Wand2, title: 'เลเซอร์พอยเตอร์ (เส้นจางหายเอง)', label: 'เลเซอร์' },
    { id: 'mic', icon: Mic, title: 'อัดเสียงระหว่างจด', label: 'อัดเสียง' },
  ],
};

// Two ways of working, remembered per person. `type` opens on the text tool and
// keeps the pens folded away; `write` is the original pen-first layout.
export const WRITE_MODES = {
  type:  { id: 'type',  label: 'พิมพ์',  defaultTool: 'text', showInk: false },
  write: { id: 'write', label: 'เขียน', defaultTool: 'pen',  showInk: true },
};

export const WRITE_MODE_KEY = 'talib_notebook_mode';

export function readWriteMode() {
  try {
    const stored = localStorage.getItem(WRITE_MODE_KEY);
    return WRITE_MODES[stored] ? stored : 'type';
  } catch {
    return 'type';
  }
}

// Tools that are actions rather than modes — they fire and hand control back.
export const ACTION_TOOLS = ['image', 'mic', 'emoji', 'ruler', 'protractor'];
