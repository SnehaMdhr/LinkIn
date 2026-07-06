import api from "./api";

// @desc  Get all links for a user
export const getLinks = async (userId) => {
  const response = await api.get(`/links?userId=${userId}`);
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