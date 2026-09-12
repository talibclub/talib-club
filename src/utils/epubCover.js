import { unzipSync } from 'fflate';
import { DOMParser } from '@xmldom/xmldom';

const LIMIT = 16 * 1024 * 1024;
function xml(bytes) {
  if (!bytes || bytes.length > 1024 * 1024) throw new Error('ข้อมูล EPUB ไม่ครบหรือใหญ่เกินไป');
  let text = new TextDecoder().decode(bytes);
  if (/<!ENTITY|<!DOCTYPE[^>]*\[/i.test(text)) throw new Error('EPUB มี XML ที่ไม่รองรับ');
  // EPUB 2 cover pages often declare the standard XHTML DTD. It is not
  // needed to locate the image; remove it without resolving external URLs.
  text = text.replace(/<!DOCTYPE[^>]*>/gi, '');
  return new DOMParser({ onError: (level, message) => { if (level !== 'warning') throw new Error(message); } }).parseFromString(text, 'application/xml');
}
const elements = (document, name) => Array.from(document.getElementsByTagNameNS('*', name));
function entry(bytes, path) {
  const files = unzipSync(bytes, { filter: file => {
    if (file.name !== path) return false;
    if (file.originalSize > LIMIT) throw new Error('รูปปก EPUB ใหญ่เกินไป');
    return true;
  } });
  return files[path];
}
function resolveEntry(href, base) {
  const url = new URL(href, `https://epub.invalid/${base}`);
  if (url.origin !== 'https://epub.invalid') throw new Error('ปก EPUB ต้องอยู่ภายในไฟล์');
  return decodeURIComponent(url.pathname.slice(1));
}
export function extractEpubCover(bytes) {
  if (bytes.length > 32 * 1024 * 1024) throw new Error('EPUB ต้องมีขนาดไม่เกิน 32 MB สำหรับสร้างปก');
  const container = xml(entry(bytes, 'META-INF/container.xml'));
  const packagePath = elements(container, 'rootfile')[0]?.getAttribute('full-path');
  if (!packagePath) throw new Error('ไม่พบรายการไฟล์ EPUB');
  const opf = xml(entry(bytes, packagePath));
  const items = elements(opf, 'item');
  const coverId = elements(opf, 'meta').find(meta => meta.getAttribute('name') === 'cover')?.getAttribute('content');
  let cover = items.find(item => (item.getAttribute('properties') || '').split(/\s+/).includes('cover-image'))
    || items.find(item => coverId && item.getAttribute('id') === coverId);
  let href = cover?.getAttribute('href');
  let base = packagePath;
  if (!href) {
    const guide = elements(opf, 'reference').find(item => item.getAttribute('type') === 'cover');
    href = guide?.getAttribute('href');
  }
  if (!href) throw new Error('EPUB นี้ไม่มีรูปปกที่ระบุไว้ กรุณาอัปโหลดรูปปกเอง');
  let path = resolveEntry(href, base);
  if (/\.(xhtml|html|svg)$/i.test(path)) {
    const page = xml(entry(bytes, path));
    const image = elements(page, 'img')[0] || elements(page, 'image')[0];
    href = image?.getAttribute('src') || image?.getAttribute('href') || image?.getAttribute('xlink:href');
    if (!href) throw new Error('ไม่พบรูปภาพในหน้าปก EPUB');
    path = resolveEntry(href, path);
  }
  const data = entry(bytes, path);
  if (!data) throw new Error('ไม่พบไฟล์รูปปกใน EPUB หรือไฟล์ถูกเข้ารหัส');
  return new Blob([data]);
}
