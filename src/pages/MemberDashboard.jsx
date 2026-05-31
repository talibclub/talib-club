import { useEffect, useState, useMemo } from "react"
import toast from 'react-hot-toast'
import { ARTICLES } from "../data/index.js"
import { useContentCollection } from "../lib/contentStore.js"

export default function MemberDashboard({ authState, go, initialView = "overview" }) {
  const [view, setView] = useState("overview")
  const [copied, setCopied] = useState("")
  
  const user = authState?.user
  const profile = authState?.profile || {}
  const name = profile.displayName || user?.displayName || user?.email || "สมาชิก"
  const role = profile.role || "member"

  useEffect(() => {
    if (initialView) setView(initialView)
  }, [initialView])

  async function copyText(label, value) {
    if (!value) return
    try {
      await navigator.clipboard.writeText(value)
      setCopied(label)
      toast.success("คัดลอกข้อความแล้ว")
      window.setTimeout(() => setCopied(""), 1800)
    } catch (err) {
      toast.error("คัดลอกไม่สำเร็จ")
      setCopied("")
    }
  }

  const handleLogout = async () => {
    const isConfirm = window.confirm("คุณแน่ใจหรือไม่ว่าต้องการออกจากระบบ?");
    if (!isConfirm) return;
    const toastId = toast.loading("กำลังออกจากระบบ...");
    setTimeout(async () => {
      try {
        if (authState?.logout) await authState.logout();
        toast.success("ออกจากระบบสำเร็จ", { id: toastId });
        window.location.href = "/";
      } catch (error) {
        toast.error("เกิดข้อผิดพลาดในการออกจากระบบ", { id: toastId });
      }
    }, 600);
  };

  return (
    <div className="member-page">
      <div className="member-hero">
        <div>
          <span className="badge badge-teal">{role === "staff" ? "Staff" : "Member"}</span>
          <h1>ยินดีต้อนรับ, {name}</h1>
          <p>พื้นที่สมาชิกสำหรับติดตามการอ่าน บันทึกหนังสือ และจัดการข้อมูลบัญชี Talib Club</p>
        </div>
        <div className="member-actions">
          <button className="btn btn-outline" onClick={handleLogout}>
            <i className="ti ti-logout" style={{ marginRight: 6 }}></i>ออกจากระบบ
          </button>
        </div>
      </div>

      <div className="member-tabs" aria-label="เมนูสมาชิก">
        <button className={`pill ${view === "overview" ? "on" : ""}`} onClick={() => setView("overview")}>แดชบอร์ด</button>
        <button className={`pill ${view === "saved-articles" ? "on" : ""}`} onClick={() => setView("saved-articles")}>บทความที่บันทึกไว้</button>
        <button className={`pill ${view === "profile" ? "on" : ""}`} onClick={() => setView("profile")}>โปรไฟล์</button>
      </div>

      {view === "overview" && <Overview authState={authState} go={go} setView={setView} />}
      {view === "saved-articles" && <SavedArticlesPanel authState={authState} go={go} />}
      {view === "profile" && <ProfilePanel authState={authState} copied={copied} copyText={copyText} go={go} />}
    </div>
  )
}

function Overview({ authState, go, setView }) {
  return (
    <div>
      <div className="grid3">
        <DashboardCard icon="ti-user-circle" title="โปรไฟล์ของฉัน" text="จัดการข้อมูลบัญชี" onClick={() => setView("profile")} />
        <DashboardCard icon="ti-book-2" title="ชั้นหนังสือของฉัน" text="บันทึกหนังสือที่กำลังอ่านและอ่านจบ" />
        <DashboardCard icon="ti-flame" title="Reading Streak" text="ติดตามวันที่อ่านต่อเนื่อง" />
        <DashboardCard 
          icon="ti-bookmark" 
          title="บทความที่บันทึกไว้" 
          text="เก็บบทความที่อยากกลับมาอ่านภายหลัง" 
          onClick={() => setView("saved-articles")} 
        />
        <DashboardCard icon="ti-bell" title="การแจ้งเตือน" text="ข่าวสาร กิจกรรม และหนังสือใหม่" />
      </div>
    </div>
  )
}

