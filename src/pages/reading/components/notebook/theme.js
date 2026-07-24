// Shared design tokens and static option lists for the notebook (ProNotebook).
// Pure data — no React, no side effects — so it's cheap to import anywhere.

// HarmonyOS / Huawei Notes design tokens
export const HW = {
  accent: '#0A59F7',
  accentSoft: 'rgba(10,89,247,0.10)',
  surface: 'rgba(255,255,255,0.86)',
  blur: 'saturate(180%) blur(30px)',
  hairline: 'rgba(0,0,0,0.06)',
  text: '#181818',
  textDim: '#6B7280',
  shadow: '0 6px 24px rgba(0,0,0,0.10), 0 1px 3px rgba(0,0,0,0.06)',
  radius: 20,
};

export const ZERO_OFFSET = { x: 0, y: 0 };

// Cursor for the drawing canvas. The native `crosshair` is a thin single-colour
// line that vanishes against matching paper (users lose the pointer on white),
// so we ship an SVG crosshair with a white halo + dark core that stays visible
// on any paper colour. Hotspot is the centre (12,12); falls back to `crosshair`.
const DRAW_CURSOR_SVG =
  "<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'>" +
  "<g fill='none' stroke-linecap='round'>" +
  "<g stroke='#ffffff' stroke-width='3'>" +
  "<line x1='12' y1='2.5' x2='12' y2='9'/><line x1='12' y1='15' x2='12' y2='21.5'/>" +
  "<line x1='2.5' y1='12' x2='9' y2='12'/><line x1='15' y1='12' x2='21.5' y2='12'/></g>" +
  "<g stroke='#111827' stroke-width='1.3'>" +
  "<line x1='12' y1='2.5' x2='12' y2='9'/><line x1='12' y1='15' x2='12' y2='21.5'/>" +
  "<line x1='2.5' y1='12' x2='9' y2='12'/><line x1='15' y1='12' x2='21.5' y2='12'/></g></g>" +
  "<circle cx='12' cy='12' r='1.1' fill='#111827' stroke='#ffffff' stroke-width='0.7'/></svg>";
export const DRAW_CURSOR =
  `url("data:image/svg+xml,${encodeURIComponent(DRAW_CURSOR_SVG)}") 12 12, crosshair`;

// Default width of a text box, so alignment and lists have a column to work in.
export const TEXT_BOX_WIDTH = 340;

// Line spacing for text objects. The WYSIWYG editor and the Konva renderer must
// use the same value or the text visibly shifts the moment you stop editing.
// 1.2 (rather than Konva's default 1.0) also stops Thai tone marks and upper
// vowels from colliding with the line above.
export const LINE_HEIGHT = 1.2;

// Sticky-note palette and styles, shared by the tool options and the context menu.
export const STICKY_COLORS = ['#FEF08A', '#FBCFE8', '#BAE6FD', '#BBF7D0', '#FED7AA', '#DDD6FE', '#FECACA', '#A7F3D0'];

export const STICKY_STYLES = [
  { id: 'classic', label: 'คลาสสิก' },
  { id: 'round', label: 'โค้งมน' },
  { id: 'pin', label: 'หมุดปัก' },
  { id: 'tape', label: 'เทปกาว' },
  { id: 'polaroid', label: 'โพลารอยด์' },
  { id: 'bubble', label: 'บับเบิล' },
  { id: 'torn', label: 'ขอบฉีก' },
  { id: 'lined', label: 'มีเส้น' },
];

// Fonts offered in the text tool. Thai handwriting faces (ลายมือ) are loaded from
// Google Fonts in index.html, so the notebook feels closer to real handwriting.
export const FONT_OPTIONS = [
  { value: 'Kanit', label: 'Kanit' },
  { value: 'Prompt', label: 'Prompt' },
  { value: 'Sarabun', label: 'Sarabun' },
  { value: 'Bai Jamjuree', label: 'Bai Jamjuree' },
  { value: 'Itim', label: 'Itim · ลายมือ' },
  { value: 'Mali', label: 'Mali · ลายมือ' },
  { value: 'Sriracha', label: 'Sriracha · ลายมือ' },
  { value: 'Charm', label: 'Charm · ลายมือ' },
  { value: 'Charmonman', label: 'Charmonman · ลายมือ' },
  { value: 'Pattaya', label: 'Pattaya' },
  { value: 'Chonburi', label: 'Chonburi' },
  { value: 'serif', label: 'Serif' },
  { value: 'monospace', label: 'Monospace' },
];
