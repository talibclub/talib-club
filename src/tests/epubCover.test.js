import { expect, it } from 'vitest';
import { zipSync, strToU8 } from 'fflate';
import { extractEpubCover } from '../utils/epubCover.js';
const cover = new Uint8Array([0xff, 0xd8, 0xff, 1]);
function epub(manifest, extra = {}, metadata = '') {
  return zipSync({
    'META-INF/container.xml': strToU8('<container xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="OPS/book.opf"/></rootfiles></container>'),
    'OPS/book.opf': strToU8(`<package xmlns="http://www.idpf.org/2007/opf"><metadata>${metadata}</metadata><manifest>${manifest}</manifest></package>`),
    'OPS/images/cover.jpg': cover, ...extra,
  });
}
it('extracts EPUB 3 cover-image without expanding unrelated assets', async () => {
  const bytes = epub('<item id="c" properties="cover-image" href="images/cover.jpg" media-type="image/jpeg"/>');
  expect(new Uint8Array(await extractEpubCover(bytes).arrayBuffer())).toEqual(cover);
});
it('extracts EPUB 2 cover metadata', async () => {
  const bytes = epub('<item id="legacy" href="images/cover.jpg"/>', {}, '<meta name="cover" content="legacy"/>');
  expect(new Uint8Array(await extractEpubCover(bytes).arrayBuffer())).toEqual(cover);
});
it('resolves an image relative to the EPUB cover page', async () => {
  const bytes = epub('<item id="c" properties="cover-image" href="pages/cover.xhtml"/>', {
    'OPS/pages/cover.xhtml': strToU8('<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd"><html xmlns="http://www.w3.org/1999/xhtml"><body><img src="../images/cover.jpg"/></body></html>'),
  });
  expect(new Uint8Array(await extractEpubCover(bytes).arrayBuffer())).toEqual(cover);
});
it('rejects archives without a declared cover or with a remote cover', () => {
  expect(() => extractEpubCover(epub(''))).toThrow('ไม่มีรูปปก');
  expect(() => extractEpubCover(epub('<item properties="cover-image" href="https://example.com/cover.jpg"/>'))).toThrow('ภายในไฟล์');
});
it('rejects non-EPUB ZIP files and XML external entities', () => {
  expect(() => extractEpubCover(zipSync({ 'word/document.xml': strToU8('doc') }))).toThrow();
  expect(() => extractEpubCover(epub('', { 'META-INF/container.xml': strToU8('<!DOCTYPE x [<!ENTITY e SYSTEM "file:///etc/passwd">]><x/>') }))).toThrow('XML');
});
