import { useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';

// Audio notes: recording playback, the transport bar, and the list panel.
//
// A single <audio> element drives the whole notebook. Recordings live inside the
// pages, as stickers carrying an audioUrl, so they save and sync with everything
// else — they are only surfaced separately, through a list and a transport bar.
//
// Split out of ProNotebook, which had grown past four thousand lines with every
// concern in one scope. Nothing here touches drawing, pages or tools beyond the
// two writers it is handed.
export function useNotebookAudio({ pages, updatePage, pushHistory }) {
  const [showRecordings, setShowRecordings] = useState(false);
  const [nowPlaying, setNowPlaying] = useState(null);   // { id, pageIndex, name }
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState({ current: 0, duration: 0 });
  const [audioSpeed, setAudioSpeed] = useState(1);
  const audioElRef = useRef(null);

  const getAudioEl = () => {
    if (!audioElRef.current) {
      const a = new Audio();
      a.addEventListener('play', () => setAudioPlaying(true));
      a.addEventListener('pause', () => setAudioPlaying(false));
      a.addEventListener('timeupdate', () => setAudioProgress({ current: a.currentTime, duration: a.duration || 0 }));
      a.addEventListener('loadedmetadata', () => setAudioProgress({ current: a.currentTime, duration: a.duration || 0 }));
      a.addEventListener('ended', () => { setAudioPlaying(false); setAudioProgress((p) => ({ ...p, current: 0 })); });
      audioElRef.current = a;
    }
    return audioElRef.current;
  };

  // Every audio note across every page, in page order, for the list panel.
  const recordings = useMemo(() => {
    const out = [];
    pages.forEach((pg, pi) => (pg.stickers || []).forEach((s) => {
      if (s.audioUrl) out.push({ pageIndex: pi, id: s.id, name: s.name, createdAt: s.createdAt, audioUrl: s.audioUrl, isUploading: s.isUploading });
    }));
    return out;
  }, [pages]);

  const playRecording = (rec) => {
    if (rec.isUploading) return;
    const a = getAudioEl();
    if (nowPlaying?.id === rec.id) {
      if (a.paused) a.play(); else a.pause();
      return;
    }
    a.src = rec.audioUrl;
    a.currentTime = 0;
    a.playbackRate = audioSpeed;
    a.play();
    const idx = recordings.findIndex((r) => r.id === rec.id);
    setNowPlaying({ id: rec.id, pageIndex: rec.pageIndex, name: rec.name || `บันทึก (${idx + 1})` });
  };

  const toggleAudioPlay = () => { const a = getAudioEl(); if (a.paused) a.play(); else a.pause(); };
  const skipAudio = (delta) => { const a = getAudioEl(); a.currentTime = Math.max(0, Math.min(a.duration || 0, a.currentTime + delta)); };
  const seekAudio = (t) => { const a = getAudioEl(); a.currentTime = t; setAudioProgress((p) => ({ ...p, current: t })); };
  const cycleSpeed = () => {
    const speeds = [1, 1.5, 2, 0.75];
    const next = speeds[(speeds.indexOf(audioSpeed) + 1) % speeds.length];
    setAudioSpeed(next);
    if (audioElRef.current) audioElRef.current.playbackRate = next;
  };
  const closePlayback = () => { const a = audioElRef.current; if (a) { a.pause(); a.currentTime = 0; } setNowPlaying(null); };

  const deleteRecording = (rec) => {
    if (nowPlaying?.id === rec.id) closePlayback();
    pushHistory();
    updatePage(rec.pageIndex, (page) => { page.stickers = (page.stickers || []).filter((s) => s.id !== rec.id); });
    toast.success('ลบบันทึกเสียงแล้ว');
  };
  const renameRecording = (rec, name) => {
    updatePage(rec.pageIndex, (page) => { page.stickers = (page.stickers || []).map((s) => (s.id === rec.id ? { ...s, name } : s)); });
    if (nowPlaying?.id === rec.id) setNowPlaying((np) => ({ ...np, name }));
  };
  return {
    showRecordings, setShowRecordings,
    nowPlaying, setNowPlaying,
    audioPlaying, audioProgress, audioSpeed,
    recordings,
    playRecording, toggleAudioPlay, skipAudio, seekAudio, cycleSpeed,
    closePlayback, deleteRecording, renameRecording,
  };
}

// mm:ss for the transport bar and the recording timer.
export const formatTime = (secs) => {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};
