import { useEffect, useRef } from 'react';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { db } from '../../../../lib/firebase.js';
import { uploadNotebookData } from '../../../../utils/notebookStorage.js';
import { pickCoverColor } from './notebookAssets.js';

// Keeping the notebook. Cloud upload, the gallery's metadata row, the autosave
// timer, and the two last-resort flushes for unmount and tab close.
//
// Saving was spread over four parts of ProNotebook, with the autosave effect
// calling saveNotebook six hundred lines before it was declared. Gathered here,
// the writers simply come before the effects that use them.
export function useNotebookPersistence({
  pages, pagesRef, readonly, uid, notebookId, activeBook, loadStateRef, setIsSaving,
}) {
  // Metadata write shared by manual/auto save and the unmount flush, so the
  // gallery's "updated at" always tracks the real content.
  const writeNotebookMeta = () => {
     const metadataRef = doc(db, 'content_notebooks', `${uid}_${notebookId}`);
     // coverColor used to be hardcoded to 'red' and written on every single
     // save, so the gallery showed every notebook with the same red cover and
     // any colour set elsewhere was overwritten within seconds. Only seed it
     // when the document does not have one yet.
     return setDoc(metadataRef, {
        uid,
        bookId: notebookId,
        title: activeBook?.book?.title || 'สมุดโน้ต',
        updatedAt: serverTimestamp(),
        coverColor: pickCoverColor(notebookId),
     }, { merge: true });
  };

  const saveInFlightRef = useRef(false);
  const saveNotebook = async (isAuto = false) => {
     if (readonly) return;
     // Without a signed-in user the upload path becomes .../null/<id>.json.gz and
     // Storage rejects it, so every autosave tick turned into a failed request.
     // Local pages are kept either way; there is simply nowhere to put them.
     if (!uid) return;
     if (loadStateRef.current !== 'ready') {
        if (!isAuto) toast.error("ยังโหลดสมุดโน้ตไม่สำเร็จ — บันทึกไม่ได้เพื่อป้องกันข้อมูลเดิมหาย");
        return;
     }
     // Manual save and autosave can fire together; the 2nd would clear the 1st's
     // spinner state and double-upload. Let one finish first.
     if (saveInFlightRef.current) return;
     saveInFlightRef.current = true;
     setIsSaving(true);
     if (!isAuto) toast.loading("กำลังบันทึกลงคลาวด์...", { id: "cloud-save" });
     try {
        await uploadNotebookData(uid, notebookId, pages);
        await writeNotebookMeta();
        // Backup locally
         try { localStorage.setItem(`talib_notebook_${notebookId}`, JSON.stringify(pages)); } catch (e) { console.warn("Local storage quota exceeded on backup", e); }
        if (!isAuto) toast.success("บันทึกคลาวด์เรียบร้อย!", { id: "cloud-save", icon: '💾' });
     } catch (err) {
        console.error(err);
         let localSaved = false;
         try { localStorage.setItem(`talib_notebook_${notebookId}`, JSON.stringify(pages)); localSaved = true; } catch (e) { console.warn("Local storage quota exceeded on fallback", e); }
         if (localSaved) {
        toast.error("บันทึกคลาวด์ล้มเหลว (เซฟลงเครื่องแล้ว)", { id: "cloud-save" });
         } else {
            toast.error("บันทึกคลาวด์ล้มเหลว และพื้นที่ในเครื่องเต็ม (ไม่สามารถบันทึกได้)", { id: "cloud-save" });
         }
     } finally {
        saveInFlightRef.current = false;
        setTimeout(() => setIsSaving(false), 1500);
     }
  };

  // Autosave: idle debounce (5s) + max-wait flush. A pure debounce resets on
  // every stroke, so 30 minutes of continuous writing never reached the cloud
  // even once — the max-wait guarantees a save at least every 45s while active.
  // Seeded on the first run rather than in useRef(Date.now()), which called the
  // clock on every single render and threw the answer away each time bar the
  // first. null means "no save has happened yet", which starts the max-wait
  // window here instead of at whatever time the component happened to mount.
  const lastAutoSaveRef = useRef(null);
  useEffect(() => {
    if (readonly || !pages || pages.length === 0) return;
    if (loadStateRef.current !== 'ready') return; // never overwrite before load settles

    if (lastAutoSaveRef.current === null) lastAutoSaveRef.current = Date.now();

    const MAX_WAIT = 45000;
    const sinceLast = Date.now() - lastAutoSaveRef.current;
    const delay = sinceLast >= MAX_WAIT ? 0 : Math.min(5000, MAX_WAIT - sinceLast);
    const timer = setTimeout(() => {
       lastAutoSaveRef.current = Date.now();
       saveNotebook(true); // isAuto = true
    }, delay);

    return () => clearTimeout(timer);
  }, [pages, readonly]);

  // Save on unmount to prevent data loss if user navigates away before debounce fires
  useEffect(() => {
    return () => {
      if (readonly || !uid || !notebookId) return;
      if (loadStateRef.current !== 'ready') return; // load failed/pending → don't clobber the cloud copy
      if (pagesRef.current && pagesRef.current.length > 0) {
        if (uid) uploadNotebookData(uid, notebookId, pagesRef.current).catch(console.error);
        writeNotebookMeta().catch(console.error);
        try { localStorage.setItem(`talib_notebook_${notebookId}`, JSON.stringify(pagesRef.current)); } catch { /* ignore */ }
      }
    };
  }, [readonly, uid, notebookId]);

  // Last-resort flush: a hard reload (recovery.js) or tab close skips React
  // unmount cleanup, so mirror the pages into localStorage synchronously.
  useEffect(() => {
    const flush = () => {
      if (readonly || loadStateRef.current !== 'ready') return;
      if (pagesRef.current && pagesRef.current.length > 0) {
        try { localStorage.setItem(`talib_notebook_${notebookId}`, JSON.stringify(pagesRef.current)); } catch { /* ignore */ }
      }
    };
    window.addEventListener('beforeunload', flush);
    return () => window.removeEventListener('beforeunload', flush);
  }, [readonly, notebookId]);

  return { saveNotebook, writeNotebookMeta };
}
