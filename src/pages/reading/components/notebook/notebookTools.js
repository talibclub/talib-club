import {
  PenTool, Highlighter, Eraser, Type, Square, Lasso,
  Pencil, Pointer, StickyNote, Brush, Feather,
  Ruler, Compass, Smile, Mic, Wand2, Image as ImageIcon,
  FileText, Sparkles
} from 'lucide-react';

export const PEN_TYPES = [
  { id: 'pen', icon: PenTool, title: 'ปากกาลูกลื่น', label: 'ปากกา' },
  { id: 'fountain', icon: Feather, title: 'ปากกาหมึกซึม', label: 'หมึกซึม' },
  { id: 'pencil', icon: Pencil, title: 'ดินสอ', label: 'ดินสอ' },
  { id: 'marker', icon: Brush, title: 'มาร์กเกอร์', label: 'มาร์กเกอร์' },
];

export const EXTRA_TOOLS = [
  { id: 'pdfWidget', icon: FileText, title: 'วาง PDF บนกระดาน', label: 'PDF' },
  { id: 'emoji', icon: Smile, title: 'สติกเกอร์และอิโมจิ', label: 'สติกเกอร์' },
  { id: 'ruler', icon: Ruler, title: 'ไม้บรรทัด — ลากเส้นตรง', label: 'ไม้บรรทัด' },
  { id: 'protractor', icon: Compass, title: 'ไม้โปรแทรกเตอร์ — วัดมุม', label: 'วัดมุม' },
  { id: 'laser', icon: Wand2, title: 'เลเซอร์พอยเตอร์ (เส้นจางหายเอง)', label: 'เลเซอร์' },
  { id: 'mic', icon: Mic, title: 'อัดเสียงระหว่างจด', label: 'อัดเสียง' },
];

export const TOOL_GROUPS = {
  write: [
    { id: 'penGroup', icon: PenTool, title: 'ปากกา (แตะเพื่อเลือกหัวปากกา)', label: 'ปากกา' },
    { id: 'highlighter', icon: Highlighter, title: 'ปากกาเน้นข้อความ', label: 'ไฮไลต์' },
    { id: 'eraser', icon: Eraser, title: 'ยางลบ', label: 'ลบ' },
    { id: 'text', icon: Type, title: 'พิมพ์ข้อความ', label: 'ข้อความ' },
    { id: 'sticker', icon: StickyNote, title: 'โน้ตติดกระดาษ', label: 'โน้ต' },
    { id: 'image', icon: ImageIcon, title: 'แทรกรูปภาพ', label: 'รูป' },
    { id: 'shape', icon: Square, title: 'รูปทรง เส้น ลูกศร', label: 'รูปทรง' },
    { id: 'lasso', icon: Lasso, title: 'เลือกลายมือเป็นกลุ่ม', label: 'เลือกกลุ่ม' },
    { id: 'more', icon: Sparkles, title: 'เครื่องมือเพิ่มเติม (PDF, ไม้บรรทัด, วัดมุม, เลเซอร์ ฯลฯ)', label: 'เพิ่มเติม' },
  ],
  type: [
    { id: 'text', icon: Type, title: 'พิมพ์ข้อความ', label: 'ข้อความ' },
    { id: 'sticker', icon: StickyNote, title: 'โน้ตติดกระดาษ', label: 'โน้ต' },
    { id: 'image', icon: ImageIcon, title: 'แทรกรูปภาพ', label: 'รูป' },
    { id: 'shape', icon: Square, title: 'รูปทรง เส้น ลูกศร', label: 'รูปทรง' },
    { id: 'eraser', icon: Eraser, title: 'ยางลบ', label: 'ลบ' },
    { id: 'penGroup', icon: PenTool, title: 'ปากกา (แตะเพื่อเขียนมือ)', label: 'ปากกา' },
    { id: 'more', icon: Sparkles, title: 'เครื่องมือเพิ่มเติม', label: 'เพิ่มเติม' },
  ],
};

export const WRITE_MODES = {
  type:  { id: 'type',  label: 'พิมพ์',  defaultTool: 'text', showInk: false },
  write: { id: 'write', label: 'เขียน', defaultTool: 'pen',  showInk: true },
};

export const WRITE_MODE_KEY = 'talib_notebook_mode';

export function readWriteMode() {
  try {
    const stored = localStorage.getItem(WRITE_MODE_KEY);
    return WRITE_MODES[stored] ? stored : 'write';
  } catch {
    return 'write';
  }
}

export const ACTION_TOOLS = ['image', 'mic', 'emoji', 'ruler', 'protractor', 'more'];
