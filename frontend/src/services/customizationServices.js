import api from "./api";

export const getCustomization = () =>
  api.get("/profile/customization").then((r) => r.data);

export const updateCustomization = (customization) =>
  api.put("/profile/customization", { customization }).then((r) => r.data);

export const resetCustomization = () =>
  api.put("/profile/customization/reset").then((r) => r.data);
