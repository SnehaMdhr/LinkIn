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

// @desc  Forgot password — request reset link
export const forgotPassword = async (email) => {
  const response = await api.post("/auth/forgot-password", { email });
  return response.data;
};

// @desc  Verify OTP and reset password
export const verifyOtpAndResetPassword = async (email, otp, password, confirmPassword) => {
  const response = await api.post("/auth/verify-otp", { email, otp, password, confirmPassword });
  return response.data;
};

// @desc  Reset password with token (legacy — kept for ResetPasswordPage compatibility)
export const resetPassword = async (token, password) => {
  const response = await api.post(`/auth/reset-password/${token}`, { password });
  return response.data;
};