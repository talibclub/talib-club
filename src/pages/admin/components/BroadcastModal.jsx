import { useState } from "react"
import { createPortal } from "react-dom"

export default function BroadcastModal({ isOpen, onClose, onSubmit, defaultTitle = "บทความใหม่!" }) {
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")

  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!title.trim() || !body.trim()) return
    onSubmit(title.trim(), body.trim())
    setTitle("")
    setBody("")
  }

  return createPortal(
    <div className="modal-overlay" onClick={onClose} style={{
      position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)'
    }}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{
        background: 'var(--card-bg, #fff)', borderRadius: '16px', padding: '24px', width: '90%', maxWidth: '400px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '1.25rem', color: 'var(--text-color, #111)' }}>
          ส่งแจ้งเตือนบรอดแคสต์
        </h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted, #666)', marginBottom: '20px' }}>
          กรอกหัวข้อและรายละเอียดเพื่อส่ง Push Notification ไปยังผู้ใช้งานทุกคน
        </p>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 500 }}>หัวข้อการแจ้งเตือน</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder={`เช่น: ${defaultTitle}`}
              autoFocus
              style={{
                width: '100%', padding: '10px 12px', borderRadius: '8px',
                border: '1px solid var(--border-color, #eee)', outline: 'none',
                fontFamily: 'inherit', boxSizing: 'border-box'
              }}
              required
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 500 }}>รายละเอียดสั้นๆ</label>
            <textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              placeholder="กรอกรายละเอียดสั้นๆ เพื่อเชิญชวนผู้ใช้..."
              rows={3}
              style={{
                width: '100%', padding: '10px 12px', borderRadius: '8px',
                border: '1px solid var(--border-color, #eee)', outline: 'none',
                fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box'
              }}
              required
            />
          </div>
          
          <div style={{ display: 'flex', gap: '12px', marginTop: '8px', justifyContent: 'flex-end' }}>
            <button 
              type="button" 
              onClick={onClose}
              style={{
                padding: '10px 16px', borderRadius: '8px', background: 'transparent',
                border: '1px solid var(--border-color, #ccc)', cursor: 'pointer', fontFamily: 'inherit'
              }}
            >
              ยกเลิก
            </button>
            <button 
              type="submit"
              disabled={!title.trim() || !body.trim()}
              style={{
                padding: '10px 16px', borderRadius: '8px', background: 'var(--teal-600, #0d9488)', color: '#fff',
                border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500,
                opacity: (!title.trim() || !body.trim()) ? 0.5 : 1
              }}
            >
              ส่งบรอดแคสต์
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  )
}
