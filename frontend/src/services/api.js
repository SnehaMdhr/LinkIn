import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true,
});

// Store the CSRF token fetched once
let csrfToken = null;
let csrfPromise = null;

// Fetch CSRF token from the server (called once on app load)
export const fetchCsrfToken = async () => {
  if (csrfPromise) return csrfPromise;
  csrfPromise = api.get("/csrf-token").then((res) => {
    csrfToken = res.data.csrfToken;
    return csrfToken;
  }).catch(() => {
    console.warn("Failed to fetch CSRF token");
  });
  return csrfPromise;
};

api.interceptors.request.use((config) => {
  // JWT is now sent via httpOnly cookie automatically (withCredentials: true).
  // We no longer read from localStorage — the cookie is the single source of truth.
  // The server's verifyToken middleware falls back to req.cookies.token if
  // no Authorization header is present, so removing this doesn't break auth.

  // Log admin route requests for debugging
  if (config.url?.includes("/admin") || config.url?.includes("/me/activity")) {
    console.log("[API] ➡️", config.method?.toUpperCase(), config.url);
  }

  // Attach CSRF token for state-changing methods (POST, PUT, DELETE, PATCH)
  if (csrfToken && ["post", "put", "delete", "patch"].includes(config.method)) {
    config.headers["X-CSRF-Token"] = csrfToken;
  }

  return config;
});

// Response interceptor: handle 401 — clear stale auth and trigger logout
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear stored user data
      localStorage.removeItem("linkin_user");
      sessionStorage.removeItem("linkin_user");

      // Dispatch custom event so AuthProvider can react immediately
      window.dispatchEvent(new CustomEvent("auth:logout"));
    }
    return Promise.reject(error);
  }
);

export default api;