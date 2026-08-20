import { useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { auth } from '../../../../lib/firebase.js';
import { nextImageId } from './notebookAssets.js';

// Searching the open web for pictures, and dropping one onto a page.
//
// Several open, CORS-friendly sources are queried at once so a query like
// "ซัยยิด กุฏุบ" returns real photographs without leaving the app: Thai and
// English Wikipedia give the lead image of matching articles, Wikimedia Commons
// adds broader media, and Openverse covers stickers and clip-art. None of them
// needs an API key, and their thumbnails allow cross-origin reads, so a picture
// can be turned into a data URL and stored exactly like an uploaded one.
//
// Split out of ProNotebook. It reaches back into the notebook only through the
// three writers it is handed.
export function useWebImageSearch({ currentPageIndex, updatePage, pushHistory }) {
  const [showImgSearch, setShowImgSearch] = useState(false);
  const [imgQuery, setImgQuery] = useState("");
  const [imgResults, setImgResults] = useState([]);
  const [imgLoading, setImgLoading] = useState(false);
  const imgSearchRunRef = useRef(0);
  // Kind of picture wanted: '' (anything), photo, clipart, transparent, gif.
  // Only the DuckDuckGo proxy understands these, so a filtered search queries it
  // alone rather than padding the grid with unfiltered results from elsewhere.
  const [imgFilter, setImgFilter] = useState('');

  // Search several open, CORS-friendly image sources at once so a query like
  // "ซัยยิด กุฏุบ" returns real photos without leaving the app. Thai + English
  // Wikipedia surface the lead photo of matching articles (people, places, books),
  // Wikimedia Commons adds broader media, and Openverse covers stickers/clip-art.
  const searchWebImages = async (q, filter = imgFilter) => {
     if (!q.trim()) return;
     // Six sources are raced per search and each one pushes into the shared
     // results as it lands. Without a run id, a slow source from the previous
     // query kept appending to — and then overwriting — the results of the
     // query after it.
     const runId = ++imgSearchRunRef.current;
     const isStale = () => runId !== imgSearchRunRef.current;
     setImgLoading(true);
     setImgResults([]);
     const merged = [];
     const seen = new Set();
     const add = (r) => { if (r?.thumbnail && !seen.has(r.thumbnail)) { seen.add(r.thumbnail); merged.push(r); } };

     // Pasting a direct image link should just work instead of being searched for.
     if (/^https?:\/\/\S+\.(png|jpe?g|gif|webp|svg)(\?\S*)?$/i.test(q.trim())) {
        if (!isStale()) {
           setImgResults([{ id: 'pasted', title: 'ลิงก์ที่วาง', thumbnail: q.trim(), url: q.trim(), source: 'ลิงก์', license: 'ตรวจสอบเอง' }]);
           setImgLoading(false);
        }
        return;
     }

     // Real Google image results via our server-side proxy. Only returns data when
     // GOOGLE_CSE_KEY / GOOGLE_CSE_CX are set in the deployment; otherwise it 503s
     // and we fall through to the keyless sources below — no error shown.
     const google = (async () => {
        try {
           // Fallback for local development using Vite variables if available.
           //
           // The two env reads MUST stay inside the `import.meta.env.DEV` block.
           // When they sat outside it, Vite inlined the key as a plain string and
           // Rollup kept that const alive even though the branch was dead — so the
           // Google CSE key shipped inside dist/assets/ProNotebook-*.js and anyone
           // could lift it out of the deployed bundle and burn the quota. Inside
           // the guard, `DEV` becomes `false` at build time and the whole block
           // (key included) is eliminated from the production output.
           if (import.meta.env.DEV && import.meta.env.VITE_GOOGLE_CSE_KEY && import.meta.env.VITE_GOOGLE_CSE_CX) {
              const localKey = import.meta.env.VITE_GOOGLE_CSE_KEY;
              const localCx = import.meta.env.VITE_GOOGLE_CSE_CX;
              const start = 1;
              const api = new URL('https://www.googleapis.com/customsearch/v1');
              api.searchParams.set('key', localKey);
              api.searchParams.set('cx', localCx);
              api.searchParams.set('q', q);
              api.searchParams.set('searchType', 'image');
              api.searchParams.set('num', '10');
              api.searchParams.set('start', String(start));
              api.searchParams.set('safe', 'active');
              
              const gRes = await fetch(api.toString());
              if (!gRes.ok) {
                 const errText = await gRes.text();
                 console.error("Google API Local Error:", errText);
                 return;
              }
              const data = await gRes.json();
              (data.items || []).forEach((it, i) => add({
                 id: `g-local-${start + i}`,
                 title: it.title,
                 thumbnail: it.image?.thumbnailLink || it.link,
                 url: it.link,
                 width: it.image?.width,
                 height: it.image?.height,
                 source: 'Google',
                 license: 'เว็บ',
                 context: it.image?.contextLink,
              }));
              return;
           }

           const params = new URLSearchParams({ q });
           if (filter) params.set('type', filter);
           const idToken = await auth.currentUser?.getIdToken();
           const res = await fetch(`/api/image-search?${params}`, idToken ? { headers: { Authorization: `Bearer ${idToken}` } } : undefined);
           if (!res.ok) {
              const errText = await res.text().catch(() => '');
              console.error('Image search proxy error:', res.status, errText);
              return;
           }
           const data = await res.json();
           (data.results || []).forEach(add);
        } catch (e) { console.error(e) }
     })();

     // Which Wikipedia is worth asking. A Thai query on en.wikipedia matches
     // English articles that merely contain the Thai string — searching "ดาว"
     // returned "Yam khai dao" and three Thai actors, which is exactly the junk
     // that showed up in the picker. Ask the wiki whose language the query is
     // actually in.
     const hasThai = /[฀-๿]/.test(q);
     const hasLatin = /[a-zA-Z]/.test(q);
     const wikiLangs = hasThai ? ['th'] : hasLatin ? ['en'] : ['th', 'en'];

     const wikiArticles = (lang) => (async () => {
        try {
           const res = await fetch(`https://${lang}.wikipedia.org/w/api.php?action=query&format=json&prop=pageimages&generator=search&gsrsearch=${encodeURIComponent(q)}&gsrlimit=12&piprop=thumbnail&pithumbsize=400&origin=*`);
           const data = await res.json();
           // This is an ARTICLE search, not an image search: it returns the lead
           // photo of every article that merely mentions the word. Searching
           // "ดาว" came back with singers and a plate of food, because those
           // articles contain the word. Keep only pages whose own title matches,
           // which is the difference between "an article about ดาว" and "an
           // article that says ดาว somewhere".
           const needle = q.trim().toLowerCase();
           Object.values(data.query?.pages || {}).forEach(p => {
              if (!p.thumbnail) return;
              const title = String(p.title || '').toLowerCase();
              if (!title.includes(needle)) return;
              add({
                 id: `wp-${lang}-${p.pageid}`, title: p.title, thumbnail: p.thumbnail.source, url: p.thumbnail.source,
                 width: p.thumbnail.width, height: p.thumbnail.height, source: 'Wikipedia', license: 'สาธารณะ/CC'
              });
           });
        } catch { /* one source failing shouldn't sink the search */ }
     })();

     const commons = (async () => {
        try {
           const res = await fetch(`https://commons.wikimedia.org/w/api.php?action=query&format=json&generator=search&gsrsearch=${encodeURIComponent(q)}&gsrnamespace=6&gsrlimit=24&prop=imageinfo&iiprop=url|extmetadata&iiurlwidth=320&origin=*`);
           const data = await res.json();
           Object.values(data.query?.pages || {}).forEach(p => {
              const ii = p.imageinfo?.[0];
              if (ii?.thumburl) add({
                 id: `cm-${p.pageid}`, title: p.title.replace('File:', ''), thumbnail: ii.thumburl, url: ii.thumburl,
                 width: ii.thumbwidth, height: ii.thumbheight, source: 'Commons',
                 license: ii.extmetadata?.LicenseShortName?.value || 'CC', creator: ii.extmetadata?.Artist?.value?.replace(/<[^>]+>/g, '')
              });
           });
        } catch { /* ignore */ }
     })();

     const openverse = (async () => {
        try {
           const res = await fetch(`https://api.openverse.org/v1/images/?q=${encodeURIComponent(q)}&page_size=24&mature=false`);
           const data = await res.json();
           (data.results || []).forEach(im => add({
              id: `ov-${im.id}`, title: im.title, thumbnail: im.thumbnail || im.url, url: im.url,
              width: im.width, height: im.height, source: 'Openverse', license: im.license, creator: im.creator
           }));
        } catch { /* ignore */ }
     })();

     // The DuckDuckGo path used to run here in the browser, routing every member's
     // search term through corsproxy.io — an unrelated third party — before it
     // ever reached DDG. /api/image-search already queries DuckDuckGo
     // server-side as a fallback behind Pixabay, so those results are still
     // reachable without handing anyone's queries to a stranger.

     try {
        const sources = [google, commons, openverse, ...wikiLangs.map(wikiArticles)];
        // Results used to appear in whatever order the network returned them, so
        // Wikipedia article photos routinely sat above real picture libraries.
        // Rank by how much of an image source each one is.
        const SOURCE_RANK = { 'Google': 0, 'Pixabay': 1, 'Openverse': 2, 'Commons': 3, 'DuckDuckGo': 4, 'Wikipedia': 5, 'ลิงก์': -1 };
        const ranked = () => [...merged].sort(
           (a, b) => (SOURCE_RANK[a.source] ?? 9) - (SOURCE_RANK[b.source] ?? 9)
        );
        sources.forEach((p) => p.then(() => { if (!isStale()) setImgResults(ranked()); }));
        await Promise.allSettled(sources);
        if (isStale()) return;
        setImgResults(ranked());
        if (!merged.length) toast('ไม่พบรูปภาพที่ค้นหา — ลองคำอื่น หรือเปลี่ยนตัวกรอง');
     } catch (e) {
        console.error('Image search failed', e);
        if (!isStale()) toast.error('ค้นหารูปไม่สำเร็จ (ตรวจสอบอินเทอร์เน็ต)');
     } finally {
        if (!isStale()) setImgLoading(false);
     }
  };

  const insertWebImage = async (item) => {
     const url = item.thumbnail || item.url;
     if (!url) return;
     toast.loading('กำลังแทรกรูป...', { id: 'web-img' });
     try {
        let src = url;
        try {
           const r = await fetch(url);
           const blob = await r.blob();
           src = await new Promise((resolve, reject) => {
              const fr = new FileReader();
              fr.onload = () => resolve(fr.result);
              fr.onerror = reject;
              fr.readAsDataURL(blob);
           });
        } catch { /* CORS-blocked: fall back to referencing the remote URL */ }
        const ratio = item.width && item.height ? item.height / item.width : 1;
        const w = 260;
        const h = Math.round(w * (ratio || 1));
        pushHistory();
        updatePage(currentPageIndex, (page) => {
           if (!page.images) page.images = [];
           page.images.push({ id: nextImageId(), src, x: 120, y: 120, width: w, height: h });
        });
        toast.success('แทรกรูปแล้ว', { id: 'web-img' });
        setShowImgSearch(false);
     } catch (e) {
        console.error('Insert web image failed', e);
        toast.error('แทรกรูปไม่สำเร็จ', { id: 'web-img' });
     }
  };
  return {
    showImgSearch, setShowImgSearch,
    imgQuery, setImgQuery,
    imgResults, imgLoading,
    imgFilter, setImgFilter,
    searchWebImages, insertWebImage,
  };
}
