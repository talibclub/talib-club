// Opens an image search in a real, floating browser window beside the notebook.
//
// Why a popup and not an in-app panel: Google and DuckDuckGo both send
// `X-Frame-Options: SAMEORIGIN`, so neither can be embedded in an iframe on this
// site — checked against the live responses, not assumed. A popup is a genuine
// browser window, which is what "เบราว์เซอร์ลอย" actually needs to be.
//
// Dragging an image from that window onto the page already works: the notebook's
// drop handler reads text/html, text/uri-list and plain URLs out of the
// dataTransfer, which is exactly what a browser puts there when you drag an
// image between windows.

export const IMAGE_ENGINES = {
  google: {
    label: 'Google',
    url: (q) => `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(q)}`,
  },
  bing: {
    label: 'Bing',
    url: (q) => `https://www.bing.com/images/search?q=${encodeURIComponent(q)}`,
  },
};

// Park it on the right of the screen so the notebook stays visible on the left —
// you cannot drag between two windows if one is covering the other.
export function openImageSearchWindow(query, engine = 'google') {
  const engineDef = IMAGE_ENGINES[engine] || IMAGE_ENGINES.google;
  const url = engineDef.url(query || 'สติกเกอร์');

  const width = Math.min(560, Math.round(window.screen.availWidth * 0.42));
  const height = Math.round(window.screen.availHeight * 0.86);
  const left = Math.max(0, window.screen.availWidth - width - 24);
  const top = 40;

  const win = window.open(
    url,
    'talib-image-search',
    `popup=yes,width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
  );
  // Popup blocked: hand back null so the caller can say so rather than leaving
  // the user tapping a button that appears to do nothing.
  if (win) win.focus();
  return win;
}
