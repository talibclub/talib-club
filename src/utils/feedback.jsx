import toast from "react-hot-toast"

export function notifySuccess(message) {
  toast.success(message)
}

export function notifyError(message) {
  toast.error(message)
}

export function confirmAction({
  title = "ยืนยันการดำเนินการ",
  message = "ต้องการดำเนินการต่อใช่ไหม?",
  confirmText = "ยืนยัน",
  cancelText = "ยกเลิก",
  danger = false,
} = {}) {
  return new Promise(resolve => {
    const id = toast.custom(
      t => (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.4)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 99999,
            pointerEvents: "all",
            opacity: t.visible ? 1 : 0,
            transition: "opacity 0.2s ease-in-out",
          }}
          onClick={() => {
            toast.dismiss(id)
            resolve(false)
          }}
        >
          <div
            className={`toast-card ${t.visible ? "show" : ""}`}
            style={{
              width: 380,
              maxWidth: "calc(100vw - 32px)",
              background: "var(--card)",
              color: "var(--text)",
              border: ".5px solid var(--br2)",
              borderRadius: 16,
              boxShadow: "0 24px 60px rgba(0,0,0,.28)",
              padding: 20,
              transform: t.visible ? "translateY(0)" : "translateY(16px)",
              transition: "transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: danger ? "rgba(224,85,85,.12)" : "var(--teal-bg)",
                  color: danger ? "#e05555" : "var(--teal)",
                  display: "grid",
                  placeItems: "center",
                  flexShrink: 0,
                  fontSize: 16
                }}
              >
                <i className={`ti ${danger ? "ti-alert-triangle" : "ti-help-circle"}`}></i>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>{title}</div>
                <div style={{ fontSize: 13, color: "var(--t2)", lineHeight: 1.6 }}>{message}</div>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
              <button
                className="btn btn-outline"
                onClick={() => {
                  toast.dismiss(id)
                  resolve(false)
                }}
                style={{ padding: "8px 16px", borderRadius: 20 }}
              >
                {cancelText}
              </button>
              <button
                className={danger ? "btn" : "btn btn-teal"}
                style={{
                  padding: "8px 16px",
                  borderRadius: 20,
                  ...(danger ? {
                    background: "#e05555",
                    color: "#fff",
                    border: "none"
                  } : {})
                }}
                onClick={() => {
                  toast.dismiss(id)
                  resolve(true)
                }}
              >
                {confirmText}
              </button>
            </div>
          </div>
        </div>
      ),
      { duration: Infinity }
    )
  })
}
