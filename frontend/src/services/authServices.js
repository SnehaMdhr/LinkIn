import api from "./api";

// @desc  Register a new user
export const registerUser = async (formData) => {
  const response = await api.post("/auth/register", formData);
  return response.data;
};

// @desc  Login an existing user
export const loginUser = async (formData) => {
  const response = await api.post("/auth/login", formData);
  return response.data;
};