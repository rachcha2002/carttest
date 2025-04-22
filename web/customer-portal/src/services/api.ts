import axios from "axios";

// Define the base URL for the API - this should point to your API Gateway
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3001";

// Create an axios instance for API requests
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to include the auth token in all requests
api.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;

      // Check if token is about to expire (within 5 minutes)
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const isExpiringSoon = payload.exp * 1000 - Date.now() < 5 * 60 * 1000;

        if (isExpiringSoon) {
          // Token is about to expire, try to refresh it
          try {
            const response = await axios.post(`${API_URL}/auth/refresh-token`, {
              token,
            });
            const newToken = response.data.token;
            localStorage.setItem("token", newToken);
            config.headers.Authorization = `Bearer ${newToken}`;
          } catch (error) {
            // If refresh fails, continue with current token
            console.warn("Token refresh failed, using existing token");
          }
        }
      } catch (e) {
        // Error parsing token, continue with request
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized - redirect to login
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Auth API functions
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post("/api/auth/login", { email, password });
    return response.data;
  },

  register: async (userData: {
    email: string;
    password: string;
    name: string;
  }) => {
    const response = await api.post("/api/auth/register", userData);
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get("/api/auth/me");
    return response.data;
  },

  updateProfile: async (userData: any) => {
    const response = await api.put("/api/auth/profile", userData);
    return response.data;
  },

  changePassword: async (passwords: {
    currentPassword: string;
    newPassword: string;
  }) => {
    const response = await api.post("/api/auth/change-password", passwords);
    return response.data;
  },

  logout: async () => {
    const response = await api.post("/api/auth/logout");
    return response.data;
  },
};

export default api;
