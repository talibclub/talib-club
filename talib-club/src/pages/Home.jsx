import { ARTICLES, BOOKS, MEDIA } from "../data/index.js"

export default function Home({ go }) {
  const recent = ARTICLES.slice(0,3)
  const newBooks = BOOKS.filter(b=>b.isNew).slice(0,2)
  const recentMedia = MEDIA.slice(0,3)

  return (
    <div>
      {/* HERO */}
      <div style={{padding:"52px 0 44px",borderBottom:".5px solid var(--br2)",marginBottom:40}}>
        <div className="badge badge-acc" style={{marginBottom:20}}>
          <span style={{width:5,height:5,background:"var(--teal)",borderRadius:"50%",display:"inline-block"}}></span>
          Pattani, Thailand · Academic Islamic Studies
        </div>
        <h1 style={{marginBottom:10}}>ศึกษาอิสลาม<br/>
          <span style={{color:"var(--teal)"}}>อย่างจริงจัง</span>
        </h1>
        <p style={{maxWidth:500,marginBottom:28}}>
          คลังความรู้อิสลามวิชาการ — บทความเชิงวิชาการ ธรรมบรรยาย และห้องสมุดดิจิทัล
          สำหรับมุสลิมและผู้สนใจทุกท่าน
        </p>
        <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
          <button className="btn btn-main" onClick={()=>go("articles")}>
            <i className="ti ti-book" style={{marginRight:6,fontSize:13}}></i>เริ่มอ่าน
          </button>
          <button className="btn btn-outline" onClick={()=>go("library")}>
            <i className="ti ti-download" style={{marginRight:6,fontSize:13}}></i>ห้องสมุด
          </button>
          <button className="btn btn-outline" onClick={()=>go("media")}>
            <i className="ti ti-player-play" style={{marginRight:6,fontSize:13}}></i>ฟังธรรม
          </button>
        </div>
      </div>

      {/* AYAH */}
      <div style={{background:"var(--acc2)",border:".5px solid var(--acc-br)",
        borderRadius:14,padding:"20px 24px",marginBottom:40,
        display:"flex",gap:16,alignItems:"center"}}>
        <div style={{width:3,height:48,background:"var(--acc)",borderRadius:2,opacity:.4,flexShrink:0}}></div>
        <div>
          <div style={{fontSize:20,color:"var(--text)",direction:"rtl",textAlign:"right",
            lineHeight:1.7,marginBottom:6,fontFamily:"serif"}}>
            وَقُل رَّبِّ زِدْنِي عِلْمًا
          </div>
          <div style={{fontSize:12,color:"var(--t2)",fontWeight:300}}>
            "และจงกล่าวว่า ข้าแต่พระเจ้าของข้า โปรดเพิ่มพูนความรู้แก่ข้าด้วย" — ฏอฮา 20:114
          </div>
        </div>
      </div>

      {/* STATS */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:40}}>
        {[
          {n:"7.6K", l:"ผู้ติดตาม", icon:"ti-users"},
          {n:ARTICLES.length+"+", l:"บทความ", icon:"ti-file-text"},
          {n:BOOKS.length+"+", l:"หนังสือ/วารสาร", icon:"ti-books"},
          {n:MEDIA.length+"+", l:"มีเดีย", icon:"ti-player-play"},
        ].map((s,i)=>(
          <div key={i} className="card" style={{padding:"16px 18px",textAlign:"center"}}>
            <i className={`ti ${s.icon}`} style={{fontSize:20,color:"var(--teal)",display:"block",marginBottom:6}}></i>
            <div style={{fontSize:22,fontWeight:600,color:"var(--text)",lineHeight:1}}>{s.n}</div>
            <div style={{fontSize:11,color:"var(--t3)",fontWeight:300,marginTop:4}}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* RECENT ARTICLES */}
      <div style={{marginBottom:40}}>
        <div className="sec-hd">
          <span className="sec-title">บทความล่าสุด</span>
          <button className="sec-link" onClick={()=>go("articles")}>ดูทั้งหมด →</button>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1.6fr 1fr 1fr",gap:10}}>
          {recent.map((a,i)=>(
            <div key={a.id} className="card" style={{cursor:"pointer",overflow:"hidden"}}
              onClick={()=>go("article",a)}>
              <div style={{height:90,background:i===0?"var(--teal-bg)":i===1?"var(--acc2)":"rgba(80,100,200,.07)",
                display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,opacity:.5}}>
                {i===0?"📖":i===1?"🌙":"⭐"}
              </div>
              <div style={{padding:14}}>
                <span className="tag tag-teal" style={{marginBottom:6}}>{a.category}</span>
                <div style={{fontSize:13,fontWeight:500,color:"var(--text)",lineHeight:1.45,marginBottom:6}}>{a.title}</div>
                <div style={{fontSize:11,color:"var(--t3)",fontWeight:300}}>{a.author} · {a.readTime} นาที</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MEDIA + LIBRARY ROW */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
        {/* Media */}
        <div>
          <div className="sec-hd">
            <span className="sec-title">มีเดียล่าสุด</span>
            <button className="sec-link" onClick={()=>go("media")}>ดูทั้งหมด →</button>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {recentMedia.map(m=>(
              <div key={m.id} className="card" style={{padding:"12px 14px",display:"flex",alignItems:"center",gap:12,cursor:"pointer"}}>
                <div style={{width:34,height:34,borderRadius:"50%",background:"var(--acc2)",
                  border:".5px solid var(--acc-br)",display:"flex",alignItems:"center",
                  justifyContent:"center",color:"var(--acc)",flexShrink:0}}>
                  <i className={`ti ${m.type==="youtube"?"ti-brand-youtube":"ti-brand-spotify"}`} style={{fontSize:14}}></i>
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:12,fontWeight:500,color:"var(--text)",
                    whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{m.title}</div>
                  <div style={{fontSize:10,color:"var(--t3)",fontWeight:300,marginTop:2}}>{m.series} · {m.duration}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Library */}
        <div>
          <div className="sec-hd">
            <span className="sec-title">ห้องสมุด</span>
            <button className="sec-link" onClick={()=>go("library")}>ดูทั้งหมด →</button>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {BOOKS.map(b=>(
              <div key={b.id} className="card" style={{padding:"12px 14px",display:"flex",
                alignItems:"center",justifyContent:"space-between",gap:12,cursor:"pointer"}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <i className={`ti ${b.type==="วารสาร"?"ti-news":"ti-book"}`}
                    style={{fontSize:18,color:"var(--teal)",flexShrink:0}}></i>
                  <div>
                    <div style={{fontSize:12,fontWeight:500,color:"var(--text)"}}>{b.title}</div>
                    <div style={{fontSize:10,color:"var(--t3)",fontWeight:300}}>{b.type} · {b.category}</div>
                  </div>
                </div>
                {b.isNew && <span className="tag tag-new">ใหม่</span>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* DONATE BANNER */}
      <div style={{marginTop:40,background:"var(--acc2)",border:".5px solid var(--acc-br)",
        borderRadius:14,padding:"20px 24px",display:"flex",alignItems:"center",
        justifyContent:"space-between",gap:20,flexWrap:"wrap"}}>
        <div>
          <div style={{fontSize:15,fontWeight:500,color:"var(--text)",marginBottom:4}}>
            <i className="ti ti-heart" style={{marginRight:6,color:"var(--teal)"}}></i>
            ร่วมสนับสนุน Talib Club
          </div>
          <div style={{fontSize:12,color:"var(--t2)",fontWeight:300}}>
            เงินบริจาคของท่านช่วยเผยแพร่ความรู้อิสลามในภาษาไทย
          </div>
        </div>
        <button className="btn btn-teal">บริจาคสนับสนุน</button>
      </div>
    </div>
  )
}