// แผงแสดงผลบทความบุ๊กมาร์กจริงจากคอลเลกชันใน Firestore พร้อมระบบกรองข้อมูลและค้นหาขั้นสูง
const THAI_MONTHS = [
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
  "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
];

const CATEGORY_MAP = {
  aqeedah: "อากีดะฮ์",
  fiqh: "ฟิกฮ์",
  seerah: "ซีเราะฮ์",
  hadith: "ฮะดีษ",
  social: "สังคมศาสตร์",
  tafsir: "ตัฟซีร"
};

const TYPE_MAP = {
  series: "ซีรีส์",
  general: "บทความทั่วไป",
  specific: "บทความเฉพาะเรื่อง",
  social: "สังคมศาสตร์"
};

function getArticleMonthString(dateStr) {
  if (!dateStr) return "ไม่ระบุเวลา";
  const parts = dateStr.split("-");
  if (parts.length >= 2) {
    const y = parseInt(parts[0]);
    const m = parseInt(parts[1]) - 1;
    if (m >= 0 && m < 12) {
      return `${THAI_MONTHS[m]} ${y}`;
    }
  }
  return "ไม่ระบุเวลา";
}

function getSavedMonthString(date) {
  if (!date || isNaN(date.getTime())) return "ไม่ระบุเวลา";
  const month = THAI_MONTHS[date.getMonth()];
  const year = date.getFullYear() + 543; // ปี พ.ศ.
  return `${month} ${year}`;
}

