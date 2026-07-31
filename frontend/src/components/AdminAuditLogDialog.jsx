import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Lock,
  KeyRound,
  Smartphone,
  Fingerprint,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Info,
  EyeOff,
  Settings,
  Globe,
  Mail,
  Rocket,
  Plus,
  Pencil,
  Trash2,
  Move,
  Palette,
  Sparkles,
  Image,
  Search,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  PersonStanding,
} from "lucide-react";
import { useToast } from "../context/toastContext";
import { getAdminAuditLogs, verifyAuditChain } from "../services/auditServices";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "./ui/dialog";

// ─── Event → Display Translation ───────────────────────────────────

const STATUS = {
  SUCCESS: "success",
  WARNING: "warning",
  FAILED: "failed",
  INFO: "info",
};

const STATUS_STYLES = {
  success: { bg: "bg-emerald-50 dark:bg-emerald-500/10", text: "text-emerald-700 dark:text-emerald-400", dot: "bg-emerald-500", icon: CheckCircle2 },
  warning: { bg: "bg-amber-50 dark:bg-amber-500/10", text: "text-amber-700 dark:text-amber-400", dot: "bg-amber-500", icon: AlertTriangle },
  failed:  { bg: "bg-red-50 dark:bg-red-500/10", text: "text-red-700 dark:text-red-400", dot: "bg-red-500", icon: XCircle },
  info:    { bg: "bg-blue-50 dark:bg-blue-500/10", text: "text-blue-700 dark:text-blue-400", dot: "bg-blue-500", icon: Info },
};

function iconForEvent(event) {
  switch (event) {
    case "register":            return Rocket;
    case "login_success":       return ShieldCheck;
    case "login_failed":        return ShieldAlert;
    case "login_locked":
    case "login_account_locked": return Lock;
    case "google_oauth_success": return Globe;
    case "mfa_challenge_issued": return Smartphone;
    case "mfa_verify_success":   return ShieldCheck;
    case "mfa_verify_failed":    return ShieldAlert;
    case "mfa_enabled":
    case "mfa_disabled":         return Fingerprint;
    case "forgot_password_requested":
    case "password_reset_success":
    case "password_reset_failed":
    case "password_reset_expired": return KeyRound;
    case "password_changed":
    case "password_change_failed": return Lock;
    case "email_verification_sent":
    case "email_verified":
    case "email_changed":        return Mail;
    case "profile_updated":      return User;
    case "sessions_revoked":     return EyeOff;
    case "admin_user_deleted":   return Trash2;
    case "admin_user_role_changed": return Settings;
    case "admin_ip_rule_created":
    case "admin_ip_rule_updated":
    case "admin_ip_rule_deleted":  return Shield;
    case "audit_chain_verified":   return ShieldCheck;
    case "audit_chain_broken":     return ShieldAlert;
    default:                     return Info;
  }
}

function getTitle(event, metadata = {}) {
  switch (event) {
    case "register":            return "Account Registered";
    case "login_success":       return "Login";
    case "login_failed":        return "Failed Login";
    case "login_locked":
    case "login_account_locked": return "Account Locked";
    case "google_oauth_success": return "Google Connected";
    case "mfa_challenge_issued": return "MFA Challenge";
    case "mfa_verify_success":   return "MFA Verified";
    case "mfa_verify_failed":    return "MFA Failed";
    case "mfa_enabled":          return "MFA Enabled";
    case "mfa_disabled":         return "MFA Disabled";
    case "forgot_password_requested": return "Password Reset Requested";
    case "password_reset_success":    return "Password Reset";
    case "password_reset_failed":     return "Password Reset Failed";
    case "password_reset_expired":    return "Password Reset Expired";
    case "password_changed":          return "Password Changed";
    case "password_change_failed":    return "Password Change Failed";
    case "email_verification_sent":   return "Verification Sent";
    case "email_verified":            return "Email Verified";
    case "email_changed":             return "Email Changed";
    case "profile_updated":           return "Profile Updated";
    case "sessions_revoked":     return "Sessions Revoked";
    case "admin_user_deleted":   return "User Deleted";
    case "admin_user_role_changed": return "Role Changed";
    case "admin_ip_rule_created":  return "IP Rule Created";
    case "admin_ip_rule_updated":  return "IP Rule Updated";
    case "admin_ip_rule_deleted":  return "IP Rule Deleted";
    case "audit_chain_verified":   return "Audit Verified";
    case "audit_chain_broken":     return "Chain Integrity Issue";
    default:                     return event.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  }
}

