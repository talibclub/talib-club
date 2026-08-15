import SEOHead from "../components/SEOHead.jsx"

// The route catch-all used to `<Navigate to="/" replace />`, which turned every
// unknown or retired URL into a client-side redirect to the homepage. Google
// files those under "Page with redirect" and, because the destination is a page
// that says nothing about what was asked for, treats the rest as soft 404s.
// A page that says "not found" and carries noindex is the honest answer, and it
// leaves the visitor somewhere they can navigate from.
export default function NotFound({ go }) {
  const open = (page) => (event) => {
    if (!go) return
    event.preventDefault()
    go(page)
  }

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "60px 20px", textAlign: "center" }}>
      <SEOHead
        title="ไม่พบหน้าที่ต้องการ | Talib Club"
        description="ขออภัย ไม่พบหน้าที่คุณต้องการ อาจถูกย้ายหรือลบไปแล้ว"
        noIndex
      />
      <i className="ti ti-map-search" style={{ fontSize: 48, color: "var(--teal)" }} />
      <h1 style={{ marginTop: 16 }}>ไม่พบหน้าที่ต้องการ</h1>
      <p style={{ color: "var(--sub)", marginBottom: 28 }}>
        ขออภัย หน้าที่คุณเปิดอาจถูกย้าย เปลี่ยนชื่อ หรือลบไปแล้ว
      </p>
      <nav style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center" }}>
        <a className="btn" href="/" onClick={open("home")}>กลับหน้าแรก</a>
        <a className="sec-link" href="/articles" onClick={open("articles")}>บทความ</a>
        <a className="sec-link" href="/library" onClick={open("library")}>ห้องสมุด</a>
        <a className="sec-link" href="/media" onClick={open("media")}>มีเดีย</a>
      </nav>
    </div>
  )
}
