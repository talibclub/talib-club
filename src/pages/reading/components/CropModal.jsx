import React, { useState, useRef } from 'react';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { X, Check } from 'lucide-react';

export default function CropModal({ imageUrl, onCropComplete, onCancel }) {
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState(null);
  const imgRef = useRef(null);

  const onImageLoad = (e) => {
    const { width, height } = e.currentTarget;
    const initialCrop = centerCrop(
      makeAspectCrop({ unit: '%', width: 90 }, 1, width, height),
      width,
      height
    );
    setCrop(initialCrop);
  };

  const handleCrop = () => {
    if (!completedCrop || !imgRef.current) {
      onCancel();
      return;
    }
    
    const image = imgRef.current;
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    
    canvas.width = completedCrop.width * scaleX;
    canvas.height = completedCrop.height * scaleY;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
       onCancel();
       return;
    }

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY
    );

    const base64Image = canvas.toDataURL('image/png');
    onCropComplete(base64Image);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.8)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
       <div style={{ background: 'white', padding: 24, borderRadius: 16, width: '90%', maxWidth: 800, maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
             <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: '#111827' }}>ครอบตัดรูปภาพ (Crop Image)</h3>
             <button onClick={onCancel} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#6B7280' }}>
                <X size={24} />
             </button>
          </div>
          
          <div style={{ flex: 1, overflow: 'auto', background: '#F3F4F6', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
             <ReactCrop crop={crop} onChange={c => setCrop(c)} onComplete={c => setCompletedCrop(c)}>
               <img 
                 ref={imgRef}
                 src={imageUrl} 
                 onLoad={onImageLoad}
                 style={{ maxHeight: '60vh', maxWidth: '100%', objectFit: 'contain' }}
                 crossOrigin="anonymous"
               />
             </ReactCrop>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 20 }}>
             <button onClick={onCancel} style={{ padding: '10px 20px', borderRadius: 8, border: '1px solid #D1D5DB', background: 'white', color: '#4B5563', fontWeight: 600, cursor: 'pointer' }}>
                ยกเลิก
             </button>
             <button onClick={handleCrop} style={{ padding: '10px 20px', borderRadius: 8, border: 'none', background: '#3B82F6', color: 'white', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Check size={18} /> ยืนยันการครอบตัด
             </button>
          </div>
          
       </div>
    </div>
  );
}
