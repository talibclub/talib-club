// Pure, state-free helpers pulled out of ProNotebook.jsx: image handling, id
// generation and the cover palette. Nothing here touches React or the canvas,
// so it can be read, changed and tested on its own.

// Every notebook used to be written with coverColor: 'red' on every save, so the
// gallery was a wall of identical red covers. Derived from the notebook id so it
// is stable across sessions and devices without needing to be read back.
export const NOTEBOOK_COVERS = ['red', 'teal', 'indigo', 'amber', 'plum', 'forest'];

export function pickCoverColor(notebookId) {
  const key = String(notebookId || '');
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (Math.imul(h, 31) + key.charCodeAt(i)) >>> 0;
  return NOTEBOOK_COVERS[h % NOTEBOOK_COVERS.length];
}

// Strokes were rendered with key={index}. Erasing one in the middle of a page
// shifted every later index, so React re-created the whole list instead of
// removing one node. Images inserted in the same millisecond used to collide the
// same way, which made selection and delete hit the wrong picture.
let strokeIdSeq = 0;
export const nextStrokeId = () => `s-${Date.now().toString(36)}-${++strokeIdSeq}`;

let imageIdSeq = 0;
export const nextImageId = () => `img-${Date.now()}-${++imageIdSeq}`;

// Photos off a phone are 3-8 MB, and base64 makes a copy about a third bigger
// again. Every picture is stored inline in the page JSON, so two or three of
// them made the notebook slow to upload and blew straight past the localStorage
// backup quota — the fallback that is supposed to save the work when the cloud
// save fails. Downscale and re-encode before an image ever enters a page.
const MAX_IMAGE_DIM = 1600;
const IMAGE_PASSTHROUGH_BYTES = 700 * 1024;

export const readFileAsDataUrl = (file) => new Promise((resolve, reject) => {
  const fr = new FileReader();
  fr.onload = () => resolve(fr.result);
  fr.onerror = reject;
  fr.readAsDataURL(file);
});

export async function compressImageFile(file) {
  const original = await readFileAsDataUrl(file);
  // A GIF would lose its animation and an SVG is already small and lossless.
  if (/^image\/(gif|svg\+xml)$/.test(file.type || '')) return original;
  try {
    const img = await new Promise((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = reject;
      el.src = original;
    });
    const scale = Math.min(1, MAX_IMAGE_DIM / Math.max(img.width, img.height));
    if (scale === 1 && original.length < IMAGE_PASSTHROUGH_BYTES) return original;
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(img.width * scale));
    canvas.height = Math.max(1, Math.round(img.height * scale));
    canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
    // webp keeps transparency; a PNG screenshot re-encoded as JPEG would come
    // back with a black background.
    let out = canvas.toDataURL('image/webp', 0.85);
    if (!out.startsWith('data:image/webp')) out = canvas.toDataURL('image/jpeg', 0.85);
    return out.length < original.length ? out : original;
  } catch (err) {
    console.warn('Image compression failed, inserting the original', err);
    return original;
  }
}

// Hand a data URL to the browser as a download. Lived in ProNotebook, but it
// touches nothing in the component.
export const downloadDataUrl = (dataUrl, filename) => {
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Resolves once the image is decoded, or once it fails — an export should not
// hang on one broken picture.
export const preloadImage = (src) => new Promise((resolve) => {
  if (!src) return resolve();
  const img = new window.Image();
  img.onload = resolve;
  img.onerror = resolve;
  img.src = src;
});
