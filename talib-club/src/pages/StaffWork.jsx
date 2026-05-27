import { useCallback, useEffect, useMemo, useState } from "react"
import { useTaxonomySettings } from "../lib/contentStore.js";
import { DEFAULT_TAXONOMY } from "../data/index.js";

const API_BASE_URL = "https://script.google.com/macros/s/AKfycby1TIKNbLnPZ4bYe4D8IxaTs7kBmqo3anpQz_AJfndlpgp629pd7ysifFIbPnnJm5z-8A/exec"

const ADMIN_TEAM = ["อุสมาน", "ฟาดิล", "อนันดา"]
const STAFF_TEAM = [
  "ชาฟิน", "ชามิล", "ดาวูด", "แบยัง", "แบอัซมาวีย์",
  "ฟาดิล", "มะห์ดี", "ยะฮฺ", "อนันดา",  "อุสมาน"
].sort()

const MAGAZINE_QUEUE = [
  { month: "มกราคม", user: "แบยัง" },
  { month: "กุมภาพันธ์", user: "บังอัสมาวี" },
  { month: "มีนาคม", user: "อุสมาน" },
  { month: "เมษายน", user: "ชามิล" },
  { month: "พฤษภาคม", user: "อนันดา" },
  { month: "มิถุนายน", user: "แบยัง" },
  { month: "กรกฎาคม", user: "ฟาดิล" },
  { month: "สิงหาคม", user: "ชาฟิน" },
  { month: "กันยายน", user: "อุสมาน" },
  { month: "ตุลาคม", user: "ดาวูด" },
  { month: "พฤศจิกายน", user: "ชาฟิน" },
  { month: "ธันวาคม", user: "มะห์ดี" },
]

const DEFAULT_CATEGORIES = [
  "วารสารอัซซอลิฮีน",
  "ทำความเข้าใจอิสลามอย่างง่าย",
  "The Articles | Al-Maqaalaat",
  "อัตตัซกียะฮฺ",
  "รูปภาพหน้าปก",
  "ประชาสัมพันธ์",
  "วิวัฒนาการ",
  "เปิดบริจาค",
  "ตัรบียะฮฺ ขัดเกลาจิตใจ",
  "หนังสือน่าอ่าน",
  "บทความ (ทั่วไป/สังคมศาสตร์)",
  "แจกหนังสือ",
  "คำสอนอิสลามสั้นๆ",
  "ถาม-ตอบ",
  "โปรโมทพอตแคส",
  "รีวิวหนังสือ",
  "รอมาฎอน",
  "บทความเฉพาะเรื่อง",
]

const PLATFORMS = ["Facebook", "Instagram", "YouTube", "TikTok", "Spotify"]
const STATUS = { PENDING: "Pending", POSTED: "Posted", DRAFT: "Draft" }
const SUBMISSION_STATUS = {
  PENDING_REVIEW: "Pending Review",
  NEEDS_REVISION: "Needs Revision",
  APPROVED: "Approved",
}
const SUBMISSION_TYPES = ["บทความ", "เอกสาร", "รูปภาพ", "คลิป", "เสียง"]

const emptyPost = {
  Title: "",
  Content: "",
  PosterUrl: "",
  Category: "",
  DateScheduled: "",
  Platforms: [],
  ResponsibleAdmin: "",
  ContentAuthor: "",
  PosterDesigner: "",
}

const emptySubmission = {
  Title: "",
  SubmissionType: "",
  SubmissionLink: "",
  SubmissionContent: "",
}

