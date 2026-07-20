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

// @desc  Verify MFA code during login (step 2)
export const verifyMfaLogin = async (userId, token, rememberMe = true) => {
  const response = await api.post("/auth/mfa/verify-login", { userId, token, rememberMe });
  return response.data;
};

// @desc  Get MFA status for current user
export const getMfaStatus = async () => {
  const response = await api.get("/auth/mfa/status");
  return response.data;
};

// @desc  Setup MFA (generate secret + QR code)
export const setupMfa = async () => {
  const response = await api.post("/auth/mfa/setup");
  return response.data;
};

// @desc  Verify and enable MFA setup
export const verifyMfaSetup = async (token) => {
  const response = await api.post("/auth/mfa/verify-setup", { token });
  return response.data;
};

// @desc  Disable MFA
export const disableMfa = async (data) => {
  const response = await api.post("/auth/mfa/disable", data);
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

// @desc  Change password (authenticated user)
export const changePassword = async (data) => {
  const response = await api.post("/auth/change-password", data);
  return response.data;
};

// @desc  Google sign-in with ID token (popup flow)
export const googleSignIn = async (credential) => {
  const response = await api.post("/auth/google", { credential });
  return response.data;
};

// @desc  Reset password with token (legacy — kept for ResetPasswordPage compatibility)
export const resetPassword = async (token, password) => {
  const response = await api.post(`/auth/reset-password/${token}`, { password });
  return response.data;
};