const API_BASE = import.meta.env.VITE_API_URL || "/api";

export const apiClient = async (endpoint, { body, ...customConfig } = {}) => {
  const token = localStorage.getItem("linkpulse_token");
  const headers = { "Content-Type": "application/json" };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const config = {
    method: body ? "POST" : "GET",
    ...customConfig,
    headers: {
      ...headers,
      ...customConfig.headers,
    },
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "An error occurred during request");
  }

  return data;
};

export const api = {
  // Auth
  register: (payload) => apiClient("/auth/register", { body: payload }),
  login: (payload) => apiClient("/auth/login", { body: payload }),
  getMe: () => apiClient("/auth/me"),
  updateProfile: (payload) =>
    apiClient("/auth/profile", { method: "PUT", body: payload }),

  // Links
  createLink: (payload) => apiClient("/links", { body: payload }),
  getUserLinks: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiClient(`/links${query ? `?${query}` : ""}`);
  },
  getLinkById: (id) => apiClient(`/links/${id}`),
  updateLink: (id, payload) =>
    apiClient(`/links/${id}`, { method: "PUT", body: payload }),
  deleteLink: (id) => apiClient(`/links/${id}`, { method: "DELETE" }),
  getLinkQr: (slug) => apiClient(`/links/qr/${slug}`),

  // Analytics
  getLinkAnalytics: (id, range = "30d") =>
    apiClient(`/analytics/${id}?range=${range}`),
  getUserSummary: () => apiClient("/analytics/summary"),

  // Admin
  getAdminStats: () => apiClient("/admin/stats"),
  getAdminUsers: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiClient(`/admin/users${query ? `?${query}` : ""}`);
  },
  deleteAdminUser: (id) =>
    apiClient(`/admin/users/${id}`, { method: "DELETE" }),
  getAdminLinks: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiClient(`/admin/links${query ? `?${query}` : ""}`);
  },

  // Password gate unlock
  getGateInfo: (slug) => apiClient(`/gate-info/${slug}`),
  unlockPasswordLink: (slug, password) =>
    apiClient(`/verify-password/${slug}`, { body: { password } }),
};
