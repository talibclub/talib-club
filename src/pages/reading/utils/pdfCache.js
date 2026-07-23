import * as pdfjsLib from 'pdfjs-dist';

// Shared PDF cache for the reading room.
//
// The book's PDF is opened from two places — importing every page as a
// background (ProNotebook.startLoadingPDF) and the "snip from book" modal
// (BookSnipModal) — and each used to re-download the whole file through
// /api/proxy-pdf on every open. Here we fetch the bytes once per resolved URL
// and hand every caller its own copy, so reopening the snip modal or re-running
// the import no longer hits the network again.

// resolvedUrl -> Promise<Uint8Array>
const bytesCache = new Map();

// Google Drive "/view" links aren't direct downloads; rewrite them and route
// everything through our proxy so pdf.js can fetch cross-origin files.
export function resolvePdfUrl(url) {
  let u = url;
  if (u.includes('drive.google.com') && u.includes('/view')) {
    const m = u.match(/\/d\/(.*?)\//);
    if (m && m[1]) u = `https://drive.google.com/uc?export=download&id=${m[1]}`;
  }
  return `/api/proxy-pdf?url=${encodeURIComponent(u)}`;
}

// Fetch (and cache) the raw PDF bytes for a book file URL. Failures are not
// cached, so a transient network error can be retried by opening again.
export function getBookPdfBytes(fileUrl) {
  const proxyUrl = resolvePdfUrl(fileUrl);
  if (!bytesCache.has(proxyUrl)) {
    const p = fetch(proxyUrl)
      .then((r) => {
        if (!r.ok) throw new Error(`PDF fetch failed: ${r.status}`);
        return r.arrayBuffer();
      })
      .then((buf) => new Uint8Array(buf))
      .catch((err) => { bytesCache.delete(proxyUrl); throw err; });
    bytesCache.set(proxyUrl, p);
  }
  return bytesCache.get(proxyUrl);
}

// Open a pdf.js document from the cached bytes. Each call gets a fresh copy
// (bytes.slice()) because pdf.js detaches the buffer it is handed; the cached
// master stays intact for the next caller.
export async function loadBookPdf(fileUrl) {
  const bytes = await getBookPdfBytes(fileUrl);
  return pdfjsLib.getDocument({ data: bytes.slice() }).promise;
}
