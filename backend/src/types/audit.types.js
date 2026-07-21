/**
 * Canonical list of auditable events.
 * Adding a new event = add it here. The AuditService rejects any
 * event not in this list (fail-closed).
 */
export const AUDIT_EVENTS = [
  // Auth
  "register",
  "login_success",
  "login_failed",
  "login_locked",
  "login_account_locked",
  "google_oauth_success",
  // MFA
  "mfa_challenge_issued",
  "mfa_verify_success",
  "mfa_verify_failed",
  "mfa_enabled",
  "mfa_disabled",
  "mfa_backup_codes_regenerated",
  // Password
  "forgot_password_requested",
  "password_reset_success",
  "password_reset_failed",
  "password_reset_expired",
  "password_changed",
  "password_change_failed",
  // Email
  "email_verification_sent",
  "email_verified",
  "email_verification_resend",
  "email_verification_failed",
  // Profile / sessions
  "profile_updated",
  "sessions_revoked",
  // Admin actions
  "admin_user_deleted",
  "admin_user_role_changed",
  "admin_ip_rule_created",
  "admin_ip_rule_updated",
  "admin_ip_rule_deleted",
  "admin_order_status_changed",
  // Integrity
  "audit_chain_verified",
  "audit_chain_broken",
];

export function isAuditEvent(value) {
  return typeof value === "string" && AUDIT_EVENTS.includes(value);
}
