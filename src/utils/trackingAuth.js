/** Tracking administration is restricted to authenticated staff. */
export function canAccessTrackingAdmin(authState) {
  return Boolean(authState?.isStaff)
}
