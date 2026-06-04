/** Tracking admin gate: staff Firebase role or env password */
export function getTrackingAdminPassword() {
  return import.meta.env.VITE_TRACKING_ADMIN_PASSWORD || ""
}

export function canAccessTrackingAdmin(authState) {
  return Boolean(authState?.isStaff)
}

export function verifyTrackingAdminPassword(input) {
  const expected = getTrackingAdminPassword()
  if (!expected) return false
  return String(input || "") === expected
}
