import { ARTICLES } from "../data/index.js"

export default function ArticleDetail({ item, go }) {
  if (!item) { go("articles"); return null }
  const related = ARTICLES.filter(a=>a.id!==item.id&&a.category===item.category).slice(0,3)

  return (
    <div style={{maxWidth:720,margin:"0 auto"}}>
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
        <h1 style={{marginBottom:12}}>{item.title}</h1>
        <div style={{display:"flex",gap:16,color:"var(--t3)",fontSize:12,fontWeight:300,flexWrap:"wrap"}}>
          <span><i className="ti ti-user" style={{marginRight:4,fontSize:11}}></i>{item.author}</span>
          <span><i className="ti ti-calendar" style={{marginRight:4,fontSize:11}}></i>{item.date}</span>
          <span><i className="ti ti-clock" style={{marginRight:4,fontSize:11}}></i>{item.readTime} นาทีอ่าน</span>
        </div>
      </div>

      <div className="divider"/>

      {/* EXCERPT */}
      <div style={{background:"var(--teal-bg)",border:".5px solid rgba(45,190,160,.2)",
        borderRadius:10,padding:"14px 18px",marginBottom:28}}>
        <p style={{color:"var(--teal)",fontWeight:400,fontSize:13}}>{item.excerpt}</p>
      </div>

      {/* BODY */}
      <div style={{fontSize:15,lineHeight:1.9,color:"var(--t2)",fontWeight:300}}>
        {item.body.split("\n\n").map((para,i)=>(
          <p key={i} style={{marginBottom:20,color:"var(--t2)"}}>{para}</p>
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
