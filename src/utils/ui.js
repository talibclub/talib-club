/** Semantic z-index scale for overlays */
export const Z = {
  modal: 1000,
  modalNested: 1010,
  toast: 1100,
}

/**
 * Spread onto a clickable <div> to make it keyboard-operable:
 *   <div className="card" onClick={fn} {...clickableProps(fn)}>
 * Adds role="button", tab focus, and Enter/Space activation — a bare
 * <div onClick> is invisible to keyboards and screen readers.
 */
export function clickableProps(onActivate, label) {
  return {
    role: "button",
    tabIndex: 0,
    ...(label ? { "aria-label": label } : {}),
    onKeyDown: (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault()
        onActivate(e)
      }
    },
  }
}