export default function StaffWork({ authState, go }) {
  // --- ระบบดึงหมวดหมู่จาก Admin Taxonomy ---
  const { taxonomy } = useTaxonomySettings(DEFAULT_TAXONOMY);
  const CATEGORIES = taxonomy.staffCategories?.length ? taxonomy.staffCategories : DEFAULT_CATEGORIES;

  const [staffName, setStaffName] = useStaffName(authState)
  const isAdmin = ADMIN_TEAM.includes(staffName)
  const [tab, setTab] = useState("work")
  const [notice, setNotice] = useState("")
  const postsApi = useSheetPosts(staffName)
  const submissionsApi = useSheetSubmissions(staffName)

  const stats = useMemo(() => getStats(postsApi.posts, submissionsApi.submissions, staffName, isAdmin), [postsApi.posts, submissionsApi.submissions, staffName, isAdmin])

  function refreshAll() {
    postsApi.fetchData()
    submissionsApi.fetchData()
  }

  function flash(text) {
    setNotice(text)
    window.setTimeout(() => setNotice(""), 2200)
  }

  return (
    <div className="staff-work">
      <div className="staff-work-head">
        <div>
          <button className="btn btn-outline" onClick={() => go("staff")}>
            <i className="ti ti-arrow-left" style={{ marginRight: 6 }}></i>กลับ
          </button>
          <span className="badge badge-teal" style={{ marginLeft: 10 }}>Staff</span>
          <h1>งานสตาฟ</h1>
          <p>รับงาน ส่งงาน ตรวจงาน และติดตามคิวงานของทีม Talib Club</p>
        </div>
        <div className="staff-work-user card">
          <label>
            <span>ใช้งานในชื่อ</span>
            <select value={staffName} onChange={e => setStaffName(e.target.value)}>
              {[...new Set([...ADMIN_TEAM, ...STAFF_TEAM])].sort().map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </label>
          <button className="btn btn-outline" onClick={refreshAll} disabled={postsApi.loading || submissionsApi.loading}>
            <i className={`ti ti-refresh ${postsApi.loading || submissionsApi.loading ? "spin" : ""}`} style={{ marginRight: 6 }}></i>รีเฟรช
          </button>
        </div>
      </div>

      {notice && <div className="auth-info staff-work-notice">{notice}</div>}
      {(postsApi.error || submissionsApi.error) && (
        <div className="auth-error staff-work-notice">โหลดข้อมูลบางส่วนไม่สำเร็จ กรุณาลองรีเฟรชอีกครั้ง</div>
      )}

      <div className="staff-stat-grid">
        <StatCard label="รอลง" value={stats.pending} tone="warn" />
        <StatCard label="ลงแล้ว" value={stats.posted} tone="ok" />
        <StatCard label="เลยกำหนด" value={stats.overdue} tone="bad" />
        <StatCard label="รอตรวจ" value={stats.review} tone="info" />
      </div>

      <div className="staff-tabs">
        {[
          ["work", "ศูนย์งาน", "ti-briefcase"],
          ["submit", "ส่งงาน", "ti-upload"],
          ["review", "กล่องส่งงาน", "ti-inbox"],
          ["archive", "คลังงาน", "ti-archive"],
          ["magazine", "คิววารสาร", "ti-book-2"],
          ["profile", "โปรไฟล์ทีม", "ti-user-circle"],
        ].map(([id, label, icon]) => (
          <button key={id} className={`pill ${tab === id ? "on" : ""}`} onClick={() => setTab(id)}>
            <i className={`ti ${icon}`} style={{ marginRight: 6 }}></i>{label}
          </button>
        ))}
      </div>

      {tab === "work" && <WorkCenter posts={postsApi.posts} staffName={staffName} onUpdate={postsApi.updatePost} onDelete={postsApi.deletePost} flash={flash} />}
      {tab === "submit" && <SubmitWork staffName={staffName} createSubmission={submissionsApi.createSubmission} flash={flash} />}
      {tab === "review" && <ReviewQueue submissions={submissionsApi.submissions} staffName={staffName} isAdmin={isAdmin} updateSubmission={submissionsApi.updateSubmission} deleteSubmission={submissionsApi.deleteSubmission} flash={flash} />}
      {tab === "archive" && <ArchiveView posts={postsApi.posts} staffName={staffName} createPost={postsApi.createPost} updatePost={postsApi.updatePost} deletePost={postsApi.deletePost} flash={flash} CATEGORIES={CATEGORIES} />}
      {tab === "magazine" && <MagazineQueue staffName={staffName} />}
      {tab === "profile" && <StaffProfile staffName={staffName} posts={postsApi.posts} />}
    </div>
  )
}

function WorkCenter({ posts, staffName, onUpdate, onDelete, flash }) {
  const [mineOnly, setMineOnly] = useState(false)
  const openPosts = useMemo(() => posts
    .filter(post => post.Status !== STATUS.POSTED)
    .filter(post => !mineOnly || isMyPost(post, staffName))
    .sort((a, b) => (convertToDate(a.DateScheduled)?.getTime() || Infinity) - (convertToDate(b.DateScheduled)?.getTime() || Infinity)), [posts, staffName, mineOnly])

  async function markPosted(post) {
    const res = await onUpdate(post.ID, { Status: STATUS.POSTED, DatePosted: new Date().toISOString() })
    flash(res?.success === false ? "บันทึกไม่สำเร็จ" : "บันทึกว่างานลงแล้ว")
  }

  return (
    <section>
      <div className="staff-section-head">
        <div>
          <h2>ศูนย์งาน</h2>
          <p>งานที่ยังต้องจัดการ เรียงจากกำหนดที่ใกล้ที่สุด</p>
        </div>
        <button className={`pill ${mineOnly ? "on" : ""}`} onClick={() => setMineOnly(v => !v)}>
          <i className="ti ti-user-check" style={{ marginRight: 6 }}></i>เฉพาะงานของฉัน
        </button>
      </div>
      <PostGrid posts={openPosts} onPosted={markPosted} onDelete={onDelete} flash={flash} />
    </section>
  )
}

function SubmitWork({ staffName, createSubmission, flash }) {
  const [form, setForm] = useState(emptySubmission)
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    if (!form.Title || !form.SubmissionType) return flash("กรุณากรอกหัวข้อและประเภทงาน")
    if (form.SubmissionType === "บทความ" && !form.SubmissionContent) return flash("กรุณากรอกเนื้อหาบทความ")
    if (form.SubmissionType !== "บทความ" && !form.SubmissionLink) return flash("กรุณาใส่ลิงก์ไฟล์")
    setBusy(true)
    const res = await createSubmission({
      ...form,
      ContentAuthor: staffName,
      Status: SUBMISSION_STATUS.PENDING_REVIEW,
      DateSubmitted: new Date().toISOString(),
    })
    setBusy(false)
    if (res.error) return flash("ส่งงานไม่สำเร็จ")
    setForm(emptySubmission)
    flash("ส่งงานเรียบร้อย")
  }

  return (
    <form className="card staff-form" onSubmit={submit}>
      <div className="staff-section-head">
        <div>
          <h2>ส่งงานใหม่</h2>
          <p>ส่งบทความ ไฟล์ รูปภาพ คลิป หรือเสียงให้ทีมตรวจต่อ</p>
        </div>
      </div>
      <div className="staff-form-grid">
        <Field label="หัวข้องาน"><input value={form.Title} onChange={e => setForm({ ...form, Title: e.target.value })} /></Field>
        <Field label="ประเภทงาน">
          <select value={form.SubmissionType} onChange={e => setForm({ ...form, SubmissionType: e.target.value })}>
            <option value="">เลือกประเภท</option>
            {SUBMISSION_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
          </select>
        </Field>
      </div>
      <Field label="ลิงก์ไฟล์หรือโพสต์ต้นทาง"><input value={form.SubmissionLink} onChange={e => setForm({ ...form, SubmissionLink: e.target.value })} placeholder="https://..." /></Field>
      <Field label="เนื้อหา / รายละเอียด">
        <textarea rows="7" value={form.SubmissionContent} onChange={e => setForm({ ...form, SubmissionContent: e.target.value })} />
      </Field>
      <div className="staff-form-actions">
        <button className="btn btn-teal" disabled={busy} type="submit">
          <i className="ti ti-send" style={{ marginRight: 6 }}></i>{busy ? "กำลังส่ง..." : "ส่งงาน"}
        </button>
      </div>
    </form>
  )
}

function ReviewQueue({ submissions, staffName, isAdmin, updateSubmission, deleteSubmission, flash }) {
  const visible = useMemo(() => {
    const list = isAdmin ? submissions : submissions.filter(item => item.ContentAuthor === staffName)
    return [...list].sort((a, b) => (convertToDate(b.DateSubmitted)?.getTime() || 0) - (convertToDate(a.DateSubmitted)?.getTime() || 0))
  }, [submissions, staffName, isAdmin])

  async function setStatus(item, status) {
    const feedback = status === SUBMISSION_STATUS.NEEDS_REVISION ? window.prompt("ฟีดแบ็กสำหรับคนส่งงาน", item.CheckerFeedback || "") : item.CheckerFeedback
    const res = await updateSubmission(item.SubID, { Status: status, CheckerFeedback: feedback || "" })
    flash(res?.success === false ? "อัปเดตไม่สำเร็จ" : "อัปเดตสถานะแล้ว")
  }

  async function remove(item) {
    if (!window.confirm("ลบรายการนี้?")) return
    const res = await deleteSubmission(item.SubID)
    flash(res?.success === false ? "ลบไม่สำเร็จ" : "ลบรายการแล้ว")
  }

  return (
    <section>
      <div className="staff-section-head">
        <div>
          <h2>กล่องส่งงาน</h2>
          <p>{isAdmin ? "ตรวจงานที่ทีมส่งเข้ามา" : "ติดตามงานที่คุณส่งให้ทีมตรวจ"}</p>
        </div>
      </div>
      <div className="staff-card-grid">
        {visible.map(item => (
          <article key={item.SubID} className="card staff-task-card">
            <div className="staff-card-top">
              <span className={`staff-status ${statusTone(item.Status)}`}>{statusLabel(item.Status)}</span>
              <span>{formatDate(item.DateSubmitted, false)}</span>
            </div>
            <h3>{item.Title}</h3>
            <p>{item.SubmissionType} · {item.ContentAuthor || "-"}</p>
            {item.CheckerFeedback && <div className="staff-feedback">{item.CheckerFeedback}</div>}
            <div className="staff-card-actions">
              {item.SubmissionLink && <a className="btn btn-outline" href={item.SubmissionLink} target="_blank" rel="noreferrer">เปิดลิงก์</a>}
              {isAdmin && item.Status !== SUBMISSION_STATUS.APPROVED && (
                <>
                  <button className="btn btn-outline" onClick={() => setStatus(item, SUBMISSION_STATUS.NEEDS_REVISION)}>ตีกลับ</button>
                  <button className="btn btn-teal" onClick={() => setStatus(item, SUBMISSION_STATUS.APPROVED)}>อนุมัติ</button>
                </>
              )}
              {(isAdmin || item.ContentAuthor === staffName) && <button className="btn btn-outline danger" onClick={() => remove(item)}>ลบ</button>}
            </div>
          </article>
        ))}
        {visible.length === 0 && <div className="empty">ยังไม่มีรายการส่งงาน</div>}
      </div>
    </section>
  )
}

function ArchiveView({ posts, staffName, createPost, updatePost, deletePost, flash, CATEGORIES }) {
  const [form, setForm] = useState({ ...emptyPost, ResponsibleAdmin: staffName })
  const [query, setQuery] = useState("")
  const [busy, setBusy] = useState(false)
  const filtered = useMemo(() => posts.filter(post => !query || `${post.Title} ${post.Category}`.toLowerCase().includes(query.toLowerCase())), [posts, query])

  async function submit(e) {
    e.preventDefault()
    if (!form.Title || !form.Category) return flash("กรุณากรอกหัวข้อและหมวดหมู่")
    setBusy(true)
    const res = await createPost({
      ...form,
      Status: STATUS.PENDING,
      CreatedBy: staffName,
      DateCreated: new Date().toISOString(),
    })
    setBusy(false)
    if (res.error) return flash("เพิ่มงานไม่สำเร็จ")
    setForm({ ...emptyPost, ResponsibleAdmin: staffName })
    flash("เพิ่มงานแล้ว")
  }

  async function markPosted(post) {
    const res = await updatePost(post.ID, { Status: STATUS.POSTED, DatePosted: new Date().toISOString() })
    flash(res?.success === false ? "บันทึกไม่สำเร็จ" : "บันทึกว่างานลงแล้ว")
  }

  return (
    <section>
      <div className="staff-archive-layout">
        <form className="card staff-form" onSubmit={submit}>
          <h2>เพิ่มงานเข้าคลัง</h2>
          <Field label="หัวข้อ"><input value={form.Title} onChange={e => setForm({ ...form, Title: e.target.value })} /></Field>
          <Field label="หมวดหมู่">
            <select value={form.Category} onChange={e => setForm({ ...form, Category: e.target.value })}>
              <option value="">เลือกหมวดหมู่</option>
              {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </Field>
          <Field label="กำหนดลง"><input type="datetime-local" value={form.DateScheduled} onChange={e => setForm({ ...form, DateScheduled: e.target.value })} /></Field>
          <Field label="แพลตฟอร์ม">
            <div className="staff-choice-row">
              {PLATFORMS.map(platform => (
                <button key={platform} type="button" className={`pill ${form.Platforms.includes(platform) ? "on" : ""}`} onClick={() => setForm(prev => ({ ...prev, Platforms: toggle(prev.Platforms, platform) }))}>
                  {platform}
                </button>
              ))}
            </div>
          </Field>
          <Field label="เนื้อหา"><textarea rows="5" value={form.Content} onChange={e => setForm({ ...form, Content: e.target.value })} /></Field>
          <button className="btn btn-teal" disabled={busy} type="submit">เพิ่มงาน</button>
        </form>
        <div>
          <div className="staff-section-head">
            <div>
              <h2>คลังงาน</h2>
              <p>รายการทั้งหมดจากตารางงาน</p>
            </div>
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="ค้นหา..." style={{ maxWidth: 220 }} />
          </div>
          <PostGrid posts={filtered} onPosted={markPosted} onDelete={deletePost} flash={flash} compact />
        </div>
      </div>
    </section>
  )
}

function MagazineQueue({ staffName }) {
  const currentMonth = new Date().getMonth()
  return (
    <section>
      <div className="staff-section-head">
        <div>
          <h2>คิววารสาร</h2>
          <p>ตารางเวรวารสารรายเดือนของทีม</p>
        </div>
      </div>
      <div className="staff-mag-grid">
        {MAGAZINE_QUEUE.map((item, index) => (
          <div key={item.month} className={`card staff-mag-card ${index === currentMonth ? "current" : ""} ${item.user === staffName ? "mine" : ""}`}>
            <span>{item.month}</span>
            <strong>{item.user}</strong>
            {index === currentMonth && <em>เดือนนี้</em>}
          </div>
        ))}
      </div>
    </section>
  )
}

function StaffProfile({ staffName, posts }) {
  const mine = posts.filter(post => isMyPost(post, staffName))
  const posted = mine.filter(post => post.Status === STATUS.POSTED)
  const currentQueue = MAGAZINE_QUEUE.find(item => item.user === staffName)
  return (
    <section className="card staff-profile-card">
      <div className="profile-avatar">{staffName[0]}</div>
      <h2>{staffName}</h2>
      <p>ทีมงาน Talib Club</p>
      <div className="staff-stat-grid small">
        <StatCard label="งานทั้งหมด" value={mine.length} />
        <StatCard label="ลงแล้ว" value={posted.length} tone="ok" />
        <StatCard label="คิววารสาร" value={currentQueue?.month || "-"} />
      </div>
    </section>
  )
}

function PostGrid({ posts, onPosted, onDelete, flash, compact }) {
  async function remove(post) {
    if (!window.confirm("ลบงานนี้?")) return
    const res = await onDelete(post.ID)
    flash?.(res?.success === false ? "ลบไม่สำเร็จ" : "ลบงานแล้ว")
  }

  return (
    <div className={`staff-card-grid ${compact ? "compact" : ""}`}>
      {posts.map(post => (
        <article key={post.ID} className={`card staff-task-card ${isOverdue(post.DateScheduled, post.Status) ? "late" : ""}`}>
          <div className="staff-card-top">
            <span className={`staff-status ${post.Status === STATUS.POSTED ? "ok" : isOverdue(post.DateScheduled, post.Status) ? "bad" : "warn"}`}>
              {post.Status === STATUS.POSTED ? "ลงแล้ว" : isOverdue(post.DateScheduled, post.Status) ? "เลยกำหนด" : "รอลง"}
            </span>
            <span>{formatDate(post.DateScheduled || post.DateCreated)}</span>
          </div>
          <h3>{post.Title || "ไม่มีหัวข้อ"}</h3>
          <p>{post.Category || "ไม่ระบุหมวดหมู่"}</p>
          {post.Platforms?.length > 0 && (
            <div className="staff-platforms">{post.Platforms.map(item => <span key={item}>{item}</span>)}</div>
          )}
          <div className="staff-role-list">
            <span>Admin: {post.ResponsibleAdmin || "-"}</span>
            <span>Writer: {post.ContentAuthor || "-"}</span>
            <span>Art: {post.PosterDesigner || "-"}</span>
          </div>
          <div className="staff-card-actions">
            {post.PostLink && <a className="btn btn-outline" href={post.PostLink} target="_blank" rel="noreferrer">เปิดโพสต์</a>}
            {post.Status !== STATUS.POSTED && <button className="btn btn-teal" onClick={() => onPosted(post)}>ลงแล้ว</button>}
            <button className="btn btn-outline danger" onClick={() => remove(post)}>ลบ</button>
          </div>
        </article>
      ))}
      {posts.length === 0 && <div className="empty">ยังไม่มีรายการ</div>}
    </div>
  )
}

function StatCard({ label, value, tone = "" }) {
  return (
    <div className={`card staff-stat ${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <label className="staff-field">
      <span>{label}</span>
      {children}
    </label>
  )
}

function useStaffName(authState) {
  const suggested = authState?.profile?.displayName || authState?.user?.displayName || "อุสมาน"
  const initial = STAFF_TEAM.includes(suggested) || ADMIN_TEAM.includes(suggested)
    ? suggested
    : window.localStorage.getItem("talibStaffName") || "อุสมาน"
  const [name, setName] = useState(initial)
  useEffect(() => window.localStorage.setItem("talibStaffName", name), [name])
  return [name, setName]
}

function useSheetPosts(userId) {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const fetchData = useCallback(async () => {
    setLoading(true)
    const result = await fetchFromGAS("Posts")
    if (result.success) {
      setPosts((Array.isArray(result.data) ? result.data : []).map(normalizePost))
      setError("")
    } else {
      setError(result.error || "Cannot load")
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  async function createPost(data) {
    const tempId = `TEMP-${Date.now()}`
    setPosts(prev => [{ ...normalizePost(data), ID: tempId }, ...prev])
    const res = await postToGAS("CREATE", data, userId)
    if (res.success && res.data?.id) setPosts(prev => prev.map(post => post.ID === tempId ? { ...post, ID: res.data.id } : post))
    return res.success ? { success: true } : { error: res.error }
  }

  async function updatePost(id, data) {
    setPosts(prev => prev.map(post => post.ID === id ? normalizePost({ ...post, ...data }) : post))
    return postToGAS("UPDATE", { ID: id, ...data }, userId)
  }

  async function deletePost(id) {
    setPosts(prev => prev.filter(post => post.ID !== id))
    return postToGAS("DELETE", { ID: id }, userId)
  }

  return { posts, loading, error, fetchData, createPost, updatePost, deletePost }
}

function useSheetSubmissions(userId) {
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const fetchData = useCallback(async () => {
    setLoading(true)
    const result = await fetchFromGAS("Submissions")
    if (result.success) {
      setSubmissions((Array.isArray(result.data) ? result.data : []).map(normalizeSubmission))
      setError("")
    } else {
      setError(result.error || "Cannot load")
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  async function createSubmission(data) {
    const tempId = `SUB-${Date.now()}`
    setSubmissions(prev => [{ ...normalizeSubmission(data), SubID: tempId }, ...prev])
    const res = await postToGAS("CREATE_SUBMISSION", data, userId)
    if (res.success && res.data?.id) setSubmissions(prev => prev.map(item => item.SubID === tempId ? { ...item, SubID: res.data.id } : item))
    return res.success ? { success: true } : { error: res.error }
  }

  async function updateSubmission(id, data) {
    setSubmissions(prev => prev.map(item => item.SubID === id ? normalizeSubmission({ ...item, ...data }) : item))
    return postToGAS("UPDATE_SUBMISSION", { SubID: id, ...data }, userId)
  }

  async function deleteSubmission(id) {
    setSubmissions(prev => prev.filter(item => item.SubID !== id))
    return postToGAS("DELETE_SUBMISSION", { SubID: id }, userId)
  }

  return { submissions, loading, error, fetchData, createSubmission, updateSubmission, deleteSubmission }
}

async function fetchFromGAS(sheetName) {
  try {
    const response = await fetch(`${API_BASE_URL}?sheet=${sheetName}&t=${Date.now()}`)
    const text = await response.text()
    const data = JSON.parse(text)
    return { success: true, data: data.error ? [] : data }
  } catch (err) {
    return { success: false, error: err.message }
  }
}

async function postToGAS(method, payload, userId) {
  try {
    const body = { ...payload, LastUpdatedBy: userId }
    if (Array.isArray(body.Platforms)) body.Platforms = body.Platforms.join(",")
    const response = await fetch(API_BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify({ method, payload: body }),
    })
    const data = JSON.parse(await response.text())
    if (data.error) return { success: false, error: data.error }
    return { success: true, data }
  } catch (err) {
    return { success: false, error: err.message }
  }
}

function normalizePost(post) {
  return {
    ...post,
    DateScheduled: convertToDate(post.DateScheduled),
    DatePosted: convertToDate(post.DatePosted),
    DateCreated: convertToDate(post.DateCreated),
    Platforms: Array.isArray(post.Platforms) ? post.Platforms : post.Platforms ? String(post.Platforms).split(",").filter(Boolean) : [],
  }
}

function normalizeSubmission(item) {
  return {
    ...item,
    DateSubmitted: convertToDate(item.DateSubmitted),
  }
}

function getStats(posts, submissions, staffName, isAdmin) {
  const visibleSubs = isAdmin ? submissions : submissions.filter(item => item.ContentAuthor === staffName)
  return {
    pending: posts.filter(post => post.Status !== STATUS.POSTED && !isOverdue(post.DateScheduled, post.Status)).length,
    posted: posts.filter(post => post.Status === STATUS.POSTED).length,
    overdue: posts.filter(post => isOverdue(post.DateScheduled, post.Status)).length,
    review: visibleSubs.filter(item => item.Status === SUBMISSION_STATUS.PENDING_REVIEW).length,
  }
}

function convertToDate(value) {
  if (!value) return null
  if (value instanceof Date) return value
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function formatDate(value, includeTime = true) {
  const date = convertToDate(value)
  if (!date) return "ยังไม่กำหนด"
  return date.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: includeTime ? "2-digit" : undefined,
    minute: includeTime ? "2-digit" : undefined,
  })
}

function isOverdue(date, status) {
  const target = convertToDate(date)
  return status !== STATUS.POSTED && target && target < new Date()
}

function isMyPost(post, staffName) {
  return post.ResponsibleAdmin === staffName || post.ContentAuthor === staffName || post.PosterDesigner === staffName
}

function statusLabel(status) {
  if (status === SUBMISSION_STATUS.NEEDS_REVISION) return "ต้องแก้ไข"
  if (status === SUBMISSION_STATUS.APPROVED) return "อนุมัติแล้ว"
  return "รอตรวจ"
}

function statusTone(status) {
  if (status === SUBMISSION_STATUS.NEEDS_REVISION) return "warn"
  if (status === SUBMISSION_STATUS.APPROVED) return "ok"
  return "info"
}

function toggle(list, item) {
  return list.includes(item) ? list.filter(value => value !== item) : [...list, item]
}