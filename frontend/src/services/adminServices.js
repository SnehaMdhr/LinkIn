import api from "./api";

export const getAllUsers = async (search = "", page = 1, limit = 10) => {
  const params = new URLSearchParams();
  if (search) params.append("search", search);
  params.append("page", page);
  params.append("limit", limit);
  const response = await api.get(`/admin/users?${params.toString()}`);
  return response.data;
};

export const getUserDetails = async (id) => {
  const response = await api.get(`/admin/users/${id}`);
  return response.data;
};

export const createUser = async (data) => {
  const response = await api.post("/admin/users", data);
  return response.data;
};

export const updateUser = async (id, data) => {
  const response = await api.put(`/admin/users/${id}`, data);
  return response.data;
};

export const updateUserStatus = async (id, status) => {
  const response = await api.put(`/admin/users/${id}`, { status });
  return response.data;
};

export const deleteUser = async (id) => {
  const response = await api.delete(`/admin/users/${id}`);
  return response.data;
};
