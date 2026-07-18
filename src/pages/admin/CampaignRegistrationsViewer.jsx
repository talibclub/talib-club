import React, { useState, useEffect } from "react"
import { collection, query, where, getDocs, updateDoc, doc, serverTimestamp, setDoc, writeBatch, onSnapshot } from "firebase/firestore"
import { db } from "../../lib/firebase.js"
import { trackingDb } from "../../lib/trackingFirebase.js"
import toast from "react-hot-toast"
import { confirmAction, promptAction } from "../../utils/feedback.jsx"

export default function CampaignRegistrationsViewer({ campaign, onBack }) {
  const [registrations, setRegistrations] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all") // all, submitted, approved, shipped, rejected
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState([])
  const [holds, setHolds] = useState([])

  const fetchRegistrations = async () => {
    setLoading(true)
    try {
      const q = query(collection(db, "book_registrations"), where("campaignId", "==", campaign.id))
      const snap = await getDocs(q)
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      // Sort client-side by createdAt descending
      data.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0))
      setRegistrations(data)
    } catch (err) {
      console.error(err)
      toast.error("ดึงข้อมูลรายชื่อล้มเหลว")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (campaign) {
      fetchRegistrations()
      setSelected([])
      
      const holdsRef = collection(db, "book_campaigns", campaign.id, "holds")
      const q = query(holdsRef, where("status", "==", "reserved"))
      const unsub = onSnapshot(q, (snap) => {
        const now = Date.now()
        const activeHolds = snap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .filter(h => h.expiresAt && h.expiresAt.toMillis() > now)
        setHolds(activeHolds)
      })
      return () => unsub()
    }
  }, [campaign])

  const handleUpdateStatus = async (reg, newStatus) => {
    const actionText = newStatus === "approved" ? "อนุมัติ" : newStatus === "rejected" ? "ปฏิเสธ" : newStatus
    const confirmed = await confirmAction(`ยืนยันการ${actionText}สลิปของ ${reg.name} ใช่หรือไม่?`)
    if (!confirmed) return

    const toastId = toast.loading("กำลังอัปเดตสถานะ...")
    try {
      await updateDoc(doc(db, "book_registrations", reg.id), {
        status: newStatus,
        updatedAt: serverTimestamp()
      })
      toast.success("อัปเดตสถานะสำเร็จ", { id: toastId })
      fetchRegistrations()
    } catch (err) {
      console.error(err)
      toast.error("เกิดข้อผิดพลาด", { id: toastId })
    }
  }

  const handleSyncToTracking = async (reg) => {
    const confirmed = await confirmAction(`ส่งรายชื่อ ${reg.name} เข้าระบบเตรียมจัดส่ง (Tracking) อัตโนมัติใช่หรือไม่?`)
    if (!confirmed) return

    const toastId = toast.loading("กำลังซิงค์ข้อมูล...")
    try {
      // Add to trackingDb recipients collection
      const docRef = doc(collection(trackingDb, "recipients"))
      await setDoc(docRef, {
        fullName: reg.name,
        phone: reg.phone,
        address: reg.address,
        postalCode: reg.zipcode,
        bonusNote: `แคมเปญ: ${campaign.title}`,
        createdAt: serverTimestamp(),
        sourceRegId: reg.id
      })
      
      // Update local registration
      await updateDoc(doc(db, "book_registrations", reg.id), {
        syncedToTracking: true,
        updatedAt: serverTimestamp()
      })
      
      toast.success("ส่งรายชื่อเข้าระบบ Tracking สำเร็จ", { id: toastId })
      fetchRegistrations()
    } catch (err) {
      console.error(err)
      toast.error("เกิดข้อผิดพลาดในการซิงค์ข้อมูล", { id: toastId })
    }
  }

  const handleAddTrackingNumber = async (reg) => {
    const trackNum = await promptAction({ title: "Add tracking number", message: "Enter the tracking number for this order", placeholder: "Tracking Number", confirmText: "Save" })
    if (!trackNum || trackNum.trim() === "") return

    const confirmed = await confirmAction(`ยืนยันการใส่เลขพัสดุ ${trackNum} และส่งต่อให้ระบบ Tracking ใช่หรือไม่?`)
    if (!confirmed) return

    const toastId = toast.loading("กำลังบันทึกเลขพัสดุ...")
    try {
      // Add to trackingDb records collection
      const docRef = doc(collection(trackingDb, "records"))
      await setDoc(docRef, {
        fullName: reg.name,
        phone: reg.phone,
        address: reg.address,
        postalCode: reg.zipcode,
        trackingNumber: trackNum.replace(/\s/g, '').toUpperCase(),
        bonusNote: `แคมเปญ: ${campaign.title}`,
        createdAt: serverTimestamp(),
        sourceRegId: reg.id
      })

      // Update local registration
      await updateDoc(doc(db, "book_registrations", reg.id), {
        status: "shipped",
        trackingNumber: trackNum,
        updatedAt: serverTimestamp()
      })

      toast.success("บันทึกเลขพัสดุสำเร็จ", { id: toastId })
      fetchRegistrations()
    } catch (err) {
      console.error(err)
      toast.error("เกิดข้อผิดพลาด", { id: toastId })
    }
  }

  const filteredRegistrations = registrations.filter(r => {
    if (filter === "all") return true
    if (filter === "submitted") return !r.status || r.status === "submitted"
    return r.status === filter
  }).filter(r => {
    if (!search) return true
    return (r.name || "").toLowerCase().includes(search.toLowerCase()) || (r.phone || "").includes(search)
  })

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelected(filteredRegistrations.map(r => r.id))
    } else {
      setSelected([])
    }
  }

  const toggleSelect = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const handleBulkApprove = async () => {
    if (selected.length === 0) return
    const confirmed = await confirmAction(`ยืนยันการอนุมัติ ${selected.length} รายการที่เลือกใช่หรือไม่?`)
    if (!confirmed) return

    const toastId = toast.loading("กำลังอนุมัติ...")
    try {
      const batch = writeBatch(db)
      selected.forEach(id => {
        const ref = doc(db, "book_registrations", id)
        batch.update(ref, { status: "approved", updatedAt: serverTimestamp() })
      })
      await batch.commit()
      toast.success("อนุมัติสำเร็จ", { id: toastId })
      setSelected([])
      fetchRegistrations()
    } catch (err) {
      console.error(err)
      toast.error("เกิดข้อผิดพลาดในการอนุมัติ", { id: toastId })
    }
  }

  const handleExportCSV = () => {
    if (filteredRegistrations.length === 0) {
      return toast.error("ไม่มีข้อมูลสำหรับส่งออก")
    }
    
    const headers = ["ลำดับ", "ชื่อ-นามสกุล", "เบอร์โทรศัพท์", "ที่อยู่จัดส่ง", "รหัสไปรษณีย์", "ช่องทางติดต่อ", "สถานะ", "เวลาลงทะเบียน"]
    const rows = filteredRegistrations.map((r, idx) => {
      return [
        idx + 1,
        `"${(r.name || '').replace(/"/g, '""')}"`,
        `"${(r.phone || '').replace(/"/g, '""')}"`,
        `"${(r.address || '').replace(/\n/g, ' ').replace(/"/g, '""')}"`,
        `"${(r.zipcode || '').replace(/"/g, '""')}"`,
        `"${(r.contact || '').replace(/"/g, '""')}"`,
        r.status || 'submitted',
        r.createdAt ? new Date(r.createdAt.toMillis()).toLocaleString('th-TH') : ''
      ].join(",")
    })
    
    const csvContent = "\uFEFF" + headers.join(",") + "\n" + rows.join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", `รายชื่อ_${campaign.title}_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const getStatusBadge = (status) => {
    const s = status || "submitted"
    switch (s) {
      case "submitted": return <span className="badge" style={{ background: "var(--amber-bg)", color: "var(--amber)" }}>รอตรวจสอบสลิป</span>
      case "approved": return <span className="badge" style={{ background: "var(--teal-bg)", color: "var(--teal)" }}>อนุมัติแล้ว</span>
      case "shipped": return <span className="badge" style={{ background: "var(--bg3)", color: "var(--t2)" }}>จัดส่งแล้ว</span>
      case "rejected": return <span className="badge" style={{ background: "rgba(239, 68, 68, 0.1)", color: "var(--red)" }}>ปฏิเสธ</span>
      default: return <span className="badge">{s}</span>
    }
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button className="btn btn-outline" onClick={onBack} style={{ padding: "6px 12px" }}>
            <i className="ti ti-arrow-left"></i> กลับ
          </button>
          <h2 style={{ margin: 0, fontSize: 20 }}>รายชื่อผู้ลงทะเบียน: {campaign.title}</h2>
        </div>
        <div style={{ fontSize: 14, color: "var(--t2)" }}>
          กำลังล็อกคิว <strong>{holds.length}</strong> คิว | โอนสลิปแล้ว <strong>{registrations.length}</strong> คน
        </div>
      </div>

      {holds.length > 0 && (
        <div className="card" style={{ padding: 24, marginBottom: 24, border: "1px solid var(--amber)", background: "rgba(245, 166, 35, 0.05)" }}>
          <h3 style={{ margin: "0 0 16px 0", fontSize: 16, color: "var(--amber)", display: "flex", alignItems: "center", gap: 8 }}>
            <i className="ti ti-clock spin"></i> กำลังทำรายการจอง (ล็อกคิว)
          </h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
            {holds.map(h => {
              const minutesLeft = Math.ceil((h.expiresAt.toMillis() - Date.now()) / 60000)
              return (
                <div key={h.id} style={{ padding: "8px 12px", background: "var(--bg)", border: "1px solid var(--br)", borderRadius: 8, fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}>
                  <i className="ti ti-user" style={{ color: "var(--t3)" }}></i>
                  <span style={{ fontWeight: 600 }}>{h.name || "ไม่ระบุชื่อ"}</span>
                  <span className="badge" style={{ background: "var(--amber-bg)", color: "var(--amber)", fontSize: 11, padding: "2px 6px" }}>
                    เหลือ {minutesLeft} นาที
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="card" style={{ padding: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: 20 }}>
          <div style={{ display: "flex", gap: 8 }}>
            <select className="inp" value={filter} onChange={e => setFilter(e.target.value)} style={{ minWidth: 150 }}>
              <option value="all">สถานะทั้งหมด</option>
              <option value="submitted">รอตรวจสอบสลิป</option>
              <option value="approved">อนุมัติแล้ว</option>
              <option value="shipped">จัดส่งแล้ว</option>
              <option value="rejected">ปฏิเสธ</option>
            </select>
            <input 
              type="text" 
              className="inp" 
              placeholder="ค้นหาชื่อ หรือ เบอร์โทร..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
            />
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {selected.length > 0 && (
              <button className="btn btn-teal" onClick={handleBulkApprove} style={{ padding: "8px 16px" }}>
                <i className="ti ti-check"></i> อนุมัติ ({selected.length})
              </button>
            )}
            <button className="btn btn-outline" onClick={handleExportCSV} style={{ padding: "8px 16px" }}>
              <i className="ti ti-download"></i> โหลด CSV
            </button>
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", fontSize: 13, textAlign: "left", borderCollapse: "collapse" }}>
            <thead style={{ background: "var(--bg2)", borderBottom: "1px solid var(--br)" }}>
              <tr>
                <th style={{ padding: 12, width: 40, textAlign: "center" }}>
                  <input 
                    type="checkbox" 
                    checked={filteredRegistrations.length > 0 && selected.length === filteredRegistrations.length}
                    onChange={handleSelectAll}
                  />
                </th>
                <th style={{ padding: 12 }}>ลำดับ</th>
                <th style={{ padding: 12 }}>ชื่อ-นามสกุล / เบอร์โทร</th>
                <th style={{ padding: 12 }}>ที่อยู่จัดส่ง</th>
                <th style={{ padding: 12, textAlign: "center" }}>สลิปโอนเงิน</th>
                <th style={{ padding: 12, textAlign: "center" }}>สถานะ</th>
                <th style={{ padding: 12, textAlign: "center" }}>การจัดการ</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" style={{ textAlign: "center", padding: 32, color: "var(--t3)" }}><i className="ti ti-loader-2 spin"></i> กำลังโหลด...</td></tr>
              ) : filteredRegistrations.length === 0 ? (
                <tr><td colSpan="7" style={{ textAlign: "center", padding: 32, color: "var(--t3)" }}>ไม่พบรายชื่อ</td></tr>
              ) : (
                filteredRegistrations.map((reg, idx) => (
                  <tr key={reg.id} style={{ borderBottom: "1px solid var(--br2)", background: idx % 2 === 0 ? "var(--card)" : "var(--bg2)" }}>
                    <td style={{ padding: 12, textAlign: "center" }}>
                      <input 
                        type="checkbox" 
                        checked={selected.includes(reg.id)}
                        onChange={() => toggleSelect(reg.id)}
                      />
                    </td>
                    <td style={{ padding: 12, color: "var(--t2)" }}>{idx + 1}</td>
                    <td style={{ padding: 12 }}>
                      <div style={{ fontWeight: 600 }}>{reg.name}</div>
                      <div style={{ color: "var(--t2)", marginTop: 4 }}>{reg.phone}</div>
                      {reg.contact && <div style={{ color: "var(--t3)", fontSize: 11, marginTop: 2 }}>ติดต่อ: {reg.contact}</div>}
                    </td>
                    <td style={{ padding: 12 }}>
                      <div style={{ maxWidth: 200, wordBreak: "break-word" }}>{reg.address}</div>
                      <div style={{ fontWeight: 600, color: "var(--teal)", marginTop: 4 }}>{reg.zipcode}</div>
                    </td>
                    <td style={{ padding: 12, textAlign: "center" }}>
                      {reg.slipUrl ? (
                        <a href={reg.slipUrl} target="_blank" rel="noreferrer" style={{ display: "inline-block", padding: 4, border: "1px solid var(--br)", borderRadius: 4, background: "var(--bg)" }}>
                          <img src={reg.slipUrl} alt="Slip" style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 2 }} />
                        </a>
                      ) : (
                        <span style={{ color: "var(--t3)" }}>-</span>
                      )}
                    </td>
                    <td style={{ padding: 12, textAlign: "center" }}>
                      {getStatusBadge(reg.status)}
                      {reg.trackingNumber && <div style={{ marginTop: 6, fontSize: 11, fontFamily: "monospace", color: "var(--teal)", fontWeight: "bold" }}>{reg.trackingNumber}</div>}
                    </td>
                    <td style={{ padding: 12 }}>
                      <div style={{ display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap", maxWidth: 180, margin: "0 auto" }}>
                        {(!reg.status || reg.status === "submitted") && (
                          <>
                            <button className="btn btn-outline" onClick={() => handleUpdateStatus(reg, "approved")} style={{ padding: "4px 8px", fontSize: 12, color: "var(--teal)", borderColor: "var(--teal-bg)", background: "var(--teal-bg)" }}>
                              <i className="ti ti-check"></i> อนุมัติ
                            </button>
                            <button className="btn btn-outline" onClick={() => handleUpdateStatus(reg, "rejected")} style={{ padding: "4px 8px", fontSize: 12, color: "var(--red)", borderColor: "rgba(239, 68, 68, 0.2)", background: "rgba(239, 68, 68, 0.05)" }}>
                              <i className="ti ti-x"></i> ปฏิเสธ
                            </button>
                          </>
                        )}
                        {reg.status === "approved" && (
                          <>
                            {!reg.syncedToTracking ? (
                              <button className="btn btn-outline" onClick={() => handleSyncToTracking(reg)} style={{ padding: "4px 8px", fontSize: 12, width: "100%", justifyContent: "center" }}>
                                <i className="ti ti-database-export"></i> ส่งชื่อเข้า Tracking
                              </button>
                            ) : (
                              <div style={{ fontSize: 11, color: "var(--teal)", padding: "4px 0", width: "100%", textAlign: "center", fontWeight: "bold" }}>
                                <i className="ti ti-check"></i> ส่งชื่อแล้ว
                              </div>
                            )}
                            <button className="btn btn-outline" onClick={() => handleAddTrackingNumber(reg)} style={{ padding: "4px 8px", fontSize: 12, width: "100%", justifyContent: "center" }}>
                              <i className="ti ti-box"></i> ใส่เลขพัสดุ
                            </button>
                          </>
                        )}
                        {reg.status === "shipped" && (
                          <button className="btn btn-outline" onClick={() => handleAddTrackingNumber(reg)} style={{ padding: "4px 8px", fontSize: 12, width: "100%", justifyContent: "center" }}>
                            <i className="ti ti-edit"></i> แก้ไขเลขพัสดุ
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
