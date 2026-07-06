import api from "./api";

export const getAllUsers = async (search = "") => {
  const response = await api.get(`/admin/users${search ? `?search=${search}` : ""}`);
  return response.data;
};

export const getUserDetails = async (id) => {
  const response = await api.get(`/admin/users/${id}`);
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