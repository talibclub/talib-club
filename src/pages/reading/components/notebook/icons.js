import * as LucideIcons from 'lucide-react';

export const ALL_ICONS = Object.keys(LucideIcons).filter(key => 
  /^[A-Z]/.test(key) && key !== 'Lucide' && key !== 'Icon' && typeof LucideIcons[key] === 'object'
).reduce((acc, key) => {
  acc[key] = LucideIcons[key];
  return acc;
}, {});

export const DEFAULT_ICONS = [
  'Star', 'Heart', 'CheckCircle2', 'AlertCircle', 'Info', 'HelpCircle', 'Flag', 'Zap', 
  'ThumbsUp', 'ThumbsDown', 'ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 
  'Lightbulb', 'Clock', 'Check', 'Target', 'Trophy', 'Flame'
];
