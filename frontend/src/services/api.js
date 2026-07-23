import axios from "axios";

const api = axios.create({
  baseURL: "/api",
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
  // Attach JWT Bearer token
  const stored = localStorage.getItem("linkin_user") || sessionStorage.getItem("linkin_user");
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      const token = parsed.token;
      if (token && typeof token === "string" && token.length > 10) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        console.warn("[API] ⚠️ Token invalid in linkin_user:", { type: typeof token, preview: token?.slice(0, 10), fields: Object.keys(parsed) });
      }
    } catch (e) {
      console.warn("[API] ⚠️ Corrupted linkin_user in storage, clearing...");
      localStorage.removeItem("linkin_user");
      sessionStorage.removeItem("linkin_user");
    }
  }

  // Log admin route requests for debugging
  if (config.url?.includes("/admin") || config.url?.includes("/me/activity")) {
    const authHeader = config.headers.Authorization;
    console.log("[API] ➡️", config.method?.toUpperCase(), config.url, {
      hasAuth: !!authHeader,
      tokenPreview: authHeader?.slice(0, 30) + "...",
    });
  }

  // Attach CSRF token for state-changing methods (POST, PUT, DELETE, PATCH)
  if (csrfToken && ["post", "put", "delete", "patch"].includes(config.method)) {
    config.headers["X-CSRF-Token"] = csrfToken;
  }

  return config;
});

// Response interceptor: log 401 details without redirecting
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error("[API] 🔴 401 on", error.config?.url);
      console.error("[API] 🔴 Auth header was:", error.config?.headers?.Authorization?.slice(0, 40) + "...");
    }
    return Promise.reject(error);
  }
);

export default api;