function SavedArticlesPanel({ authState, go }) {
  const { items: articles, loading: loadingArticles } = useContentCollection("articles", ARTICLES)
  const { items: bookmarks, loading: loadingBookmarks } = useContentCollection("bookmarks", [])
  
  const uid = authState?.user?.uid;

  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [authorFilter, setAuthorFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [monthFilter, setMonthFilter] = useState("all")
  const [sortBy, setSortBy] = useState("newest_saved")

  const savedArticlesWithBookmarkInfo = useMemo(() => {
    if (!uid) return [];
    const userBookmarks = bookmarks.filter(b => b.uid === uid);
    
    return userBookmarks.map(b => {
      const art = articles.find(a => a.id === b.articleId);
      if (!art) return null;
      
      let savedAtDate = null;
      if (b.savedAt) {
        if (b.savedAt.toDate) {
          savedAtDate = b.savedAt.toDate();
        } else if (b.savedAt.seconds) {
          savedAtDate = new Date(b.savedAt.seconds * 1000);
        } else {
          savedAtDate = new Date(b.savedAt);
        }
      }
      
      const savedMonthStr = savedAtDate ? getSavedMonthString(savedAtDate) : getArticleMonthString(art.date);
      
      return {
        ...art,
        bookmarkId: b.id,
        savedAtDate,
        savedMonthStr
      };
    }).filter(Boolean);
  }, [articles, bookmarks, uid])

  const categories = useMemo(() => {
    const cats = new Set(savedArticlesWithBookmarkInfo.map(a => a.category).filter(Boolean));
    return Array.from(cats);
  }, [savedArticlesWithBookmarkInfo]);

  const authors = useMemo(() => {
    const auts = new Set(savedArticlesWithBookmarkInfo.map(a => a.author).filter(Boolean));
    return Array.from(auts);
  }, [savedArticlesWithBookmarkInfo]);

  const types = useMemo(() => {
    const typs = new Set(savedArticlesWithBookmarkInfo.map(a => a.type).filter(Boolean));
    return Array.from(typs);
  }, [savedArticlesWithBookmarkInfo]);

  const months = useMemo(() => {
    const mths = new Set(savedArticlesWithBookmarkInfo.map(a => a.savedMonthStr).filter(Boolean));
    return Array.from(mths).sort((a, b) => b.localeCompare(a));
  }, [savedArticlesWithBookmarkInfo]);

  const filteredArticles = useMemo(() => {
    let result = [...savedArticlesWithBookmarkInfo];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(a => 
        a.title.toLowerCase().includes(q) ||
        (a.excerpt && a.excerpt.toLowerCase().includes(q)) ||
        (a.author && a.author.toLowerCase().includes(q)) ||
        (a.tags && a.tags.some(t => t.toLowerCase().includes(q)))
      );
    }

    if (categoryFilter !== "all") {
      result = result.filter(a => a.category === categoryFilter);
    }

    if (authorFilter !== "all") {
      result = result.filter(a => a.author === authorFilter);
    }

    if (typeFilter !== "all") {
      result = result.filter(a => a.type === typeFilter);
    }

    if (monthFilter !== "all") {
      result = result.filter(a => a.savedMonthStr === monthFilter);
    }

    result.sort((a, b) => {
      if (sortBy === "newest_saved") {
        const timeA = a.savedAtDate ? a.savedAtDate.getTime() : 0;
        const timeB = b.savedAtDate ? b.savedAtDate.getTime() : 0;
        return timeB - timeA;
      }
      if (sortBy === "oldest_saved") {
        const timeA = a.savedAtDate ? a.savedAtDate.getTime() : 0;
        const timeB = b.savedAtDate ? b.savedAtDate.getTime() : 0;
        return timeA - timeB;
      }
      if (sortBy === "newest_article") {
        return b.date.localeCompare(a.date);
      }
      if (sortBy === "oldest_article") {
        return a.date.localeCompare(b.date);
      }
      return 0;
    });

    return result;
  }, [savedArticlesWithBookmarkInfo, search, categoryFilter, authorFilter, typeFilter, monthFilter, sortBy]);

  const hasActiveFilters = search || categoryFilter !== "all" || authorFilter !== "all" || typeFilter !== "all" || monthFilter !== "all";

  const clearFilters = () => {
    setSearch("");
    setCategoryFilter("all");
    setAuthorFilter("all");
    setTypeFilter("all");
    setMonthFilter("all");
    setSortBy("newest_saved");
  };

  if (loadingArticles || loadingBookmarks) return <div style={{textAlign: "center", padding: 40}}><i className="ti ti-loader-2 spin" style={{fontSize: 24, color: "var(--teal)"}}></i></div>

  return (
    <div className="profile-layout">
      <div className="card" style={{ padding: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
           <div style={{ width: 44, height: 44, borderRadius: 12, background: "var(--teal-bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
             <i className="ti ti-bookmark-filled" style={{ color: "var(--teal)", fontSize: 20 }}></i>
           </div>
           <div>
             <h2 style={{ fontSize: 18 }}>บทความที่บันทึกไว้</h2>
             <p style={{ fontSize: 12, color: "var(--t2)", marginTop: 2 }}>{filteredArticles.length} รายการ จากทั้งหมด {savedArticlesWithBookmarkInfo.length} รายการ</p>
           </div>
        </div>

        {savedArticlesWithBookmarkInfo.length === 0 ? (
          <div className="empty" style={{ padding: "40px 0" }}>คุณยังไม่ได้บันทึกบทความใดๆ ไว้เลย</div>
        ) : (
          <>
            {/* ส่วนค้นหาและตัวกรอง */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24, paddingBottom: 16, borderBottom: "0.5px solid var(--br2)" }}>
              {/* แถบหลัก: ค้นหาและเรียงลำดับ */}
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <div style={{ position: "relative", flex: 1, minWidth: 260 }}>
                  <i className="ti ti-search" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--t3)", fontSize: 14 }}></i>
                  <input 
                    placeholder="ค้นหาชื่อบทความ, ผู้เขียน, หรือคำสำคัญ..." 
                    value={search} 
                    onChange={e => setSearch(e.target.value)} 
                    style={{ paddingLeft: 36, width: "100%", height: 38 }} 
                  />
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  <select 
                    value={sortBy} 
                    onChange={e => setSortBy(e.target.value)} 
                    style={{ padding: "8px 12px", fontSize: 13, borderRadius: 8, border: "0.5px solid var(--br)", background: "var(--card)", color: "var(--text)", height: 38 }}
                  >
                    <option value="newest_saved">บันทึกล่าสุด</option>
                    <option value="oldest_saved">บันทึกเก่าสุด</option>
                    <option value="newest_article">บทความใหม่สุด</option>
                    <option value="oldest_article">บทความเก่าสุด</option>
                  </select>
                  {hasActiveFilters && (
                    <button className="btn btn-outline" onClick={clearFilters} style={{ padding: "6px 14px", display: "flex", alignItems: "center", gap: 6, fontSize: 12, height: 38, borderRadius: 8 }}>
                      <i className="ti ti-rotate-clockwise"></i> ล้างตัวกรอง
                    </button>
                  )}
                </div>
              </div>

              {/* ตัวกรองย่อยเพิ่มเติม */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 10 }}>
                <div>
                  <label style={{ display: "block", fontSize: 10, color: "var(--t2)", marginBottom: 4, fontWeight: 500 }}>หมวดหมู่</label>
                  <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} style={{ width: "100%", padding: "6px 10px", fontSize: 12, borderRadius: 6, border: "0.5px solid var(--br)", background: "var(--card)", color: "var(--text)", height: 32 }}>
                    <option value="all">ทั้งหมด</option>
                    {categories.map(c => <option key={c} value={c}>{CATEGORY_MAP[c] || c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 10, color: "var(--t2)", marginBottom: 4, fontWeight: 500 }}>ประเภท</label>
                  <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} style={{ width: "100%", padding: "6px 10px", fontSize: 12, borderRadius: 6, border: "0.5px solid var(--br)", background: "var(--card)", color: "var(--text)", height: 32 }}>
                    <option value="all">ทุกประเภท</option>
                    {types.map(t => <option key={t} value={t}>{TYPE_MAP[t] || t}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 10, color: "var(--t2)", marginBottom: 4, fontWeight: 500 }}>ผู้เขียน</label>
                  <select value={authorFilter} onChange={e => setAuthorFilter(e.target.value)} style={{ width: "100%", padding: "6px 10px", fontSize: 12, borderRadius: 6, border: "0.5px solid var(--br)", background: "var(--card)", color: "var(--text)", height: 32 }}>
                    <option value="all">ทุกคน</option>
                    {authors.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 10, color: "var(--t2)", marginBottom: 4, fontWeight: 500 }}>เดือนที่บันทึก</label>
                  <select value={monthFilter} onChange={e => setMonthFilter(e.target.value)} style={{ width: "100%", padding: "6px 10px", fontSize: 12, borderRadius: 6, border: "0.5px solid var(--br)", background: "var(--card)", color: "var(--text)", height: 32 }}>
                    <option value="all">ทุกช่วงเวลา</option>
                    {months.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {filteredArticles.length === 0 ? (
              <div className="empty" style={{ padding: "40px 0" }}>ไม่พบรายการที่ตรงกับตัวกรองที่เลือก</div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 12 }}>
                {filteredArticles.map(a => (
                  <div key={a.id} className="card" style={{ cursor: "pointer", padding: 16, display: "flex", flexDirection: "column" }} onClick={() => go("article", a)}>
                    <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
                      <span className="tag tag-teal">{CATEGORY_MAP[a.category] || a.category}</span>
                      <span className="tag tag-acc">{TYPE_MAP[a.type] || a.type}</span>
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: "var(--text)", marginBottom: 8, lineHeight: 1.45 }}>{a.title}</div>
                    <div style={{ marginTop: "auto", fontSize: 11, color: "var(--t3)" }}>
                      {a.author} · {a.date}
                      {a.savedAtDate && <div style={{ fontSize: 10, color: "var(--teal)", marginTop: 4 }}><i className="ti ti-bookmark" style={{ marginRight: 2 }}></i>บันทึกเมื่อ: {getSavedMonthString(a.savedAtDate)}</div>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function ProfilePanel({ authState, copied, copyText, go }) {
  const user = authState?.user
  const profile = authState?.profile || {}
  const role = profile.role || "member"
  const displayName = profile.displayName || user?.displayName || "-"
  const email = user?.email || profile.email || "-"
  const photoURL = user?.photoURL || ""
  const isStaff = role === "staff"
  
  const [form, setForm] = useState({
    displayName: displayName === "-" ? "" : displayName,
    email,
    password: "",
  })
  const [busy, setBusy] = useState("")

  useEffect(() => {
    setForm({
      displayName: displayName === "-" ? "" : displayName,
      email,
      password: "",
    })
  }, [displayName, email])

  const set = (key, value) => setForm(prev => ({ ...prev, [key]: value }))

  async function saveProfile(e) {
    e.preventDefault()
    setBusy("profile")
    try {
      if (authState?.updateUserProfile) {
         await authState.updateUserProfile({
           displayName: form.displayName,
         })
      }
      toast.success("บันทึกโปรไฟล์เรียบร้อยแล้ว!")
    } catch (err) {
      toast.error("บันทึกโปรไฟล์ไม่สำเร็จ กรุณาลองใหม่")
    }
    setBusy("")
  }

  return (
    <div className="profile-layout">
      <form className="card profile-card" onSubmit={saveProfile}>
        <div className="profile-head">
          <div className="profile-avatar" style={{ overflow: "hidden" }}>
            {photoURL ? <img src={photoURL} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : initials(displayName, email)}
          </div>
          <div>
            <span className={`badge ${isStaff ? "badge-teal" : "badge-acc"}`}>{isStaff ? "Staff" : "Member"}</span>
            <h2>{displayName}</h2>
            <p>{email}</p>
          </div>
        </div>

        <section className="profile-section">
          <div className="profile-section-head">
            <div>
              <h3>ข้อมูลส่วนตัว</h3>
              <p>ชื่อส่วนนี้จะแสดงบนหน้าโปรไฟล์และแดชบอร์ดของคุณ</p>
            </div>
          </div>
          <label style={fieldStyle}>
            <span>ชื่อที่แสดง</span>
            <input value={form.displayName} onChange={e => set("displayName", e.target.value)} placeholder="ชื่อที่ต้องการแสดง" />
          </label>
          <div className="profile-actions">
            <button className="btn btn-teal" disabled={busy === "profile"} type="submit">
              <i className="ti ti-device-floppy" style={{ marginRight: 6 }}></i>{busy === "profile" ? "กำลังบันทึก..." : "บันทึกโปรไฟล์"}
            </button>
          </div>
        </section>
      </form>
    </div>
  )
}

function DashboardCard({ icon, title, text, onClick }) {
  const Tag = onClick ? "button" : "div"
  return (
    <Tag onClick={onClick} className="card dashboard-card">
      <i className={`ti ${icon}`}></i>
      <h2>{title}</h2>
      <p>{text}</p>
    </Tag>
  )
}

function initials(name, email) {
  const source = name && name !== "-" ? name : email
  return source.split(/\s|@/).filter(Boolean).slice(0, 2).map(part => part[0]?.toUpperCase()).join("") || "TC"
}

function formEmailChanged(nextEmail, currentEmail) {
  return nextEmail?.trim().toLowerCase() !== currentEmail?.trim().toLowerCase()
}

const fieldStyle = { display: "grid", gap: 6, marginTop: 12, fontSize: 12, color: "var(--t2)" }