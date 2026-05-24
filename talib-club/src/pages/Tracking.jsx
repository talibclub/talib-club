import { useState } from "react"
import { ORDERS as TRACKING_ITEMS } from "../data/index.js"

const STATUS_COLOR = {
  "จัดส่งแล้ว":"var(--teal)",
  "กำลังจัดส่ง":"#c9a84c",
  "รอจัดส่ง":"var(--t3)",
}
const STATUS_BG = {
  "จัดส่งแล้ว":"var(--teal-bg)",
  "กำลังจัดส่ง":"rgba(201,168,76,0.1)",
  "รอจัดส่ง":"var(--bg2)",
}

export default function Tracking() {
  const [query, setQuery] = useState("")
  const [result, setResult] = useState(null)
  const [searched, setSearched] = useState(false)

  const handleSearch = () => {
    if(!query.trim()) return
    const found = TRACKING_ITEMS.find(t=>
      t.orderId.toLowerCase().includes(query.toLowerCase())||
      t.tracking.toLowerCase().includes(query.toLowerCase())||
      t.customer.toLowerCase().includes(query.toLowerCase())
    )
    setResult(found||null)
    setSearched(true)
  }

  const STEPS = ["รับออเดอร์","เตรียมพัสดุ","จัดส่งแล้ว"]
  const getStep = (status) => {
    if(status==="รอจัดส่ง") return 1
    if(status==="กำลังจัดส่ง") return 2
    return 3
  }

  return (
    <div style={{maxWidth:680,margin:"0 auto"}}>
      <div style={{marginBottom:32}}>
        <h1 style={{marginBottom:8}}>ติดตามพัสดุ</h1>
        <p>ตรวจสอบสถานะการจัดส่งหนังสือและวารสารของคุณ</p>
      </div>

      {/* SEARCH BOX */}
      <div style={{background:"var(--card)",border:".5px solid var(--br2)",borderRadius:14,
        padding:24,marginBottom:28}}>
        <div style={{fontSize:13,fontWeight:500,color:"var(--text)",marginBottom:14}}>
          ค้นหาด้วยเลข Order ID หรือ Tracking Number
        </div>
        <div style={{display:"flex",gap:8}}>
          <input placeholder="เช่น TLB-2568-001 หรือ TH123456789"
            value={query} onChange={e=>setQuery(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&handleSearch()}/>
          <button className="btn btn-main" onClick={handleSearch}
            style={{flexShrink:0,padding:"9px 18px"}}>
            <i className="ti ti-search" style={{marginRight:5,fontSize:13}}></i>ค้นหา
          </button>
        </div>
        <div style={{fontSize:11,color:"var(--t3)",fontWeight:300,marginTop:10}}>
          ทดสอบด้วย: TLB-2568-001, TLB-2568-002, TLB-2568-003
        </div>
      </div>

      {/* RESULT */}
      {searched && !result && (
        <div className="empty">
          <i className="ti ti-package-off" style={{fontSize:32,marginBottom:10,display:"block"}}></i>
          ไม่พบรายการที่ตรงกัน กรุณาตรวจสอบหมายเลขออเดอร์อีกครั้ง
        </div>
      )}

      {result && (
        <div style={{background:"var(--card)",border:".5px solid var(--br2)",borderRadius:14,padding:24}}>
          {/* Header */}
          <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",
            marginBottom:20,flexWrap:"wrap",gap:10}}>
            <div>
              <div style={{fontSize:12,color:"var(--t3)",fontWeight:300,marginBottom:4}}>Order ID</div>
              <div style={{fontSize:18,fontWeight:600,color:"var(--text)"}}>{result.orderId}</div>
            </div>
            <span style={{fontSize:12,fontWeight:500,padding:"4px 12px",borderRadius:20,
              background:STATUS_BG[result.status],color:STATUS_COLOR[result.status]}}>
              {result.status}
            </span>
          </div>

          {/* PROGRESS BAR */}
          <div style={{marginBottom:24}}>
            <div style={{display:"flex",justifyContent:"space-between",position:"relative"}}>
              <div style={{position:"absolute",top:10,left:"5%",right:"5%",height:2,
                background:"var(--bg3)",zIndex:0}}></div>
              <div style={{position:"absolute",top:10,left:"5%",
                width:`${((getStep(result.status)-1)/2)*90}%`,height:2,
                background:"var(--teal)",zIndex:1,transition:"width .5s"}}></div>
              {STEPS.map((step,i)=>{
                const done = i+1<=getStep(result.status)
                return (
                  <div key={step} style={{display:"flex",flexDirection:"column",alignItems:"center",
                    gap:8,zIndex:2,minWidth:80}}>
                    <div style={{width:22,height:22,borderRadius:"50%",
                      background:done?"var(--teal)":"var(--bg3)",
                      border:`.5px solid ${done?"var(--teal)":"var(--br)"}`,
                      display:"flex",alignItems:"center",justifyContent:"center"}}>
                      {done && <i className="ti ti-check" style={{fontSize:11,color:"#fff"}}></i>}
                    </div>
                    <div style={{fontSize:11,color:done?"var(--text)":"var(--t3)",
                      fontWeight:done?500:300,textAlign:"center"}}>{step}</div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* DETAIL */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            {[
              {label:"สินค้า",value:result.item,icon:"ti-package"},
              {label:"ผู้รับ",value:result.customer,icon:"ti-user"},
              {label:"วันที่สั่ง",value:result.date,icon:"ti-calendar"},
              {label:"Tracking",value:result.tracking||"ยังไม่มีข้อมูล",icon:"ti-truck"},
            ].map(d=>(
              <div key={d.label} style={{background:"var(--bg2)",borderRadius:10,padding:"12px 14px"}}>
                <div style={{fontSize:11,color:"var(--t3)",fontWeight:300,marginBottom:4}}>
                  <i className={`ti ${d.icon}`} style={{marginRight:5,fontSize:11}}></i>{d.label}
                </div>
                <div style={{fontSize:13,fontWeight:400,color:"var(--text)"}}>{d.value}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ALL ORDERS TABLE */}
      <div style={{marginTop:40}}>
        <div className="sec-hd"><span className="sec-title">รายการออเดอร์ทั้งหมด</span></div>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
            <thead>
              <tr style={{borderBottom:".5px solid var(--br)"}}>
                {["Order ID","สินค้า","ผู้รับ","วันที่","สถานะ"].map(h=>(
                  <th key={h} style={{padding:"10px 12px",textAlign:"left",fontWeight:500,
                    fontSize:12,color:"var(--t2)"}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TRACKING_ITEMS.map(t=>(
                <tr key={t.id} style={{borderBottom:".5px solid var(--br2)",cursor:"pointer",
                  transition:"background .15s"}}
                  onClick={()=>{setQuery(t.orderId);setResult(t);setSearched(true)}}
                  onMouseEnter={e=>e.currentTarget.style.background="var(--bg2)"}
                  onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <td style={{padding:"10px 12px",fontWeight:500,color:"var(--text)",fontSize:12}}>{t.orderId}</td>
                  <td style={{padding:"10px 12px",color:"var(--t2)",fontSize:12}}>{t.item}</td>
                  <td style={{padding:"10px 12px",color:"var(--t2)",fontSize:12}}>{t.customer}</td>
                  <td style={{padding:"10px 12px",color:"var(--t3)",fontSize:12,fontWeight:300}}>{t.date}</td>
                  <td style={{padding:"10px 12px"}}>
                    <span style={{fontSize:11,padding:"3px 10px",borderRadius:20,fontWeight:400,
                      background:STATUS_BG[t.status],color:STATUS_COLOR[t.status]}}>
                      {t.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
