let timeOffset = 0
let synced = false

/**
 * Synchronizes client clock with origin server time using a fast HEAD request.
 * Saves latency-adjusted offset in memory.
 */
export async function syncServerTime() {
  if (typeof window === "undefined") return
  
  try {
    const start = Date.now()
    // Perform HEAD request to window.location.origin (which is fast, CORS-safe, and synced via NTP)
    const res = await fetch(window.location.origin, {
      method: "HEAD",
      cache: "no-store",
      headers: { "Pragma": "no-cache" }
    })
    
    const dateHeader = res.headers.get("Date")
    if (dateHeader) {
      const serverTime = new Date(dateHeader).getTime()
      const end = Date.now()
      // Latency is approximately half of round-trip duration
      const latency = (end - start) / 2
      timeOffset = (serverTime + latency) - end
      synced = true
      console.log(`[TimeSync] Server time synchronized. Offset: ${timeOffset}ms. Latency: ${latency}ms.`)
    }
  } catch (err) {
    console.warn("[TimeSync] Failed to synchronize time with server, falling back to device clock.", err)
  }
}

/**
 * Returns latency-adjusted server epoch timestamp.
 */
export function safeDateNow() {
  return Date.now() + timeOffset
}

/**
 * Returns a Date object adjusted with the server time offset.
 */
export function getSafeDate(value) {
  if (value !== undefined) {
    return new Date(value)
  }
  return new Date(safeDateNow())
}

/**
 * Returns true if server time has been synchronized at least once.
 */
export function isTimeSynced() {
  return synced
}
