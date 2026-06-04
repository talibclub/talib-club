/** Shared loading / error / fallback banner for content lists */
export default function ContentStatusBanner({ loading, error, isUsingFallback }) {
  if (loading) {
    return (
      <p style={{ marginTop: 8, fontSize: 12, color: "var(--t2)" }}>
        <i className="ti ti-loader-2 spin" style={{ marginRight: 6 }} />
        กำลังโหลดข้อมูล...
      </p>
    )
  }
  if (error) {
    return (
      <p style={{ marginTop: 8, fontSize: 12, color: "#d84f4f" }}>
        โหลดข้อมูลไม่สำเร็จ กำลังแสดงข้อมูลสำรองในเครื่อง
      </p>
    )
  }
  if (isUsingFallback) {
    return (
      <p style={{ marginTop: 8, fontSize: 12, color: "var(--t2)" }}>
        แสดงข้อมูลออฟไลน์ชั่วคราว (ยังไม่เชื่อมต่อฐานข้อมูลล่าสุด)
      </p>
    )
  }
  return null
}
