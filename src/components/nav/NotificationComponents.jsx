export function NotificationDropdown({ notifications, seenIds, markAsRead, onDismiss, onClose, pushState, togglePushSubscription, unreadCount, markAllAsRead }) {
  return (
    <div style={{
      position: "absolute", right: 0, top: 42, width: 330,
      background: "var(--card)", border: ".5px solid var(--br2)",
      borderRadius: 12, boxShadow: "0 18px 45px rgba(0,0,0,.18)",
      padding: 12, zIndex: 200, color: "var(--text)",
      display: "flex", flexDirection: "column"
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 10, borderBottom: ".5px solid var(--br2)", marginBottom: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
          <i className="ti ti-bell" style={{ color: "var(--teal)" }}></i> การแจ้งเตือน
        </span>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {unreadCount > 0 && (
            <button onClick={markAllAsRead} style={{
              background: "transparent", border: "none", cursor: "pointer", color: "var(--teal)", fontSize: 11,
              fontFamily: "'Prompt',sans-serif", fontWeight: 500
            }}>อ่านทั้งหมด</button>
          )}
          <button onClick={onClose} style={{
            background: "transparent", border: "none", cursor: "pointer", color: "var(--t3)", fontSize: 11,
            fontFamily: "'Prompt',sans-serif"
          }}>ปิด</button>
        </div>
      </div>

      {pushState && pushState.supported && (
        <div style={{
          background: "var(--bg2)", padding: "10px 12px", borderRadius: 10,
          marginBottom: 10, border: "0.5px solid var(--br2)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          gap: 8
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text)" }}>
            <i className={`ti ${pushState.subscribed ? "ti-bell-ringing" : "ti-bell-off"}`} style={{ color: pushState.subscribed ? "var(--teal)" : "var(--t3)", fontSize: 16 }}></i>
            <span style={{ fontSize: 11, fontWeight: 500 }}>รับการแจ้งเตือนบนเครื่องนี้</span>
          </div>
          <button 
            onClick={togglePushSubscription}
            style={{
              padding: "4px 8px",
              borderRadius: 6,
              border: "none",
              background: pushState.subscribed ? "var(--teal-bg)" : "var(--bg3)",
              color: pushState.subscribed ? "var(--teal)" : "var(--t2)",
              fontSize: 10,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "'Prompt', sans-serif"
            }}
          >
            {pushState.subscribed ? 'เปิดอยู่' : 'ปิดอยู่'}
          </button>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 320, overflowY: "auto", paddingRight: 2 }}>
        {notifications.length === 0 ? (
          <div style={{ padding: "20px 10px", textAlign: "center", color: "var(--t3)", fontSize: 12 }}>ไม่มีการแจ้งเตือนในขณะนี้</div>
        ) : notifications.map(n => {
          const isUnread = !seenIds.includes(n.id)
          return (
            <div
              key={n.id}
              onClick={() => { markAsRead(n.id); n.onClick(); onClose(); }}
              style={{
                padding: "10px 8px 10px 10px",
                borderRadius: 8,
                background: isUnread ? "rgba(45, 190, 160, 0.08)" : "var(--bg2)",
                border: isUnread ? "0.5px solid rgba(45, 190, 160, 0.2)" : "0.5px solid transparent",
                cursor: "pointer",
                display: "flex",
                gap: 8,
                alignItems: "flex-start",
                transition: "transform 0.15s ease, background 0.15s ease",
                textAlign: "left",
                position: "relative"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateX(2px)"
                e.currentTarget.style.background = isUnread ? "rgba(45, 190, 160, 0.13)" : "var(--bg3)"
                const dismissBtn = e.currentTarget.querySelector(".dismiss-btn")
                if (dismissBtn) dismissBtn.style.opacity = "1"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "none"
                e.currentTarget.style.background = isUnread ? "rgba(45, 190, 160, 0.08)" : "var(--bg2)"
                const dismissBtn = e.currentTarget.querySelector(".dismiss-btn")
                if (dismissBtn) dismissBtn.style.opacity = "0"
              }}
            >
              {isUnread && (
                <span style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "var(--teal)",
                  alignSelf: "center",
                  marginRight: 2,
                  flexShrink: 0
                }} />
              )}
              
              <div style={{
                width: 28, height: 28, borderRadius: 6,
                background: "var(--card)", color: n.color || "var(--teal)",
                display: "grid", placeItems: "center", flexShrink: 0, fontSize: 14,
                border: "0.5px solid var(--br2)"
              }}>
                <i className={`ti ${n.icon}`}></i>
              </div>
              
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: "var(--text)" }}>{n.title}</div>
                <div style={{ fontSize: 11, color: "var(--t2)", marginTop: 2, lineHeight: 1.4 }}>{n.desc}</div>
                <span style={{ fontSize: 9, color: "var(--t3)", display: "block", marginTop: 4 }}>{n.time}</span>
              </div>

              <button 
                className="dismiss-btn"
                onClick={(e) => onDismiss(n.id, e)}
                style={{ 
                  background: "transparent", 
                  border: "none", 
                  color: "var(--t3)", 
                  cursor: "pointer", 
                  padding: "4px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 20,
                  height: 20,
                  alignSelf: "center",
                  opacity: 0,
                  transition: "opacity 0.2s, background-color 0.15s, color 0.15s"
                }}
                onMouseEnter={(e) => {
                  e.stopPropagation();
                  e.currentTarget.style.background = "var(--bg2)";
                  e.currentTarget.style.color = "#e05555";
                }}
                onMouseLeave={(e) => {
                  e.stopPropagation();
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "var(--t3)";
                }}
                title="ลบการแจ้งเตือน"
              >
                <i className="ti ti-x" style={{ fontSize: 10 }}></i>
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function NotificationDrawer({ notifications, seenIds, markAsRead, onDismiss, onClose, pushState, togglePushSubscription, unreadCount, markAllAsRead }) {
  return (
    <div className="notification-drawer" style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000 }}>
      <div 
        onClick={onClose} 
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0, 0, 0, 0.5)",
          backdropFilter: "blur(2px)",
          animation: "fadeIn 0.2s ease-out"
        }} 
      />
      <div style={{
        position: "absolute",
        top: 0,
        right: 0,
        bottom: 0,
        width: "280px",
        background: "var(--bg)",
        padding: "60px 20px",
        borderLeft: "1px solid var(--br2)",
        boxShadow: "-5px 0 15px rgba(0,0,0,0.1)",
        display: "flex",
        flexDirection: "column",
        gap: 16,
        animation: "slideLeft 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
        zIndex: 1001
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 15, borderBottom: "1px solid var(--br2)" }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
            <i className="ti ti-bell" style={{ color: "var(--teal)" }}></i> การแจ้งเตือน
          </h3>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} style={{
                background: "transparent", border: "none", cursor: "pointer", color: "var(--teal)", fontSize: 12,
                fontFamily: "'Prompt',sans-serif", fontWeight: 500
              }}>อ่านทั้งหมด</button>
            )}
            <button onClick={onClose} style={{
              background: "var(--bg2)",
              border: "none",
              borderRadius: "50%",
              width: 28,
              height: 28,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--t2)",
              cursor: "pointer"
            }}>
              <i className="ti ti-x" style={{ fontSize: 14 }}></i>
            </button>
          </div>
        </div>

        {pushState && pushState.supported && (
          <div style={{
            background: "var(--bg2)", padding: "10px 12px", borderRadius: 10,
            border: "0.5px solid var(--br2)",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            gap: 8
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text)" }}>
              <i className={`ti ${pushState.subscribed ? "ti-bell-ringing" : "ti-bell-off"}`} style={{ color: pushState.subscribed ? "var(--teal)" : "var(--t3)", fontSize: 16 }}></i>
              <span style={{ fontSize: 11, fontWeight: 500 }}>รับการแจ้งเตือนบนเครื่องนี้</span>
            </div>
            <button 
              onClick={togglePushSubscription}
              style={{
                padding: "4px 8px",
                borderRadius: 6,
                border: "none",
                background: pushState.subscribed ? "var(--teal-bg)" : "var(--bg3)",
                color: pushState.subscribed ? "var(--teal)" : "var(--t2)",
                fontSize: 10,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "'Prompt', sans-serif"
              }}
            >
              {pushState.subscribed ? 'เปิดอยู่' : 'ปิดอยู่'}
            </button>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1, overflowY: "auto" }}>
          {notifications.length === 0 ? (
            <div style={{ padding: "20px 10px", textAlign: "center", color: "var(--t3)", fontSize: 12 }}>ไม่มีการแจ้งเตือนในขณะนี้</div>
          ) : notifications.map(n => {
            const isUnread = !seenIds.includes(n.id)
            return (
              <div
                key={n.id}
                onClick={() => { markAsRead(n.id); n.onClick(); onClose(); }}
                style={{
                  padding: 12,
                  borderRadius: 10,
                  background: isUnread ? "rgba(45, 190, 160, 0.08)" : "var(--card)",
                  border: isUnread ? "0.5px solid rgba(45, 190, 160, 0.2)" : "0.5px solid var(--br2)",
                  cursor: "pointer",
                  display: "flex",
                  gap: 8,
                  alignItems: "flex-start",
                  textAlign: "left",
                  position: "relative"
                }}
              >
                {isUnread && (
                  <span style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "var(--teal)",
                    alignSelf: "center",
                    marginRight: 2,
                    flexShrink: 0
                  }} />
                )}
                
                <div style={{
                  width: 28, height: 28, borderRadius: 6,
                  background: "var(--bg2)", color: n.color || "var(--teal)",
                  display: "grid", placeItems: "center", flexShrink: 0, fontSize: 14
                }}>
                  <i className={`ti ${n.icon}`}></i>
                </div>
                
                <div style={{ minWidth: 0, flex: 1, paddingRight: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: "var(--text)" }}>{n.title}</div>
                  <div style={{ fontSize: 11, color: "var(--t2)", marginTop: 2, lineHeight: 1.4 }}>{n.desc}</div>
                  <span style={{ fontSize: 9, color: "var(--t3)", display: "block", marginTop: 4 }}>{n.time}</span>
                </div>

                <button 
                  onClick={(e) => onDismiss(n.id, e)}
                  style={{ 
                    background: "transparent", 
                    border: "none", 
                    color: "var(--t3)", 
                    cursor: "pointer", 
                    padding: "4px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 22,
                    height: 22,
                    position: "absolute",
                    right: 8,
                    top: "50%",
                    transform: "translateY(-50%)"
                  }}
                  onMouseEnter={(e) => {
                    e.stopPropagation();
                    e.currentTarget.style.background = "var(--bg2)";
                    e.currentTarget.style.color = "#e05555";
                  }}
                  onMouseLeave={(e) => {
                    e.stopPropagation();
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "var(--t3)";
                  }}
                  title="ลบการแจ้งเตือน"
                >
                  <i className="ti ti-x" style={{ fontSize: 10 }}></i>
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
