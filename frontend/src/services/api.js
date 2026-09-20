import axios from "axios";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
  withCredentials: true,
});

// Store the CSRF token fetched once
let csrfToken = null;
let csrfPromise = null;

// Fetch CSRF token from the server (called once on app load)
export const fetchCsrfToken = async () => {
  if (csrfPromise) return csrfPromise;

  csrfPromise = api
    .get("/csrf-token")
    .then((res) => {
      csrfToken = res.data.csrfToken;
      return csrfToken;
    })
    .catch(() => {
      console.warn("Failed to fetch CSRF token");
    });

  return csrfPromise;
};

api.interceptors.request.use((config) => {
  // JWT is sent through the httpOnly cookie
  // withCredentials: true sends the cookie automatically.

  if (
    config.url?.includes("/admin") ||
    config.url?.includes("/me/activity")
  ) {
    console.log(
      "[API] ➡️",
      config.method?.toUpperCase(),
      config.url
    );
  }

  // Attach CSRF token for state-changing methods
  if (
    csrfToken &&
    ["post", "put", "delete", "patch"].includes(
      config.method?.toLowerCase()
    )
  ) {
    config.headers["X-CSRF-Token"] = csrfToken;
  }

  return config;
});

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("linkin_user");
      sessionStorage.removeItem("linkin_user");

      window.dispatchEvent(new CustomEvent("auth:logout"));
    }

    return Promise.reject(error);
  }
);

export default api;