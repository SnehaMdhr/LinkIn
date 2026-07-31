import api from "./api";

// @desc  Get all links for the logged-in user
export const getLinks = async () => {
  const response = await api.get("/links");
  return response.data;
};

// @desc  Create a new link
export const createLink = async (linkData) => {
  const response = await api.post("/links", linkData);
  return response.data;
};

// @desc  Update an existing link
export const updateLink = async (id, linkData) => {
  const response = await api.put(`/links/${id}`, linkData);
  return response.data;
};

// @desc  Delete a link
export const deleteLink = async (id) => {
  const response = await api.delete(`/links/${id}`);
  return response.data;
};

// @desc  Reorder links
export const toggleLinkVisibility = async (id, isHidden) => {
  const response = await api.put(`/links/${id}`, { isHidden });
  return response.data;
};

export const toggleLinkPin = async (id, isPinned) => {
  const response = await api.put(`/links/${id}`, { isPinned });
  return response.data;
};

export const reorderLinks = async (items) => {
  const response = await api.put("/links/reorder", { items });
  return response.data;
};