function getDescription(event, metadata = {}) {
  switch (event) {
    case "register":
      return "A new account was registered on the platform.";
    case "login_success":
      return "Signed in successfully.";
    case "login_failed":
      return "A login attempt failed. Invalid credentials or account issue.";
    case "login_locked":
      return "Account was temporarily locked due to multiple failed attempts.";
    case "login_account_locked":
      return "Account locked after exceeding the maximum login attempts.";
    case "google_oauth_success":
      return "Signed in using Google OAuth.";
    case "mfa_challenge_issued":
      return "A verification code was sent for two-factor authentication.";
    case "mfa_verify_success":
      return "Two-factor authentication completed successfully.";
    case "mfa_verify_failed":
      return "The two-factor authentication code was incorrect.";
    case "mfa_enabled":
      return "Two-factor authentication was enabled on the account.";
    case "mfa_disabled":
      return "Two-factor authentication was disabled on the account.";
    case "forgot_password_requested":
      return "A password reset link was requested.";
    case "password_reset_success":
      return "Password was reset successfully.";
    case "password_reset_failed":
      return "The password reset attempt failed. The link may have expired.";
    case "password_reset_expired":
      return "The password reset link has expired.";
    case "password_changed":
      return "Password was changed successfully.";
    case "password_change_failed":
      return "An attempt to change the password failed.";
    case "email_verification_sent":
      return "A verification email was sent.";
    case "email_verified":
      return "Email address was verified.";
    case "email_changed":
      return "The email address associated with the account was updated.";
    case "profile_updated": {
      const fields = metadata?.updatedFields;
      if (Array.isArray(fields) && fields.length > 0) {
        const human = fields.map((f) =>
          f.replace(/([A-Z])/g, " $1").toLowerCase().trim()
        );
        return `Profile information was updated: ${human.join(", ")}.`;
      }
      return "Profile information was updated.";
    }
    case "sessions_revoked":
      return "All active sessions were revoked.";
    case "admin_user_deleted":
      return metadata?.targetEmail
        ? `User ${metadata.targetEmail} was removed from the platform.`
        : "A user account was deleted.";
    case "admin_user_role_changed":
      return metadata?.targetEmail
        ? `${metadata.targetEmail}'s role was changed from ${metadata.oldRole || "user"} to ${metadata.newRole || "admin"}.`
        : "A user's role was updated by an administrator.";
    case "admin_ip_rule_created":
      return "A new IP access rule was created.";
    case "admin_ip_rule_updated":
      return "An IP access rule was modified.";
    case "admin_ip_rule_deleted":
      return "An IP access rule was removed.";
    case "audit_chain_verified":
      return "Audit log integrity check passed — all entries are authentic.";
    case "audit_chain_broken":
      return "Audit log integrity check detected tampering. Investigation required.";
    default:
      return "A security event was recorded.";
  }
}

function getStatus(event) {
  switch (event) {
    case "login_success":
    case "register":
    case "google_oauth_success":
    case "mfa_verify_success":
    case "mfa_enabled":
    case "password_changed":
    case "password_reset_success":
    case "profile_updated":
    case "sessions_revoked":
    case "email_verified":
    case "audit_chain_verified":
      return STATUS.SUCCESS;

    case "login_locked":
    case "login_account_locked":
    case "mfa_challenge_issued":
    case "forgot_password_requested":
    case "mfa_disabled":
    case "admin_user_role_changed":
    case "email_verification_sent":
    case "password_reset_expired":
      return STATUS.WARNING;

    case "login_failed":
    case "mfa_verify_failed":
    case "password_reset_failed":
    case "password_change_failed":
    case "email_verification_failed":
    case "audit_chain_broken":
      return STATUS.FAILED;

    default:
      return STATUS.INFO;
  }
}

// ─── Helpers ───────────────────────────────────────────────────────

