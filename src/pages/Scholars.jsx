import { useState } from "react"
import { DEFAULT_TAXONOMY, SCHOLARS } from "../data/index.js"
import { useContentCollection, useTaxonomySettings } from "../lib/contentStore.js"

const ERA_LABELS = {1:"ยุคแรก (Salaf) ค.ศ. 600–900",2:"ยุคกลาง ค.ศ. 900–1500",3:"ยุคฟื้นฟู ค.ศ. 1500–1800",4:"ยุคปัจจุบัน ค.ศ. 1800–ปัจจุบัน"}
const ERA_COLORS = {1:"var(--teal)",2:"#c9a84c",3:"#8b7dd8",4:"var(--acc)"}

export default function Scholars() {
  const { items: scholars, loading } = useContentCollection("scholars", SCHOLARS)
  const { taxonomy } = useTaxonomySettings(DEFAULT_TAXONOMY)
  const [search, setSearch] = useState("")
  const [era, setEra] = useState("0")
  const [field, setField] = useState("all")
  const [manhajFilter, setManhajFilter] = useState("all")

  const fields = ["all", ...new Set([...(taxonomy.scholarFields || []), ...scholars.map(s=>s.field?.split("/")[0]).filter(Boolean)])]

  const filtered = scholars.filter(s=>{
    const matchEra = era==="0"||String(s.era)===String(era)
    const matchField = field==="all"||s.field.includes(field)
    
    let matchManhaj = true
    if (manhajFilter !== "all") {
      if (manhajFilter === "สะลาฟีย์") {
        matchManhaj = s.manhaj && s.manhaj.includes("สะลาฟีย์")
      } else if (manhajFilter === "อาชาอิเราะฮ์") {
        matchManhaj = s.manhaj && (s.manhaj.includes("อาชาอิเราะฮ์") || s.manhaj.includes("มาตุรีดียะฮ์"))
      } else if (manhajFilter === "คอวาริจญ์") {
        matchManhaj = s.manhaj && (s.manhaj.includes("คอวาริจญ์") || s.manhaj.includes("อิบาดิยะฮ์"))
      } else if (manhajFilter === "มุรญีอะฮ์") {
        matchManhaj = s.manhaj && (s.manhaj.includes("มุรญีอะฮ์") || s.manhaj.includes("ญะฮ์มียะฮ์"))
      } else if (manhajFilter === "การเมือง") {
        matchManhaj = s.manhaj && (s.manhaj.includes("การเมือง") || s.manhaj.includes("อิควาน") || s.manhaj.includes("ซูรูรียะฮ์"))
      } else if (manhajFilter === "โมเดิร์นนิสต์") {
        matchManhaj = s.manhaj && (s.manhaj.includes("โมเดิร์นนิสต์") || s.manhaj.includes("ปฏิรูป"))
      } else {
        matchManhaj = s.manhaj && s.manhaj.includes(manhajFilter)
      }
    }

    const term = search.toLowerCase()
    const matchSearch = !search||
      s.name.toLowerCase().includes(term)||
      s.note.toLowerCase().includes(term)||
      (s.manhaj && s.manhaj.toLowerCase().includes(term))
    return matchEra && matchField && matchManhaj && matchSearch
  })

  const eras = ["0", ...(taxonomy.scholarEras || []).map(item => item.id)]
  const eraLabelMap = Object.fromEntries((taxonomy.scholarEras || []).map(item => [String(item.id), item.label]))

  return (
    <div>
      <div style={{marginBottom:28}}>
        <h1 style={{marginBottom:8}}>รายนามอุลามาอฺ</h1>
        <p>รวบรวมนักวิชาการอิสลามตั้งแต่ยุคฮิจเราะฮ์แรกจนถึงปัจจุบัน พร้อมปีฮิจเราะฮ์ (AH) และคริสต์ศักราช (CE)</p>
        {loading && <p style={{ marginTop: 8, fontSize: 12 }}>กำลังโหลดรายชื่อใหม่ล่าสุด...</p>}
      </div>

      {/* SEARCH + FILTER */}
      <div style={{display:"flex",gap:10,marginBottom:16,flexWrap:"wrap"}}>
        <div style={{position:"relative",flex:1,minWidth:200}}>
          <i className="ti ti-search" style={{position:"absolute",left:10,top:"50%",
            transform:"translateY(-50%)",color:"var(--t3)",fontSize:14}}></i>
          <input placeholder="ค้นหาชื่ออุลามาอฺ หรือ มันฮัจญ์..." value={search}
            onChange={e=>setSearch(e.target.value)} style={{paddingLeft:32}}/>
        </div>
        <select value={manhajFilter} onChange={e=>setManhajFilter(e.target.value)} style={{width:"auto",flex:"0 0 auto"}}>
          <option value="all">ทุกมันฮัจญ์/อากีดะฮ์</option>
          <option value="สะลาฟีย์">สะลาฟีย์ (มันฮัจญ์สะลัฟ / อะษารีย์)</option>
          <option value="อาชาอิเราะฮ์">อาชาอิเราะฮ์ / มาตุรีดีย์</option>
          <option value="ซูฟีย์">ซูฟีย์</option>
          <option value="มุอ์ตาซิละฮ์">มุอ์ตาซิละฮ์</option>
          <option value="ชีอะฮ์">ชีอะฮ์</option>
          <option value="คอวาริจญ์">คอวาริจญ์ / อิบาดีย์</option>
          <option value="มุรญีอะฮ์">มุรญีอะฮ์ / ญะฮ์มีย์</option>
          <option value="การเมือง">การเมืองอิสลาม / อิควาน / ซูรูรีย์</option>
          <option value="โมเดิร์นนิสต์">โมเดิร์นนิสต์ / ปฏิรูป</option>
        </select>
        <select value={field} onChange={e=>setField(e.target.value)} style={{width:"auto",flex:"0 0 auto"}}>
          {fields.map(f=><option key={f} value={f}>{f==="all"?"ทุกสาขา":f}</option>)}
        </select>
      </div>

      {/* ERA TABS */}
      <div style={{display:"flex",gap:6,marginBottom:28,flexWrap:"wrap"}}>
        {eras.map(e=>(
          <button key={e} onClick={()=>setEra(e)} style={{
            fontFamily:"'Prompt',sans-serif",fontSize:11,fontWeight:300,
            padding:"5px 12px",borderRadius:20,border:".5px solid var(--br)",
            cursor:"pointer",transition:"all .15s",
            background:era===e?"var(--acc)":"var(--card)",
            color:era===e?"var(--bg)":"var(--t2)"}}>
            {e==="0"?"ทั้งหมด":`ยุคที่ ${e}`}
          </button>
        ))}
      </div>

      {/* TIMELINE */}
      {eras.filter(item => item !== "0").map(eraNum=>{
        const eraScholars = filtered.filter(s=>String(s.era)===String(eraNum))
        if(eraScholars.length===0) return null
        const color = ERA_COLORS[eraNum] || "var(--teal)"
        return (
          <div key={eraNum} style={{marginBottom:36}}>
            {/* Era Header */}
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16}}>
              <div style={{width:3,height:28,background:color,borderRadius:2,flexShrink:0}}></div>
              <div>
                <div style={{fontSize:13,fontWeight:500,color:"var(--text)"}}>{eraLabelMap[eraNum] || ERA_LABELS[eraNum] || `ยุคที่ ${eraNum}`}</div>
                <div style={{fontSize:11,color:"var(--t3)",fontWeight:300}}>{eraScholars.length} ท่าน</div>
              </div>
            </div>

            {/* Scholars Cards */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:10}}>
              {eraScholars.map(s=>(
                <div key={s.id} className="card" style={{padding:16,borderLeft:`2px solid ${color}`}}>
                  <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:8,marginBottom:8}}>
                    <div style={{fontSize:13,fontWeight:500,color:"var(--text)",lineHeight:1.4}}>{s.name}</div>
                    <div style={{display:"flex", gap:4, flexShrink:0, flexWrap:"wrap", justifyContent:"flex-end"}}>
                      {s.manhaj && <span className="tag tag-teal" style={{fontSize:9,fontWeight:400}}>{s.manhaj}</span>}
                      <span className="tag" style={{background:"var(--acc2)",color:"var(--t2)",
                        fontSize:9,fontWeight:400}}>{s.field}</span>
                    </div>
                  </div>
                  <div style={{display:"flex",gap:12,marginBottom:8}}>
                    <div style={{fontSize:11,fontWeight:300}}>
                      <span style={{color:"var(--t3)"}}>ฮ.ศ. </span>
                      <span style={{color:color,fontWeight:500}}>{s.hijri}</span>
                    </div>
                    <div style={{fontSize:11,fontWeight:300}}>
                      <span style={{color:"var(--t3)"}}>ค.ศ. </span>
                      <span style={{color:"var(--text)"}}>{s.ad}</span>
                    </div>
                  </div>
                  <p style={{fontSize:12,lineHeight:1.5,color:"var(--t2)"}}>{s.note}</p>
                </div>
              ))}
            </div>
          </div>
        )
      })}

     {filtered.length===0 && <div className="empty">ไม่พบอุลามาอ์ที่ตรงกับการค้นหา</div>}

      {/* CONTACT */}
      <div style={{marginTop:32,padding:"20px 24px",background:"var(--acc2)",
        border:".5px solid var(--acc-br)",borderRadius:14,textAlign:"center"}}>
        <div style={{fontSize:14,fontWeight:500,color:"var(--text)",marginBottom:6}}>
          ต้องการเพิ่มรายชื่ออุลามาอฺ?
        </div>
        <p style={{fontSize:12,marginBottom:14}}>ติดต่อทีม Talib Club เพื่อเสนอรายชื่อนักวิชาการเพิ่มเติม</p>
        <a 
          href="https://www.facebook.com/TalibClub" 
          target="_blank" 
          rel="noreferrer" 
          className="btn btn-main" 
          style={{fontSize:12, textDecoration:"none", display:"inline-block"}}
        >
          ติดต่อเรา
        </a>
      </div>
    </div>
  )
}