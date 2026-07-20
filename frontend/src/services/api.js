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
    // If CSRF endpoint fails, proceed without token (dev mode)
    console.warn("Failed to fetch CSRF token");
  });
  return csrfPromise;
};

api.interceptors.request.use((config) => {
  // Attach JWT Bearer token
  const stored = localStorage.getItem("linkin_user") || sessionStorage.getItem("linkin_user");
  if (stored) {
    try {
      const { token } = JSON.parse(stored);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // Corrupted storage data, ignore
    }
  }

  // Attach CSRF token for state-changing methods (POST, PUT, DELETE, PATCH)
  if (csrfToken && ["post", "put", "delete", "patch"].includes(config.method)) {
    config.headers["X-CSRF-Token"] = csrfToken;
  }

  return config;
});

export default api;