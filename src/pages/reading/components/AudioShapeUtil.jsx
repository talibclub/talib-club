import React, { useState, useRef, useEffect } from 'react';
import { BaseBoxShapeUtil, HTMLContainer, T } from 'tldraw';
import { storage } from '../../../lib/firebase.js';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { safeDateNow } from '../../../utils/time.js';

// React Component inside the shape
function AudioSticker({ shape, editor }) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioRef = useRef(null);

  const isRecorded = !!shape.props.url;

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setUploading(true);
        
        try {
          const fileName = `audio-note-${safeDateNow()}.webm`;
          const audioRef = ref(storage, `notebook_audios/${fileName}`);
          await uploadBytes(audioRef, audioBlob);
          const downloadUrl = await getDownloadURL(audioRef);
          
          editor.updateShape({
            id: shape.id,
            type: 'audio',
            props: { url: downloadUrl }
          });
        } catch (err) {
          console.error("Audio Upload Failed", err);
          alert("อัปโหลดเสียงไม่สำเร็จ");
        } finally {
          setUploading(false);
        }
        
        // Stop tracks to release mic
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Mic Access Error", err);
      alert("ไม่สามารถเข้าถึงไมโครโฟนได้ กรุณาให้สิทธิ์");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const togglePlayback = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  useEffect(() => {
    const audioEl = audioRef.current;
    if (!audioEl) return;
    const handleEnded = () => setIsPlaying(false);
    audioEl.addEventListener('ended', handleEnded);
    return () => audioEl.removeEventListener('ended', handleEnded);
  }, [isRecorded]);

  return (
    <HTMLContainer
      id={shape.id}
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'all',
        background: 'var(--card)',
        borderRadius: 20,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        border: '1.5px solid var(--br2)',
        overflow: 'hidden'
      }}
    >
      {uploading ? (
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', color: 'var(--teal)', fontSize: 12, fontWeight: 500 }}>
          <i className="ti ti-loader-2 spin"></i> กำลังอัปโหลด...
        </div>
      ) : isRecorded ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 12px', width: '100%', height: '100%', background: 'var(--teal-bg)' }}>
          <button 
            onPointerDown={(e) => { e.stopPropagation(); togglePlayback(); }}
            style={{ background: 'var(--teal)', border: 'none', color: '#fff', width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <i className={`ti ${isPlaying ? 'ti-player-stop' : 'ti-player-play'}`}></i>
          </button>
          <div style={{ flex: 1, height: 4, background: 'rgba(0,0,0,0.1)', borderRadius: 2, position: 'relative' }}>
             <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: isPlaying ? '100%' : '0%', background: 'var(--teal)', transition: isPlaying ? 'width 5s linear' : 'none' }}></div>
          </div>
          <audio ref={audioRef} src={shape.props.url} preload="auto" />
        </div>
      ) : (
        <button
          onPointerDown={(e) => {
            e.stopPropagation();
            if (isRecording) {
              stopRecording();
            } else {
              startRecording();
            }
          }}
          style={{
            background: isRecording ? '#ffe5e5' : 'var(--bg2)',
            border: isRecording ? '1.5px solid #ff4d4f' : '1.5px solid var(--br)',
            color: isRecording ? '#ff4d4f' : 'var(--text)',
            borderRadius: 16,
            padding: '6px 12px',
            fontSize: 12,
            fontWeight: 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            transition: 'all 0.2s',
            width: '100%',
            height: '100%',
            justifyContent: 'center'
          }}
        >
          <i className={`ti ${isRecording ? 'ti-player-stop' : 'ti-microphone'}`}></i>
          {isRecording ? 'หยุดบันทึก' : 'กดอัดเสียง'}
        </button>
      )}
    </HTMLContainer>
  );
}

export class AudioShapeUtil extends BaseBoxShapeUtil {
  static type = 'audio';

  static props = {
    w: T.number,
    h: T.number,
    url: T.string,
  };

  getDefaultProps() {
    return {
      w: 160,
      h: 48,
      url: '',
    };
  }

  component(shape) {
    return <AudioSticker shape={shape} editor={this.editor} />;
  }

  indicator(shape) {
    return <rect width={shape.props.w} height={shape.props.h} rx={20} ry={20} />;
  }
}