function formatTime(isoString) {
  const now = Date.now();
  const then = new Date(isoString).getTime();
  const diff = now - then;
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  const d = new Date(isoString);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;

  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";

  const diffDays = Math.floor((today - d) / 86400000);
  if (diffDays < 7 && diffDays > 0) {
    return d.toLocaleDateString(undefined, { weekday: "long" });
  }

  return d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

function formatTooltipDate(isoString) {
  return new Date(isoString).toLocaleString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getQuickDateRange(id) {
  const now = new Date();
  const end = now.toISOString().split("T")[0];
  const start = new Date(now);

  if (id === "today") return { from: end, to: end };
  if (id === "7d") { start.setDate(start.getDate() - 6); return { from: start.toISOString().split("T")[0], to: end }; }
  if (id === "30d") { start.setDate(start.getDate() - 29); return { from: start.toISOString().split("T")[0], to: end }; }
  return { from: "", to: "" };
}

// ─── Sub-components ────────────────────────────────────────────────

function StatusBadge({ status }) {
  const s = STATUS_STYLES[status];
  const Icon = s.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium ${s.bg} ${s.text}`}>
      <Icon className="w-3 h-3" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function FilterChip({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`
        relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap
        ${active
          ? "bg-[#0F172A] dark:bg-white text-white dark:text-[#0F172A] shadow-sm"
          : "bg-white dark:bg-slate-800 text-[#64748B] dark:text-slate-400 hover:bg-[#F1F5F9] dark:hover:bg-slate-700/80 hover:text-[#0F172A] dark:hover:text-white border border-[#E2E8F0] dark:border-slate-700"
        }
        focus:outline-none focus-visible:ring-2 focus-visible:ring-[#AFF33E] focus-visible:ring-offset-2
      `}
    >
      {children}
    </button>
  );
}

function QuickDateChip({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`
        px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 whitespace-nowrap
        ${active
          ? "bg-[#AFF33E]/20 dark:bg-[#AFF33E]/15 text-[#0F172A] dark:text-white"
          : "text-[#94A3B8] dark:text-slate-500 hover:text-[#0F172A] dark:hover:text-white hover:bg-[#F1F5F9] dark:hover:bg-slate-700"
        }
        focus:outline-none focus-visible:ring-2 focus-visible:ring-[#AFF33E] focus-visible:ring-offset-1
      `}
    >
      {children}
    </button>
  );
}

function EventCard({ entry, index }) {
  const status = getStatus(entry.event);
  const Icon = iconForEvent(entry.event);
  const title = getTitle(entry.event, entry.metadata);
  const description = getDescription(entry.event, entry.metadata);
  const isAdmin = entry.event.startsWith("admin_") || entry.event.startsWith("audit_");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.3), ease: [0.16, 1, 0.3, 1] }}
      layout
    >
      <div
        className={`
          group relative rounded-2xl border p-5 transition-all duration-300
          ${isAdmin
            ? "bg-gradient-to-br from-[#FFF7ED] to-[#FFFBEB] dark:from-orange-950/30 dark:to-amber-950/20 border-[#FED7AA]/50 dark:border-amber-500/20"
            : "bg-white dark:bg-slate-800/80 border-[#E2E8F0] dark:border-slate-700/50"
          }
          hover:shadow-lg hover:shadow-black/[0.03] dark:hover:shadow-black/[0.15] hover:-translate-y-0.5
          focus-within:ring-2 focus-within:ring-[#AFF33E] focus-within:ring-offset-2
        `}
        role="listitem"
        aria-label={`${title} - ${status}`}
      >
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className={`
            relative z-10 w-11 h-11 rounded-full flex items-center justify-center shrink-0 shadow-sm
            ${isAdmin
              ? "bg-gradient-to-br from-[#FED7AA] to-[#FDE68A] dark:from-orange-600/40 dark:to-amber-600/40 text-[#C2410C] dark:text-amber-300"
              : "bg-gradient-to-br from-[#F1F5F9] to-[#E2E8F0] dark:from-slate-700 dark:to-slate-600 text-[#64748B] dark:text-slate-300"
            }
          `}>
            <Icon className="w-5 h-5" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-[#0F172A] dark:text-white truncate">
                  {title}
                </h3>
                <p className="text-sm text-[#64748B] dark:text-slate-400 mt-1 leading-relaxed">
                  {description}
                </p>
              </div>
              <StatusBadge status={status} />
            </div>

            {/* Actor info */}
            {(entry.actorEmail || entry.actorName) && (
              <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#F1F5F9] dark:bg-slate-700/50 text-[10px] font-medium text-[#64748B] dark:text-slate-400">
                  <PersonStanding className="w-3 h-3" />
                  <span className="truncate max-w-[160px]">{entry.actorEmail || entry.actorName}</span>
                  {entry.actorName && entry.actorEmail && (
                    <span className="opacity-60">({entry.actorName})</span>
                  )}
                </span>
                {entry.userId && (
                  <span className="font-mono text-[9px] text-[#CBD5E1] dark:text-slate-600">
                    #{entry.userId.slice(0, 8)}
                  </span>
                )}
              </div>
            )}

            {/* Footer: time */}
            <div className="flex items-center gap-3 mt-2.5 flex-wrap">
              <div className="flex items-center gap-1.5 text-xs text-[#94A3B8] dark:text-slate-500">
                <Clock className="w-3.5 h-3.5" />
                <time dateTime={entry.createdAt} title={formatTooltipDate(entry.createdAt)}>
                  {formatTime(entry.createdAt)}
                </time>
              </div>

            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function EmptyState({ hasFilters }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col items-center justify-center py-20 px-6"
    >
      <div className="relative mb-6">
        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#AFF33E]/20 to-[#AFF33E]/5 flex items-center justify-center">
          {hasFilters ? (
            <Search className="w-10 h-10 text-[#94A3B8] dark:text-slate-500" />
          ) : (
            <Shield className="w-10 h-10 text-[#94A3B8] dark:text-slate-500" />
          )}
        </div>
      </div>
      <h3 className="text-lg font-semibold text-[#0F172A] dark:text-white">
        {hasFilters ? "No matching events" : "No audit events yet"}
      </h3>
      <p className="text-sm text-[#64748B] dark:text-slate-400 mt-2 text-center max-w-sm">
        {hasFilters
          ? "Try adjusting your filters or date range to see more results."
          : "Security events will appear here as users interact with the platform."}
      </p>
    </motion.div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="rounded-2xl border border-[#E2E8F0] dark:border-slate-700/50 bg-white dark:bg-slate-800/80 p-5 animate-pulse"
        >
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-full bg-[#F1F5F9] dark:bg-slate-700 shrink-0" />
            <div className="flex-1 space-y-2.5">
              <div className="h-4 bg-[#F1F5F9] dark:bg-slate-700 rounded w-1/3" />
              <div className="h-3.5 bg-[#F1F5F9] dark:bg-slate-700 rounded w-3/4" />
              <div className="flex gap-2 mt-2">
                <div className="h-3 bg-[#F1F5F9] dark:bg-slate-700 rounded w-20" />
                <div className="h-3 bg-[#F1F5F9] dark:bg-slate-700 rounded w-16" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Event type options for dropdown ───────────────────────────────

const EVENT_OPTIONS = [
  { value: "all", label: "All Events" },
  { value: "login_success", label: "Login Successful" },
  { value: "login_failed", label: "Login Failed" },
  { value: "register", label: "Account Registered" },
  { value: "google_oauth_success", label: "Google Sign-In" },
  { value: "password_changed", label: "Password Changed" },
  { value: "password_reset_success", label: "Password Reset" },
  { value: "mfa_enabled", label: "MFA Enabled" },
  { value: "mfa_disabled", label: "MFA Disabled" },
  { value: "admin_user_deleted", label: "User Deleted" },
  { value: "admin_user_role_changed", label: "Role Changed" },
  { value: "admin_ip_rule_created", label: "IP Rule Created" },
  { value: "profile_updated", label: "Profile Updated" },
  { value: "audit_chain_broken", label: "Chain Broken" },
];

// ─── Main Dialog ───────────────────────────────────────────────────

export default function AdminAuditLogDialog({ open, onOpenChange }) {
  const toast = useToast();

  const [entries, setEntries] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [eventFilter, setEventFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [activeRange, setActiveRange] = useState(null);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showCustomDate, setShowCustomDate] = useState(false);
  const searchRef = useRef("");

  // Chain verification state
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState(null);

  searchRef.current = search;

  const hasAnyFilters = eventFilter !== "all" || !!activeRange || dateFrom || dateTo || search.trim().length > 0;

  const fetchLogs = useCallback(async (p = 1) => {
    try {
      setLoading(true);
      const opts = { page: p, limit: 15 };
      if (eventFilter && eventFilter !== "all") opts.event = eventFilter;
      if (dateFrom) opts.dateFrom = dateFrom;
      if (dateTo) opts.dateTo = dateTo;
      const searchVal = searchRef.current.trim();
      if (searchVal) opts.search = searchVal;
      const result = await getAdminAuditLogs(opts);
      setEntries(result.data || []);
      setMeta(result.meta || null);
      setPage(result.meta?.page || 1);
    } catch (err) {
      console.error("Failed to fetch audit logs:", err);
      toast.error("Failed to load audit logs.");
    } finally {
      setLoading(false);
    }
  }, [eventFilter, dateFrom, dateTo, toast]);

  useEffect(() => {
    if (open) {
      setEntries([]);
      setMeta(null);
      setPage(1);
      setVerifyResult(null);
      fetchLogs(1);
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (open && !loading) {
      setEntries([]);
      setPage(1);
      fetchLogs(1);
    }
  }, [dateFrom, dateTo]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = () => {
    fetchLogs(1);
  };

  const handlePageChange = (newPage) => {
    if (!meta || newPage < 1 || newPage > meta.totalPages) return;
    fetchLogs(newPage);
  };

  const handleQuickRange = (id) => {
    if (activeRange === id) {
      setActiveRange(null);
      setDateFrom("");
      setDateTo("");
    } else {
      setActiveRange(id);
      const range = getQuickDateRange(id);
      setDateFrom(range.from);
      setDateTo(range.to);
    }
    setShowCustomDate(false);
  };

  const handleClearFilters = () => {
    setEventFilter("all");
    setActiveRange(null);
    setDateFrom("");
    setDateTo("");
    setShowCustomDate(false);
    setSearch("");
    searchRef.current = "";
  };

  const handleVerifyChain = async () => {
    try {
      setVerifying(true);
      setVerifyResult(null);
      const result = await verifyAuditChain();
      const data = result.data || result;
      setVerifyResult(data);
      if (data?.ok) {
        toast.success("Audit chain integrity verified ✓");
      } else {
        toast.error("Audit chain integrity broken! Check details.");
      }
    } catch (err) {
      toast.error("Failed to verify chain. It may be rate-limited.");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        overlayClassName="backdrop-blur-sm"
        className="
          fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%]
          w-full sm:max-w-3xl max-h-[90vh] flex flex-col !gap-0 p-0
          bg-[#FBFCF8] dark:bg-[#0F172A]
          rounded-2xl border border-[#E2E8F0]/80 dark:border-slate-700/50
          shadow-2xl shadow-black/[0.08]
          data-[state=open]:animate-in data-[state=closed]:animate-out
          data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0
          data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95
          data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]
          data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]
          [&>button.absolute]:top-6 [&>button.absolute]:right-7
          [&>button.absolute]:text-[#94A3B8] [&>button.absolute]:dark:text-slate-500
          [&>button.absolute]:hover:text-[#0F172A] [&>button.absolute]:dark:hover:text-white
        "
        style={{ borderRadius: "16px" }}
      >
        {/* ── Header ── */}
        <div className="shrink-0 px-7 pt-6 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-semibold text-[#0F172A] dark:text-white !m-0">
                Audit Logs
              </DialogTitle>
              <p className="text-sm text-[#64748B] dark:text-slate-400 mt-1">
                Tamper-evident security event log across all users.
              </p>
            </div>
            <div className="flex items-center gap-3">
              {meta && (
                <div className="shrink-0">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#AFF33E]/15 dark:bg-[#AFF33E]/10 text-[#0F172A] dark:text-white text-xs font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#AFF33E]" />
                    {meta.total} {meta.total === 1 ? "Entry" : "Entries"}
                  </span>
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleVerifyChain}
                disabled={verifying}
                className="h-8 text-xs rounded-xl border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-400 dark:hover:bg-amber-900/20"
              >
                <ShieldCheck className="w-3.5 h-3.5 mr-1.5" />
                {verifying ? "Verifying…" : "Verify Chain"}
              </Button>
            </div>
          </div>
        </div>

        {/* ── Chain Result Banner ── */}
        <AnimatePresence>
          {verifyResult && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="shrink-0 overflow-hidden"
            >
              <div className={`mx-7 mb-2 rounded-xl border p-3 ${
                verifyResult.ok
                  ? "border-green-200 dark:border-green-700/50 bg-green-50/60 dark:bg-green-900/10"
                  : "border-red-200 dark:border-red-700/50 bg-red-50/60 dark:bg-red-900/10"
              }`}>
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    verifyResult.ok
                      ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                      : "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                  }`}>
                    {verifyResult.ok ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <XCircle className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <p className={`font-semibold text-xs ${verifyResult.ok ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"}`}>
                      {verifyResult.ok ? "Chain Integrity Verified" : "Chain Integrity Broken!"}
                    </p>
                    <p className="text-[10px] text-[#64748B] dark:text-slate-500 mt-0.5">
                      {verifyResult.totalEntries} entries checked
                      {verifyResult.reason && ` · ${verifyResult.reason}`}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Filters ── */}
        <div className="shrink-0 px-7 pb-3 pt-1">
          {/* Search + Event type row */}
          <div className="flex items-center gap-2 mb-2">
            {/* Search */}
            <div className="relative flex-1 max-w-[280px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#94A3B8] dark:text-slate-500 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Search email, IP, or user ID…"
                className="w-full h-9 pl-8 pr-3 rounded-xl border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-[#0F172A] dark:text-white placeholder:text-[#94A3B8] dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#AFF33E]/40 focus:border-[#AFF33E]/50 transition-all"
                aria-label="Search audit logs"
              />
            </div>

            {/* Event type dropdown */}
            <select
              value={eventFilter}
              onChange={(e) => { setEventFilter(e.target.value); }}
              className="h-9 px-3 rounded-xl border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-[#0F172A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#AFF33E]/40 focus:border-[#AFF33E]/50 transition-all"
              aria-label="Filter by event type"
            >
              {EVENT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>

            <Button variant="secondary" size="sm" className="h-9 text-xs rounded-xl shrink-0" onClick={handleSearch}>
              <Search className="w-3.5 h-3.5 mr-1.5" />
              Search
            </Button>
          </div>

          {/* Quick date chips */}
          <div className="flex items-center gap-2 flex-wrap">
            <QuickDateChip
              active={activeRange === "today"}
              onClick={() => handleQuickRange("today")}
            >
              Today
            </QuickDateChip>
            <QuickDateChip
              active={activeRange === "7d"}
              onClick={() => handleQuickRange("7d")}
            >
              7 Days
            </QuickDateChip>
            <QuickDateChip
              active={activeRange === "30d"}
              onClick={() => handleQuickRange("30d")}
            >
              30 Days
            </QuickDateChip>
            <QuickDateChip
              active={showCustomDate}
              onClick={() => { setShowCustomDate(!showCustomDate); setActiveRange(null); }}
            >
              <Calendar className="w-3 h-3 inline-block mr-1" />
              Custom
            </QuickDateChip>

            {hasAnyFilters && (
              <button
                onClick={handleClearFilters}
                className="text-[10px] text-[#EF4444] hover:text-[#DC2626] font-medium px-2 py-1 ml-1 transition-colors"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Custom date inputs */}
          <AnimatePresence>
            {showCustomDate && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="flex items-center gap-2 pt-2 pb-1">
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => { setDateFrom(e.target.value); setActiveRange(null); }}
                    className="h-8 px-3 rounded-xl border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-[#0F172A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#AFF33E]/40 focus:border-[#AFF33E]/50"
                    aria-label="From date"
                  />
                  <span className="text-xs text-[#94A3B8] dark:text-slate-500">to</span>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => { setDateTo(e.target.value); setActiveRange(null); }}
                    className="h-8 px-3 rounded-xl border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-[#0F172A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#AFF33E]/40 focus:border-[#AFF33E]/50"
                    aria-label="To date"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Divider ── */}
        <div className="shrink-0 mx-7 border-t border-[#E2E8F0] dark:border-slate-700/50" />

        {/* ── Entries ── */}
        <div className="flex-1 overflow-y-auto min-h-0 px-7 py-5" role="list" aria-label="Audit log entries">
          {loading ? (
            <LoadingSkeleton />
          ) : entries.length === 0 ? (
            <EmptyState hasFilters={hasAnyFilters} />
          ) : (
            <div className="space-y-2.5">
              <AnimatePresence mode="popLayout">
                {entries.map((entry, idx) => (
                  <EventCard key={entry.id} entry={entry} index={idx} />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* ── Pagination ── */}
        {meta && meta.totalPages > 1 && (
          <div className="shrink-0 px-7 py-3 border-t border-[#E2E8F0] dark:border-slate-700/50 flex items-center justify-between bg-[#F8FAFC] dark:bg-slate-900/30">
            <p className="text-[11px] text-[#94A3B8] dark:text-slate-500">
              Showing page {meta.page} of {meta.totalPages}
              <span className="mx-1.5">·</span>
              {meta.total} total entries
            </p>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs px-2.5 rounded-xl"
                disabled={!meta.hasPrevPage || loading}
                onClick={() => handlePageChange(page - 1)}
              >
                <ChevronLeft className="w-3.5 h-3.5 mr-1" />
                Prev
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs px-2.5 rounded-xl"
                disabled={!meta.hasNextPage || loading}
                onClick={() => handlePageChange(page + 1)}
              >
                Next
                <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
