// Static configuration for the notebook toolbar and lasso. Kept out of
// ProNotebook.jsx so the tool list can be edited without scrolling past 5,000
// lines of canvas logic.

// Tools whose options popover opens with the tool.
export const TOOLS_WITH_OPTIONS = ['pen', 'fountain', 'marker', 'pencil', 'highlighter', 'shape', 'sticker', 'eraser', 'text', 'laser', 'lasso'];

// What the lasso is allowed to pick up, GoodNotes-style. Stored per kind so the
// user can grab only the handwriting out of a page full of images and notes.
export const LASSO_KINDS = [
  { key: 'lines', label: 'ลายมือ' },
  { key: 'shapes', label: 'รูปทรง/เรขาคณิต' },
  { key: 'images', label: 'รูปภาพ' },
  { key: 'texts', label: 'กล่องข้อความ' },
  { key: 'stickers', label: 'โน้ตสติกเกอร์' },
];

export const DEFAULT_LASSO_FILTER = { lines: true, shapes: true, images: true, texts: true, stickers: true };
