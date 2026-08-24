import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "../lib/firebase.js";

// Gzip via CompressionStream is unavailable on Safari < 16.4 (the very iPads the
// notebook targets). Feature-detect and fall back to plain JSON — the download
// side sniffs the gzip magic bytes, so both formats live under the same path.
const canGzip = typeof CompressionStream !== "undefined";
const canGunzip = typeof DecompressionStream !== "undefined";

// Helper to compress JSON string to gzip Blob
async function compressString(str) {
  const stream = new Blob([str], { type: 'application/json' }).stream();
  const compressedStream = stream.pipeThrough(new CompressionStream("gzip"));
  return new Response(compressedStream).blob();
}

// Helper to decompress gzip Blob to JSON string
async function decompressBlob(blob) {
  const ds = new DecompressionStream("gzip");
  const decompressedStream = blob.stream().pipeThrough(ds);
  return new Response(decompressedStream).text();
}

async function isGzipBlob(blob) {
  const head = new Uint8Array(await blob.slice(0, 2).arrayBuffer());
  return head.length === 2 && head[0] === 0x1f && head[1] === 0x8b;
}

/**
 * Uploads notebook data to Firebase Storage (gzip when supported, plain JSON otherwise).
 */
export async function uploadNotebookData(uid, notebookId, dataObj) {
  try {
    const jsonStr = JSON.stringify(dataObj);
    const body = canGzip
      ? await compressString(jsonStr)
      : new Blob([jsonStr], { type: "application/json" });
    const storageRef = ref(storage, `notebooks/${uid}/${notebookId}.json.gz`);

    await uploadBytes(storageRef, body, {
      contentType: canGzip ? "application/gzip" : "application/json",
    });

    // Return the download URL
    return await getDownloadURL(storageRef);
  } catch (err) {
    console.error("Failed to upload notebook", err);
    throw err;
  }
}

/**
 * Downloads and decompresses notebook data from Firebase Storage.
 * onProgress (optional) receives a 0..1 fraction while the file body streams in.
 *
 * Contract (this distinction is what protects against data loss):
 *   - returns null  ONLY when the file genuinely doesn't exist (a new notebook)
 *   - THROWS on every other failure (network, permission, decompress, parse) so
 *     the caller knows the cloud copy may still exist and must not overwrite it.
 */
export async function downloadNotebookData(uid, notebookId, onProgress) {
  const storageRef = ref(storage, `notebooks/${uid}/${notebookId}.json.gz`);
  let url;
  try {
    url = await getDownloadURL(storageRef);
  } catch (err) {
    if (err?.code === "storage/object-not-found") return null; // new notebook
    throw err;
  }

  const response = await fetch(url);
  if (!response.ok) throw new Error(`Notebook fetch failed: ${response.status}`);

  let blob;
  const total = Number(response.headers.get("content-length")) || 0;
  if (onProgress && response.body && total > 0) {
    const reader = response.body.getReader();
    const chunks = [];
    let received = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      received += value.length;
      onProgress(Math.min(1, received / total));
    }
    blob = new Blob(chunks);
  } else {
    blob = await response.blob();
  }

  let jsonStr;
  if (await isGzipBlob(blob)) {
    if (!canGunzip) {
      throw new Error("เบราว์เซอร์นี้เปิดสมุดโน้ตแบบบีบอัดไม่ได้ กรุณาอัปเดต iOS/เบราว์เซอร์เป็นเวอร์ชันล่าสุด");
    }
    jsonStr = await decompressBlob(blob);
  } else {
    jsonStr = await blob.text();
  }
  return JSON.parse(jsonStr);
}

/**
 * Deletes notebook file from Firebase Storage.
 */
export async function deleteNotebookData(uid, notebookId) {
  if (!uid || !notebookId) return;
  try {
    const storageRef = ref(storage, `notebooks/${uid}/${notebookId}.json.gz`);
    await deleteObject(storageRef);
  } catch (err) {
    if (err?.code === "storage/object-not-found") return; // already removed
    console.warn("Failed to delete notebook file from storage", err);
  }
}

