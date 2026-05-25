import { useEffect, useState } from "react"
import { ARTICLES } from "../data/index.js"

const READER_DEFAULTS = { size: "md", tone: "3" }
const READER_STORAGE_KEY = "talibReaderPrefs"
const READER_SIZE_LABELS = { sm: "ก-", md: "ก", lg: "ก+" }
const READER_TONE_LABELS = { 1: "1", 2: "2", 3: "3", 4: "4", 5: "5" }

export default function ArticleDetail({ item, go }) {
  const [readerPrefs, setReaderPrefs] = useState(() => getSavedReaderPrefs())

  useEffect(() => {
    window.localStorage.setItem(READER_STORAGE_KEY, JSON.stringify(readerPrefs))
  }, [readerPrefs])

  if (!item) { go("articles"); return null }
  const related = ARTICLES.filter(a=>a.id!==item.id&&a.category===item.category).slice(0,3)
  const readerClass = `article-body reader-size-${readerPrefs.size} reader-tone-${readerPrefs.tone}`

  return (
    <div className="article-page">
      <button className="btn btn-outline" onClick={()=>go("articles")}
        style={{marginBottom:24,padding:"6px 14px",fontSize:12}}>
        <i className="ti ti-arrow-left" style={{marginRight:6,fontSize:12}}></i>กลับ
      </button>

      <div style={{marginBottom:24}}>
        <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>
          <span className="tag tag-teal">{item.category}</span>
          {item.type==="series"&&<span className="tag tag-acc">ซีรีส์ {item.seriesId} ตอน {item.part}</span>}
          {item.type==="specific"&&item.seriesName&&<span className="tag tag-acc">{item.seriesName}</span>}
        </div>
        <h1 className="article-title">{item.title}</h1>
        <div style={{display:"flex",gap:16,color:"var(--t3)",fontSize:12,fontWeight:300,flexWrap:"wrap"}}>
          <span><i className="ti ti-user" style={{marginRight:4,fontSize:11}}></i>{item.author}</span>
          <span><i className="ti ti-calendar" style={{marginRight:4,fontSize:11}}></i>{item.date}</span>
          <span><i className="ti ti-clock" style={{marginRight:4,fontSize:11}}></i>{item.readTime} นาทีอ่าน</span>
        </div>
      </div>

      <div className="divider"/>

      <div className="reader-tools" aria-label="ตัวเลือกการอ่าน">
        <div className="reader-control" aria-label="ขนาดตัวอักษร">
          {Object.entries(READER_SIZE_LABELS).map(([value, label]) => (
            <button
              key={value}
              type="button"
              className={`reader-btn ${readerPrefs.size === value ? "on" : ""}`}
              onClick={() => setReaderPrefs(prev => ({ ...prev, size: value }))}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="reader-control" aria-label="ความเข้มตัวอักษร">
          {Object.entries(READER_TONE_LABELS).map(([value, label]) => (
            <button
              key={value}
              type="button"
              className={`reader-btn ${readerPrefs.tone === value ? "on" : ""}`}
              onClick={() => setReaderPrefs(prev => ({ ...prev, tone: value }))}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* EXCERPT */}
      <div className="article-excerpt">
        <p>{item.excerpt}</p>
      </div>

      {/* BODY */}
      <div className={readerClass}>
        {item.body.split("\n\n").map((para,i)=>(
          <p key={i}>{para}</p>
        ))}
      </div>

      {/* TAGS */}
      {item.tags && (
        <div style={{marginTop:32,display:"flex",gap:6,flexWrap:"wrap"}}>
          {item.tags.map(t=>(
            <span key={t} className="tag tag-acc" style={{fontSize:11}}>#{t}</span>
          ))}
        </div>
      )}

      {/* RELATED */}
      {related.length > 0 && (
        <div style={{marginTop:40}}>
          <div className="divider"/>
          <div className="sec-hd" style={{marginBottom:14}}>
            <span className="sec-title">บทความที่เกี่ยวข้อง</span>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {related.map(r=>(
              <div key={r.id} className="card" style={{padding:"12px 16px",cursor:"pointer",
                display:"flex",alignItems:"center",justifyContent:"space-between"}}
                onClick={()=>go("article",r)}>
                <div>
                  <span className="tag tag-teal" style={{marginRight:8}}>{r.category}</span>
                  <span style={{fontSize:13,color:"var(--text)",fontWeight:400}}>{r.title}</span>
                </div>
                <i className="ti ti-arrow-right" style={{color:"var(--t3)",flexShrink:0}}></i>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function getSavedReaderPrefs() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(READER_STORAGE_KEY) || "{}")
    return {
      size: READER_SIZE_LABELS[saved.size] ? saved.size : READER_DEFAULTS.size,
      tone: READER_TONE_LABELS[saved.tone] ? saved.tone : READER_DEFAULTS.tone,
    }
  } catch {
    return READER_DEFAULTS
  }
}
