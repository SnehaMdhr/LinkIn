import api from "./api";

export const getCustomization = (userId) =>
  api.get(`/profile/customization?userId=${userId}`).then((r) => r.data);

export const updateCustomization = (userId, customization) =>
  api.put("/profile/customization", { userId, customization }).then((r) => r.data);

export const resetCustomization = (userId) =>
  api.put("/profile/customization/reset", { userId }).then((r) => r.data);
