import api from "./api";

export const trackProfileView = async (userId) => {
  const response = await api.post("/analytics/profile-view", { userId });
  return response.data;
};

export const trackLinkClick = async (userId, linkId) => {
  const response = await api.post("/analytics/link-click", { userId, linkId });
  return response.data;
};

export const trackQrScan = async (userId) => {
  const response = await api.post("/analytics/qr-scan", { userId });
  return response.data;
};

export const getUserStats = async (userId) => {
  const response = await api.get(`/analytics/stats?userId=${userId}`);
  return response.data;
};
