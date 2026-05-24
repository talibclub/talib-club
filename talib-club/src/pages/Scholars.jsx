import { useState } from "react"
import { SCHOLARS, ERAS } from "../data/index.js"

const ERA_LABELS = {1:"ยุคแรก (Salaf) ค.ศ. 600–900",2:"ยุคกลาง ค.ศ. 900–1500",3:"ยุคฟื้นฟู ค.ศ. 1500–1800",4:"ยุคปัจจุบัน ค.ศ. 1800–ปัจจุบัน"}
const ERA_COLORS = {1:"var(--teal)",2:"#c9a84c",3:"#8b7dd8",4:"var(--acc)"}

export default function Scholars() {
  const [search, setSearch] = useState("")
  const [era, setEra] = useState(0)
  const [field, setField] = useState("all")

  const fields = ["all",...new Set(SCHOLARS.map(s=>s.field.split("/")[0]))]

  const filtered = SCHOLARS.filter(s=>{
    const matchEra = era===0||s.era===era
    const matchField = field==="all"||s.field.includes(field)
    const matchSearch = !search||s.name.includes(search)||s.note.includes(search)
    return matchEra && matchField && matchSearch
  })

  const eras = [0,1,2,3,4]

  return (
    <div>
      <div style={{marginBottom:28}}>
        <h1 style={{marginBottom:8}}>รายนามอุลามาอ์</h1>
        <p>รวบรวมนักวิชาการอิสลามตั้งแต่ยุคฮิจเราะฮ์แรกจนถึงปัจจุบัน พร้อมปีฮิจเราะฮ์ (AH) และคริสต์ศักราช (CE)</p>
      </div>

      {/* SEARCH + FILTER */}
      <div style={{display:"flex",gap:10,marginBottom:16,flexWrap:"wrap"}}>
        <div style={{position:"relative",flex:1,minWidth:200}}>
          <i className="ti ti-search" style={{position:"absolute",left:10,top:"50%",
            transform:"translateY(-50%)",color:"var(--t3)",fontSize:14}}></i>
          <input placeholder="ค้นหาชื่ออุลามาอ์..." value={search}
            onChange={e=>setSearch(e.target.value)} style={{paddingLeft:32}}/>
        </div>
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
            {e===0?"ทั้งหมด":`ยุคที่ ${e}`}
          </button>
        ))}
      </div>

      {/* TIMELINE */}
      {[1,2,3,4].map(eraNum=>{
        const eraScholars = filtered.filter(s=>s.era===eraNum)
        if(eraScholars.length===0) return null
        const color = ERA_COLORS[eraNum]
        return (
          <div key={eraNum} style={{marginBottom:36}}>
            {/* Era Header */}
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16}}>
              <div style={{width:3,height:28,background:color,borderRadius:2,flexShrink:0}}></div>
              <div>
                <div style={{fontSize:13,fontWeight:500,color:"var(--text)"}}>{ERA_LABELS[eraNum]}</div>
                <div style={{fontSize:11,color:"var(--t3)",fontWeight:300}}>{eraScholars.length} ท่าน</div>
              </div>
            </div>

            {/* Scholars Cards */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:10}}>
              {eraScholars.map(s=>(
                <div key={s.id} className="card" style={{padding:16,borderLeft:`2px solid ${color}`}}>
                  <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:8,marginBottom:8}}>
                    <div style={{fontSize:13,fontWeight:500,color:"var(--text)",lineHeight:1.4}}>{s.name}</div>
                    <span className="tag" style={{background:"var(--acc2)",color:"var(--t2)",
                      fontSize:9,flexShrink:0,fontWeight:400}}>{s.field}</span>
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

      <div style={{marginTop:32,padding:"16px 20px",background:"var(--acc2)",
        border:".5px solid var(--acc-br)",borderRadius:12,textAlign:"center"}}>
        <div style={{fontSize:13,color:"var(--t2)",fontWeight:300}}>
          <i className="ti ti-info-circle" style={{marginRight:6,color:"var(--teal)"}}></i>
          ต้องการเพิ่มรายชื่ออุลามาอ์? ติดต่อทีม Talib Club
        </div>
      </div>
    </div>
  )
}
