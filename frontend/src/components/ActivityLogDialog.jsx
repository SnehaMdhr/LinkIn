import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShieldCheck as ShieldIcon,
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
  ChevronDown,
  Clock,
} from "lucide-react";
import { useToast } from "../context/toastContext";
import { getMyActivity } from "../services/auditServices";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "./ui/dialog";

// ─── Category Definitions ──────────────────────────────────────────

const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "profile", label: "Profile" },
  { id: "links", label: "Links" },
  { id: "security", label: "Security" },
  { id: "account", label: "Account" },
];

const QUICK_RANGES = [
  { id: "today", label: "Today" },
  { id: "7d", label: "7 Days" },
  { id: "30d", label: "30 Days" },
];

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

function iconForEvent(event, metadata = {}) {
  switch (event) {
    case "register":            return Rocket;
    case "login_success":       return ShieldIcon;
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
    case "profile_updated": {
      const a = metadata?.action || "";
      if (a === "link_created")  return Plus;
      if (a === "link_updated")  return Pencil;
      if (a === "link_deleted")  return Trash2;
      if (a === "link_reorder")  return Move;
      if (a === "profile_picture") return Image;
      if (a === "background")    return Palette;
      if (a === "theme")         return Sparkles;
      return User;
    }
    case "qr_downloaded":       return Move; // placeholder for QrCode icon
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

function getCategory(event, metadata = {}) {
  switch (event) {
    case "register":
    case "google_oauth_success":
      return "account";
    case "login_success":
    case "login_failed":
    case "login_locked":
    case "login_account_locked":
    case "mfa_challenge_issued":
    case "mfa_verify_success":
    case "mfa_verify_failed":
    case "mfa_enabled":
    case "mfa_disabled":
    case "forgot_password_requested":
    case "password_reset_success":
    case "password_reset_failed":
    case "password_reset_expired":
    case "password_changed":
    case "password_change_failed":
    case "sessions_revoked":
      return "security";
    case "profile_updated": {
      const a = metadata?.action || "";
      if (a.startsWith("link_")) return "links";
      return "profile";
    }
    case "admin_user_deleted":
    case "admin_user_role_changed":
    case "admin_ip_rule_created":
    case "admin_ip_rule_updated":
    case "admin_ip_rule_deleted":
    case "audit_chain_verified":
    case "audit_chain_broken":
      return "admin";
    default:
      return "profile";
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
      return STATUS.WARNING;

    case "login_failed":
    case "mfa_verify_failed":
    case "password_reset_failed":
    case "password_change_failed":
    case "password_reset_expired":
    case "email_verification_failed":
    case "audit_chain_broken":
      return STATUS.FAILED;

    default:
      return STATUS.INFO;
  }
}

function getTitle(event, metadata = {}) {
  switch (event) {
    case "register":            return "Account Created";
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
    case "forgot_password_requested": return "Password Reset";
    case "password_reset_success":    return "Password Reset";
    case "password_reset_failed":     return "Password Reset Failed";
    case "password_reset_expired":    return "Password Reset Expired";
    case "password_changed":          return "Password Changed";
    case "password_change_failed":    return "Password Change Failed";
    case "email_verification_sent":   return "Verification Sent";
    case "email_verified":            return "Email Verified";
    case "email_changed":             return "Email Changed";
    case "profile_updated": {
      const a = metadata?.action || "";
      if (a === "link_created")  return "Link Added";
      if (a === "link_updated")  return "Link Updated";
      if (a === "link_deleted")  return "Link Deleted";
      if (a === "link_reorder")  return "Links Reordered";
      if (a === "profile_picture") return "Profile Picture Changed";
      if (a === "background")    return "Background Changed";
      if (a === "theme")         return "Theme Changed";
      return "Profile Updated";
    }
    case "qr_downloaded":       return "QR Code Downloaded";
    case "sessions_revoked":     return "Sessions Revoked";
    case "admin_user_deleted":   return "User Deleted";
    case "admin_user_role_changed": return "Role Changed";
    case "admin_ip_rule_created":  return "IP Rule Created";
    case "admin_ip_rule_updated":  return "IP Rule Updated";
    case "admin_ip_rule_deleted":  return "IP Rule Deleted";
    case "audit_chain_verified":   return "Audit Verified";
    case "audit_chain_broken":     return "Chain Integrity Issue";
    default:                     return "Event";
  }
}

function getDescription(event, metadata = {}) {
  switch (event) {
    case "register":
      return "Welcome to LinkIn. Your account has been created.";
    case "login_success":
      return "Signed in successfully.";
    case "login_failed":
      return "An attempt to sign in to your account failed. If this wasn't you, review your security settings.";
    case "login_locked":
      return "Your account was temporarily locked due to multiple failed attempts.";
    case "login_account_locked":
      return "Account locked after exceeding the maximum number of login attempts.";
    case "google_oauth_success":
      return metadata?.isNewUser
        ? "Connected your Google account and created your LinkIn profile."
        : "Signed in using your Google account.";
    case "mfa_challenge_issued":
      return "A verification code was sent for two-factor authentication.";
    case "mfa_verify_success":
      return "Two-factor authentication completed successfully.";
    case "mfa_verify_failed":
      return "The two-factor authentication code was incorrect.";
    case "mfa_enabled":
      return "Two-factor authentication has been enabled on your account.";
    case "mfa_disabled":
      return "Two-factor authentication has been disabled on your account.";
    case "forgot_password_requested":
      return "A password reset link was requested for your account.";
    case "password_reset_success":
      return "Your password has been reset successfully.";
    case "password_reset_failed":
      return "The password reset attempt was unsuccessful. The link may have expired.";
    case "password_reset_expired":
      return "The password reset link has expired. Please request a new one.";
    case "password_changed":
      return "Your password was changed successfully.";
    case "password_change_failed":
      return "An attempt to change your password failed.";
    case "email_verification_sent":
      return "A verification email has been sent to your email address.";
    case "email_verified":
      return "Your email address has been verified.";
    case "email_changed":
      return "The email address associated with your account was updated.";
    case "profile_updated": {
      const action = metadata?.action || "";
      if (action === "link_created") {
        return metadata?.platform
          ? `Added ${metadata.platform} to your profile.`
          : "A new link was added to your profile.";
      }
      if (action === "link_updated") {
        const fields = metadata?.updatedFields;
        if (Array.isArray(fields)) {
          if (fields.includes("isPinned"))
            return metadata?.platform
              ? `${metadata.platform} was pinned to the top of your profile.`
              : "A link was pinned to your profile.";
          if (fields.includes("isHidden"))
            return metadata?.platform
              ? `${metadata.platform} was hidden from your profile.`
              : "A link was hidden from your profile.";
        }
        return metadata?.platform
          ? `Updated ${metadata.platform}.`
          : "A link on your profile was updated.";
      }
      if (action === "link_deleted") {
        return metadata?.platform
          ? `Removed ${metadata.platform} from your profile.`
          : "A link was removed from your profile.";
      }
      if (action === "link_reorder") {
        return "Reordered the links on your profile.";
      }
      if (action === "profile_picture") {
        return "You changed your profile picture.";
      }
      if (action === "background") {
        return "You updated your profile background.";
      }
      if (action === "theme") {
        const theme = metadata?.theme || metadata?.value || "";
        return theme ? `Switched to ${theme} theme.` : "Your profile theme was updated.";
      }
      const changed = metadata?.updatedFields;
      if (Array.isArray(changed) && changed.length > 0) {
        const human = changed.map((f) => f.replace(/([A-Z])/g, " $1").toLowerCase().trim());
        return `Updated ${human.join(", ")}.`;
      }
      return "Your profile information was updated.";
    }
    case "qr_downloaded":
      return "Your profile QR Code was downloaded.";
    case "sessions_revoked":
      return "All active sessions have been revoked. You will need to sign in again.";
    case "admin_user_deleted":
      return metadata?.targetEmail
        ? `User ${metadata.targetEmail} was removed from the platform.`
        : "A user account was deleted.";
    case "admin_user_role_changed":
      return metadata?.targetEmail
        ? `${metadata.targetEmail}'s role was changed from ${metadata.oldRole || "user"} to ${metadata.newRole || "admin"}.`
        : "A user's role was updated.";
    case "admin_ip_rule_created":
      return "A new IP access rule was created.";
    case "admin_ip_rule_updated":
      return "An IP access rule was modified.";
    case "admin_ip_rule_deleted":
      return "An IP access rule was removed.";
    case "audit_chain_verified":
      return "The audit log integrity check passed. All entries are authentic.";
    case "audit_chain_broken":
      return "The audit log integrity check detected tampering. Immediate investigation required.";
    default:
      return "An event was recorded.";
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

// ─── Components ────────────────────────────────────────────────────

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

function FilterChipsRow({ categories, selected, onSelect }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none" role="group" aria-label="Activity categories">
      {categories.map((cat) => (
        <FilterChip
          key={cat.id}
          active={selected === cat.id}
          onClick={() => onSelect(cat.id)}
        >
          {cat.label}
        </FilterChip>
      ))}
    </div>
  );
}

function EventCard({ entry, index }) {
  const status = getStatus(entry.event);
  const Icon = iconForEvent(entry.event, entry.metadata);
  const title = getTitle(entry.event, entry.metadata);
  const description = getDescription(entry.event, entry.metadata);
  const isAdmin = getCategory(entry.event, entry.metadata) === "admin";

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
            relative z-10 w-11 h-11 rounded-full flex items-center justify-center shrink-0
            ${isAdmin
              ? "bg-gradient-to-br from-[#FED7AA] to-[#FDE68A] dark:from-orange-600/40 dark:to-amber-600/40 text-[#C2410C] dark:text-amber-300"
              : "bg-gradient-to-br from-[#F1F5F9] to-[#E2E8F0] dark:from-slate-700 dark:to-slate-600 text-[#64748B] dark:text-slate-300"
            }
            shadow-sm
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

            {/* Footer */}
            <div className="flex items-center gap-3 mt-3">
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
            <Clock className="w-10 h-10 text-[#94A3B8] dark:text-slate-500" />
          )}
        </div>
      </div>
      <h3 className="text-lg font-semibold text-[#0F172A] dark:text-white">
        {hasFilters ? "No matching events" : "No activity yet"}
      </h3>
      <p className="text-sm text-[#64748B] dark:text-slate-400 mt-2 text-center max-w-sm">
        {hasFilters
          ? "Try adjusting your filters or date range to see more results."
          : "When you update your profile or links, they'll appear here."}
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
            <div className="w-11 h-11 rounded-xl bg-[#F1F5F9] dark:bg-slate-700 shrink-0" />
            <div className="flex-1 space-y-2.5">
              <div className="h-4 bg-[#F1F5F9] dark:bg-slate-700 rounded w-1/3" />
              <div className="h-3.5 bg-[#F1F5F9] dark:bg-slate-700 rounded w-3/4" />
              <div className="h-3 bg-[#F1F5F9] dark:bg-slate-700 rounded w-1/4" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main Dialog ───────────────────────────────────────────────────

export default function ActivityLogDialog({ open, onOpenChange }) {
  const toast = useToast();

  const [entries, setEntries] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [category, setCategory] = useState("all");
  const [activeRange, setActiveRange] = useState(null);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [search, setSearch] = useState("");
  const [showCustomDate, setShowCustomDate] = useState(false);
  const [page, setPage] = useState(1);
  const searchRef = useRef("");

  searchRef.current = search;

  const hasAnyFilters = category !== "all" || !!activeRange || dateFrom || dateTo || search.trim().length > 0;

  const fetchActivity = useCallback(async (p = 1, append = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      const opts = { page: p, limit: 20 };
      if (dateFrom) opts.dateFrom = dateFrom;
      if (dateTo) opts.dateTo = dateTo;

      const result = await getMyActivity(opts);
      const newData = result.data || [];

      if (append) {
        setEntries((prev) => [...prev, ...newData]);
      } else {
        setEntries(newData);
      }
      setMeta(result.meta || null);
      setPage(result.meta?.page || 1);
    } catch (err) {
      console.error("Failed to fetch activity:", err);
      toast.error("Failed to load activity log.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [dateFrom, dateTo, toast]);

  // Initial fetch when dialog opens
  useEffect(() => {
    if (open) {
      setEntries([]);
      setMeta(null);
      setPage(1);
      fetchActivity(1, false);
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  // Refetch when date filters change (not search/category which are client-side)
  useEffect(() => {
    if (open && !loading) {
      setEntries([]);
      setPage(1);
      fetchActivity(1, false);
    }
  }, [dateFrom, dateTo]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLoadMore = () => {
    if (loadingMore || !meta || page >= meta.totalPages) return;
    fetchActivity(page + 1, true);
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

  // Client-side filter by category and search (search via ref to avoid API calls on keystroke)
  const filteredEntries = useMemo(() => {
    const q = searchRef.current.trim().toLowerCase();
    return entries.filter((entry) => {
      if (category !== "all") {
        const cat = getCategory(entry.event, entry.metadata);
        if (cat !== category) return false;
      }
      if (q) {
        const title = getTitle(entry.event, entry.metadata).toLowerCase();
        const desc = getDescription(entry.event, entry.metadata).toLowerCase();
        const matches =
          title.includes(q) ||
          desc.includes(q) ||
          (entry.metadata?.platform || "").toLowerCase().includes(q) ||
          (entry.metadata?.title || "").toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [entries, category]);

  const canLoadMore = meta && page < meta.totalPages;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* Overlay is rendered by DialogContent internally — we pass the blur class via DialogContent's styling */}
      <DialogContent
        overlayClassName="backdrop-blur-sm"
        className="
          fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%]
          w-full sm:max-w-2xl max-h-[88vh] flex flex-col !gap-0 p-0
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
                Activity Log
              </DialogTitle>
              <p className="text-sm text-[#64748B] dark:text-slate-400 mt-1">
                Track your recent account activity and security events.
              </p>
            </div>
            {meta && (
              <div className="shrink-0">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#AFF33E]/15 dark:bg-[#AFF33E]/10 text-[#0F172A] dark:text-white text-xs font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#AFF33E]" />
                  {meta.total} {meta.total === 1 ? "Event" : "Events"}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ── Filter Chips ── */}
        <div className="shrink-0 px-7 pb-1">
          <FilterChipsRow
            categories={CATEGORIES}
            selected={category}
            onSelect={(c) => setCategory(c)}
          />
        </div>

        {/* ── Quick Date + Search ── */}
        <div className="shrink-0 px-7 pb-3 pt-0.5">
          <div className="flex items-center gap-2 flex-wrap">
            {QUICK_RANGES.map((r) => (
              <QuickDateChip
                key={r.id}
                active={activeRange === r.id}
                onClick={() => handleQuickRange(r.id)}
              >
                {r.label}
              </QuickDateChip>
            ))}
            <QuickDateChip
              active={showCustomDate}
              onClick={() => { setShowCustomDate(!showCustomDate); setActiveRange(null); }}
            >
              <Calendar className="w-3 h-3 inline-block mr-1" />
              Custom
            </QuickDateChip>

            {/* Search */}
            <div className="relative ml-auto flex-1 max-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#94A3B8] dark:text-slate-500 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search activity…"
                className="w-full h-8 pl-8 pr-3 rounded-xl border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-[#0F172A] dark:text-white placeholder:text-[#94A3B8] dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#AFF33E]/40 focus:border-[#AFF33E]/50 transition-all"
                aria-label="Search activity"
              />
            </div>
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
                  {(dateFrom || dateTo) && (
                    <button
                      onClick={() => { setDateFrom(""); setDateTo(""); setShowCustomDate(false); }}
                      className="text-[10px] text-[#EF4444] hover:text-[#DC2626] font-medium px-2 py-1"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Divider ── */}
        <div className="shrink-0 mx-7 border-t border-[#E2E8F0] dark:border-slate-700/50" />

        {/* ── Entries ── */}
        <div className="flex-1 overflow-y-auto min-h-0 px-7 py-5" role="list" aria-label="Activity events">
          {loading ? (
            <LoadingSkeleton />
          ) : filteredEntries.length === 0 ? (
            <EmptyState hasFilters={hasAnyFilters} />
          ) : (
            <div className="space-y-2.5">
              <AnimatePresence mode="popLayout">
                {filteredEntries.map((entry, idx) => (
                  <EventCard key={entry.id} entry={entry} index={idx} />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* ── Load More ── */}
        {!loading && canLoadMore && filteredEntries.length > 0 && (
          <div className="shrink-0 px-7 pb-5 pt-1">
            <button
              onClick={handleLoadMore}
              disabled={loadingMore}
              className={`
                w-full py-3 rounded-2xl border border-dashed border-[#E2E8F0] dark:border-slate-700
                bg-white dark:bg-slate-800/50 text-sm font-medium
                text-[#64748B] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white
                hover:border-[#CBD5E1] dark:hover:border-slate-600 hover:bg-[#F8FAFC] dark:hover:bg-slate-800
                transition-all duration-200
                focus:outline-none focus-visible:ring-2 focus-visible:ring-[#AFF33E] focus-visible:ring-offset-2
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              {loadingMore ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Loading…
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Load more events
                  <ChevronDown className="w-4 h-4" />
                </span>
              )}
            </button>
          </div>
        )}

        {/* ── Footer count ── */}
        {!loading && filteredEntries.length > 0 && meta && (
          <div className="shrink-0 px-7 pb-4 text-center">
            <p className="text-[10px] text-[#CBD5E1] dark:text-slate-600">
              Showing {Math.min(filteredEntries.length, meta.limit * page)} of {meta.total} events
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
