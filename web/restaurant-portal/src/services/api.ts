import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3001/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle token expiration
    if (error.response?.status === 401) {
      // Check if the error is due to token expiration
      const isTokenExpired = error.response?.data?.message === "Token expired";

      if (isTokenExpired) {
        // Try to refresh the token if possible
        return refreshTokenAndRetryRequest(error);
      } else {
        // Otherwise, log the user out
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
    }

    // Handle other server errors
    if (error.response?.status === 500) {
      console.error("Server error:", error.response.data);
    }

    return Promise.reject(error);
  }
);

// Function to refresh token and retry the failed request
async function refreshTokenAndRetryRequest(error: any) {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No token found");
    }

    // Call token refresh endpoint
    const response = await axios.post(`${API_URL}/auth/refresh-token`, {
      token,
    });
    const newToken = response.data.token;

    // Update token in localStorage
    localStorage.setItem("token", newToken);

    // Update Authorization header in the original request
    const originalRequest = error.config;
    originalRequest.headers.Authorization = `Bearer ${newToken}`;

    // Retry the original request with the new token
    return axios(originalRequest);
  } catch (refreshError) {
    console.error("Token refresh failed:", refreshError);

    // Clear token and redirect to login
    localStorage.removeItem("token");
    window.location.href = "/login";

    return Promise.reject(refreshError);
  }
}

export default api;
