// Typing-first formatting: "/" opens a small menu of the things the toolbar can
// do, filtered as you keep typing.
//
// The point is not to duplicate the toolbar. It is that someone writing prose
// never has to leave the keyboard or hunt for an icon — which is the whole
// difference between a notebook you write in and one you operate.

// Where a slash token starts, and what has been typed after it.
//
// Only fires at the start of a line or after a space, so a date like 12/05 or a
// path never opens the menu. A space inside the query closes it: real commands
// here are single words, and "และ/หรือ ที่บ้าน" should stay text.
export function matchSlashCommand(textBeforeCaret) {
  if (typeof textBeforeCaret !== 'string') return null;
  const at = textBeforeCaret.lastIndexOf('/');
  if (at === -1) return null;
  const before = at === 0 ? '' : textBeforeCaret[at - 1];
  if (before && !/\s/.test(before)) return null;
  const query = textBeforeCaret.slice(at + 1);
  if (/\s/.test(query)) return null;
  return { start: at, query };
}

// id is what the editor acts on; keywords carry the Thai and English ways
// someone might reach for the same thing.
export const SLASH_COMMANDS = [
  { id: 'h1',        icon: 'Heading1',   label: 'หัวข้อใหญ่',    hint: '# ',  keywords: ['หัวข้อ', 'h1', 'heading', 'title', 'ห'] },
  { id: 'h2',        icon: 'Heading2',   label: 'หัวข้อรอง',     hint: '## ', keywords: ['หัวข้อรอง', 'h2', 'heading', 'sub'] },
  { id: 'bullet',    icon: 'List',       label: 'รายการจุด',     hint: '- ',  keywords: ['รายการ', 'จุด', 'bullet', 'list', 'ul'] },
  { id: 'number',    icon: 'ListOrdered',label: 'รายการเลข',     hint: '1. ', keywords: ['เลข', 'ลำดับ', 'number', 'ordered', 'ol'] },
  { id: 'bold',      icon: 'Bold',       label: 'ตัวหนา',        hint: '**',  keywords: ['หนา', 'bold', 'เข้ม'] },
  { id: 'italic',    icon: 'Italic',     label: 'ตัวเอียง',      hint: '*',   keywords: ['เอียง', 'italic'] },
  { id: 'underline', icon: 'Underline',  label: 'ขีดเส้นใต้',    hint: '',    keywords: ['ขีด', 'เส้นใต้', 'underline'] },
  { id: 'strike',    icon: 'Strikethrough', label: 'ขีดฆ่า',     hint: '',    keywords: ['ขีดฆ่า', 'strike', 'ฆ่า'] },
  { id: 'left',      icon: 'AlignLeft',  label: 'ชิดซ้าย',       hint: '',    keywords: ['ซ้าย', 'left', 'align'] },
  { id: 'center',    icon: 'AlignCenter',label: 'กึ่งกลาง',      hint: '',    keywords: ['กลาง', 'center', 'align'] },
  { id: 'right',     icon: 'AlignRight', label: 'ชิดขวา',        hint: '',    keywords: ['ขวา', 'right', 'align'] },
  { id: 'normal',    icon: 'RemoveFormatting', label: 'ล้างรูปแบบ', hint: '', keywords: ['ล้าง', 'ปกติ', 'clear', 'normal', 'reset'] },
];

// Empty query lists everything, in the order above — the common things first,
// so the menu is useful before anyone learns a single keyword.
export function filterSlashCommands(query) {
  const q = (query || '').trim().toLowerCase();
  if (!q) return SLASH_COMMANDS;
  return SLASH_COMMANDS.filter((c) =>
    c.label.toLowerCase().includes(q) || c.keywords.some((k) => k.toLowerCase().includes(q))
  );
}
