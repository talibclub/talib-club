import { useState } from "react"
import { ARTICLES, DEFAULT_TAXONOMY } from "../data/index.js"
import { useContentCollection, useTaxonomySettings } from "../lib/contentStore.js"

export default function Articles({ go }) {
  const { items: articles, loading } = useContentCollection("articles", ARTICLES)
  const { taxonomy } = useTaxonomySettings(DEFAULT_TAXONOMY)
  const [cat, setCat] = useState("all")
  const [search, setSearch] = useState("")
  const [type, setType] = useState("all")

  const types = [{ id: "all", label: "ทั้งหมด" }, ...(taxonomy.articleTypes || [])]
  const categories = [{ id: "all", label: "ทั้งหมด" }, ...(taxonomy.articleCategories || [])]

  const filtered = articles.filter(a=>{
    const matchCat = cat==="all" || a.category===cat
    const matchType = type==="all" || a.type===type
    const matchSearch = !search || a.title.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchType && matchSearch
  })

  const seriesGroups = (taxonomy.articleSeries || []).map(s=>({
    ...s, articles: articles.filter(a=>a.type==="series"&&a.seriesId===s.id)
  })).filter(s=>s.articles.length>0)

  return (
    <div>
      <div style={{marginBottom:28}}>
        <h1 style={{marginBottom:8}}>บทความ</h1>
        <p>คลังบทความวิชาการอิสลาม จัดหมวดหมู่และซีรีส์ให้ค้นหาง่าย</p>
        {loading && <p style={{ marginTop: 8, fontSize: 12 }}>กำลังโหลดบทความล่าสุด...</p>}
      </div>

      {/* SEARCH + FILTER */}
      <div style={{display:"flex",gap:10,marginBottom:20,flexWrap:"wrap"}}>
        <div style={{position:"relative",flex:1,minWidth:200}}>
          <i className="ti ti-search" style={{position:"absolute",left:10,top:"50%",
            transform:"translateY(-50%)",color:"var(--t3)",fontSize:14}}></i>
          <input placeholder="ค้นหาบทความ..." value={search}
            onChange={e=>setSearch(e.target.value)}
            style={{paddingLeft:32}}/>
        </div>
        <select value={type} onChange={e=>setType(e.target.value)} style={{width:"auto",flex:"0 0 auto"}}>
          {types.map(t=><option key={t.id} value={t.id}>{t.label}</option>)}
        </select>
      </div>

      {/* CATEGORY TABS */}
      <div style={{display:"flex",gap:6,marginBottom:24,flexWrap:"wrap"}}>
        {categories.map(c=>(
          <button key={c.id} onClick={()=>setCat(c.id)} style={{
            fontFamily:"'Prompt',sans-serif",fontSize:12,fontWeight:300,
            padding:"5px 12px",borderRadius:20,border:".5px solid var(--br)",
            cursor:"pointer",transition:"all .15s",
            background:cat===c.id?"var(--teal)":"var(--card)",
            color:cat===c.id?"#fff":"var(--t2)"}}>
            {c.label}
          </button>
        ))}
      </div>

      {/* SERIES SECTION */}
      {(type==="all"||type==="series") && cat==="all" && !search && (
        <div style={{marginBottom:36}}>
          <div className="sec-hd"><span className="sec-title">ซีรีส์บทความ</span></div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:12}}>
            {seriesGroups.map(s=>(
              <div key={s.id} className="card" style={{padding:16}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
                  <div style={{width:32,height:32,borderRadius:8,background:"var(--teal-bg)",
                    display:"flex",alignItems:"center",justifyContent:"center"}}>
                    <i className="ti ti-list" style={{color:"var(--teal)",fontSize:14}}></i>
                  </div>
                  <div>
                    <div style={{fontSize:13,fontWeight:500,color:"var(--text)"}}>{s.name}</div>
                    <div style={{fontSize:11,color:"var(--t3)",fontWeight:300}}>{s.articles.length} ตอน</div>
                  </div>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:6}}>
                  {s.articles.map(a=>(
                    <div key={a.id} style={{display:"flex",alignItems:"center",gap:8,
                      padding:"8px 10px",borderRadius:8,background:"var(--bg2)",cursor:"pointer"}}
                      onClick={()=>go("article",a)}>
                      <span style={{fontSize:10,color:"var(--teal)",fontWeight:500,
                        background:"var(--teal-bg)",padding:"1px 6px",borderRadius:4,flexShrink:0}}>
                        ตอน {a.part}
                      </span>
                      <span style={{fontSize:12,color:"var(--text)",lineHeight:1.4}}>{a.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ARTICLE GRID */}
      <div>
        <div className="sec-hd">
          <span className="sec-title">{filtered.length} บทความ</span>
        </div>
        {filtered.length === 0
          ? <div className="empty">ไม่พบบทความที่ตรงกับการค้นหา</div>
          : <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:12}}>
              {filtered.map(a=>(
                <div key={a.id} className="card" style={{cursor:"pointer"}}
                  onClick={()=>go("article",a)}>
                  <div style={{padding:16}}>
                    <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:10}}>
                      <span className="tag tag-teal">{a.category}</span>
                      {a.type==="series" && (
                        <span className="tag tag-acc">ซีรีส์ ตอน {a.part}</span>
                      )}
                      {a.type==="specific" && a.seriesName && (
                        <span className="tag tag-acc">{a.seriesName}</span>
                      )}
                    </div>
                    <div style={{fontSize:14,fontWeight:500,color:"var(--text)",
                      lineHeight:1.45,marginBottom:8}}>{a.title}</div>
                    <p style={{fontSize:12,marginBottom:10,
                      display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>
                      {a.excerpt}
                    </p>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                      <div style={{fontSize:11,color:"var(--t3)",fontWeight:300}}>
                        {a.author} · {a.date}
                      </div>
                      <div style={{fontSize:11,color:"var(--teal)",fontWeight:300}}>
                        <i className="ti ti-clock" style={{marginRight:3,fontSize:11}}></i>
                        {a.readTime} นาที
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
        }
      </div>
    </div>
  )
}
