export function MissionRow({ title, desc, progress, target, formatProgress, rewardText, claimed, onClaim }) {
  const completed = progress >= target
  const percent = Math.min(100, Math.round((progress / target) * 100))

  const containerBg = claimed
    ? "rgba(45, 190, 160, 0.04)"
    : completed
      ? "rgba(45, 190, 160, 0.08)"
      : "var(--bg2)"
  const borderColor = claimed
    ? "rgba(45, 190, 160, 0.15)"
    : completed
      ? "rgba(45, 190, 160, 0.35)"
      : "var(--br)"

  return (
    <div style={{
      padding: "10px 12px",
      background: containerBg,
      border: `1px solid ${borderColor}`,
      borderRadius: 12,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      flexWrap: "wrap",
      textAlign: "left",
      transition: "all 0.2s ease"
    }}>
      <div style={{ flex: 1, minWidth: 200 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
          <strong style={{ fontSize: 12, color: "var(--text)" }}>{title}</strong>
          <span style={{ fontSize: 9, fontWeight: 500, color: "var(--teal)", background: "var(--teal-bg)", padding: "1px 5px", borderRadius: 4 }}>
            {rewardText}
          </span>
        </div>
        <p style={{ fontSize: 10, color: "var(--t2)", marginBottom: 6, lineHeight: 1.3 }}>{desc}</p>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ flex: 1, height: 4, background: "var(--bg3)", borderRadius: 2, overflow: "hidden" }}>
            <div style={{ width: `${percent}%`, height: "100%", background: "var(--teal)", borderRadius: 2 }}></div>
          </div>
          <span style={{ fontSize: 9, color: "var(--t3)", fontWeight: 500, whiteSpace: "nowrap" }}>
            {formatProgress(progress)}
          </span>
        </div>
      </div>

      <div>
        {claimed ? (
          <button className="btn btn-outline" disabled style={{ padding: "4px 8px", fontSize: 10, opacity: 0.6, cursor: "not-allowed", color: "var(--teal)", borderColor: "rgba(45, 190, 160, 0.2)" }}>
            <i className="ti ti-check" style={{ marginRight: 2 }}></i>รับแล้ว
          </button>
        ) : (
          <button
            onClick={onClaim}
            disabled={!completed}
            className={`btn ${completed ? "btn-teal" : "btn-outline"}`}
            style={{
              padding: "4px 10px",
              fontSize: 10,
              opacity: completed ? 1 : 0.6,
              cursor: completed ? "pointer" : "not-allowed",
              boxShadow: completed ? "0 4px 10px rgba(45,190,160,0.15)" : "none"
            }}
          >
            {completed ? "รับรางวัล" : "ยังไม่เสร็จ"}
          </button>
        )}
      </div>
    </div>
  )
}
