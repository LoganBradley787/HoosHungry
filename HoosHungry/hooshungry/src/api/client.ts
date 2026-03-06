import axios from "axios";

// Holds a reference to AuthContext's clearAuth, set by AuthProvider on mount.
// This lets the axios interceptor clear React auth state on 401 without a
// hard page redirect or direct dependency on the context.
let authClearCallback: (() => void) | null = null;

export function setAuthClearCallback(fn: () => void) {
  authClearCallback = fn;
}

const apiClient = axios.create({
  baseURL: "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
  withCredentials: true, // Add this to send cookies
});

// Get CSRF token from cookies
function getCookie(name: string) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== "") {
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === name + "=") {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

// Add auth token and CSRF token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }

    // Add CSRF token for state-changing methods
    if (
      config.method &&
      ["post", "put", "patch", "delete"].includes(config.method.toLowerCase())
    ) {
      const csrfToken = getCookie("csrftoken");
      if (csrfToken) {
        config.headers["X-CSRFToken"] = csrfToken;
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Optional: Add response/error interceptors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.data || error.message);

    // Handle 401 Unauthorized - clear auth state so PrivateRoute redirects
    if (error.response?.status === 401) {
      if (authClearCallback) {
        authClearCallback();
      } else {
        localStorage.removeItem("authToken");
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
