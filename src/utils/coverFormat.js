export const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export function detectCoverFormat(bytes, type = '') {
  const head = new TextDecoder('latin1').decode(bytes.slice(0, 1024));
  if (head.includes('%PDF-')) return 'pdf';
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'image';
  if (bytes[0] === 0x89 && head.slice(1, 4) === 'PNG') return 'image';
  if (head.startsWith('RIFF') && head.slice(8, 12) === 'WEBP') return 'image';
  if (head.startsWith('PK\x03\x04')) return 'epub'; // package is validated before use
  if (type.split(';')[0] === 'application/pdf') return 'pdf';
  return null;
}

export function isAnyFlipUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && ['anyflip.com', 'www.anyflip.com', 'online.anyflip.com'].includes(url.hostname);
  } catch { return false; }
}
