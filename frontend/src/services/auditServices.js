import api from "./api";

/**
 * Get the authenticated user's own activity log.
 * @param {Object} opts - { page, limit, event, dateFrom, dateTo }
 */
export const getMyActivity = async (opts = {}) => {
  const params = new URLSearchParams();
  if (opts.page) params.append("page", opts.page);
  if (opts.limit) params.append("limit", opts.limit);
  if (opts.event) params.append("event", opts.event);
  if (opts.dateFrom) params.append("dateFrom", opts.dateFrom);
  if (opts.dateTo) params.append("dateTo", opts.dateTo);
  const response = await api.get(`/me/activity?${params.toString()}`);
  return response.data;
};

/**
 * Get all audit logs (admin only).
 * @param {Object} opts - { page, limit, event, dateFrom, dateTo, search }
 */
export const getAdminAuditLogs = async (opts = {}) => {
  const params = new URLSearchParams();
  if (opts.page) params.append("page", opts.page);
  if (opts.limit) params.append("limit", opts.limit);
  if (opts.event) params.append("event", opts.event);
  if (opts.dateFrom) params.append("dateFrom", opts.dateFrom);
  if (opts.dateTo) params.append("dateTo", opts.dateTo);
  if (opts.search) params.append("search", opts.search);
  const response = await api.get(`/admin/audit-logs?${params.toString()}`);
  return response.data;
};

/**
 * Verify the integrity of the audit hash chain (admin only, rate-limited).
 */
export const verifyAuditChain = async () => {
  const response = await api.get("/admin/audit-logs/verify");
  return response.data;
};
