export function getCoverUrl(url) {
  const value = String(url || '').trim();
  const match = value.match(/\/file\/d\/([a-zA-Z0-9_-]+)\//);
  return match ? `https://drive.google.com/thumbnail?id=${match[1]}&sz=w800` : value;
}

// A stored URL may be dead: use the same browser image loading as the library.
export function hasUsableCover(url) {
  const src = getCoverUrl(url);
  if (!src) return Promise.resolve(false);
  return new Promise(resolve => {
    const image = new Image();
    const finish = result => {
      clearTimeout(timeout);
      image.onload = image.onerror = null;
      image.src = '';
      resolve(result);
    };
    const timeout = setTimeout(() => finish(false), 10000);
    image.onload = () => finish(image.naturalWidth > 1 && image.naturalHeight > 1);
    image.onerror = () => finish(false);
    image.src = src;
  });
}
