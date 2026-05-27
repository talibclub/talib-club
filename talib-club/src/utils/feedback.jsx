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
          className={`toast-card ${t.visible ? "show" : ""}`}
          style={{
            width: 340,
            maxWidth: "calc(100vw - 28px)",
            background: "var(--card)",
            color: "var(--text)",
            border: ".5px solid var(--br2)",
            borderRadius: 12,
            boxShadow: "0 18px 48px rgba(0,0,0,.22)",
            padding: 16,
          }}
        >
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: "50%",
                background: danger ? "rgba(224,85,85,.12)" : "var(--teal-bg)",
                color: danger ? "#e05555" : "var(--teal)",
                display: "grid",
                placeItems: "center",
                flexShrink: 0,
              }}
            >
              <i className={`ti ${danger ? "ti-alert-triangle" : "ti-help-circle"}`}></i>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{title}</div>
              <div style={{ fontSize: 12, color: "var(--t2)", lineHeight: 1.6 }}>{message}</div>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 14 }}>
            <button
              className="btn btn-outline"
              onClick={() => {
                toast.dismiss(id)
                resolve(false)
              }}
            >
              {cancelText}
            </button>
            <button
              className={danger ? "btn btn-outline" : "btn btn-teal"}
              style={danger ? { color: "#e05555", borderColor: "rgba(224,85,85,.35)" } : undefined}
              onClick={() => {
                toast.dismiss(id)
                resolve(true)
              }}
            >
              {confirmText}
            </button>
          </div>
        </div>
      ),
      { duration: Infinity }
    )
  })
}
