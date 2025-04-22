import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import axios from "axios";
import { api } from "../config/api";

interface User {
  _id: string;
  name: string;
  email: string;
  phoneNumber: string;
  role: string;
  isVerified: boolean;
  status: string;
  restaurantInfo?: {
    location: {
      type: string;
      coordinates: number[];
    };
    cuisine: string[];
    images: string[];
  };
  deliveryInfo?: {
    currentLocation: {
      type: string;
      coordinates: number[];
    };
    documents: {
      driverLicense: { verified: boolean };
      vehicleRegistration: { verified: boolean };
      insurance: { verified: boolean };
    };
    availabilityStatus: string;
  };
  defaultLocations: any[];
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  getCurrentUser: () => Promise<void>;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Set up axios interceptors
  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem("adminToken");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // If the error is 401 and we haven't tried to refresh the token yet
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            await refreshToken();
            // Retry the original request with the new token
            originalRequest.headers.Authorization = `Bearer ${localStorage.getItem(
              "adminToken"
            )}`;
            return axios(originalRequest);
          } catch (refreshError) {
            // If refresh token fails, logout the user
            await logout();
            return Promise.reject(refreshError);
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  const getCurrentUser = useCallback(async () => {
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        throw new Error("No token found");
      }

      const response = await axios.get(api.endpoints.auth.me, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      setUser(response.data);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Error in getCurrentUser:", error);
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        try {
          await refreshToken();
          await getCurrentUser();
        } catch (refreshError) {
          console.error("Refresh token error:", refreshError);
          throw refreshError;
        }
      } else {
        throw error;
      }
    }
  }, []);

  const refreshToken = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        throw new Error("No refresh token found");
      }

      const response = await axios.post(
        api.endpoints.auth.refreshToken,
        {
          refreshToken,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.token) {
        localStorage.setItem("adminToken", response.data.token);
        localStorage.setItem("refreshToken", response.data.refreshToken);
        return response.data.token;
      } else {
        throw new Error("No token in response");
      }
    } catch (error) {
      console.error("Refresh token error:", error);
      localStorage.removeItem("adminToken");
      localStorage.removeItem("refreshToken");
      setIsAuthenticated(false);
      throw error;
    }
  };

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        if (token) {
          await getCurrentUser();
        }
      } catch (error) {
        console.error("Initial auth check error:", error);
        localStorage.removeItem("adminToken");
        localStorage.removeItem("refreshToken");
        setIsAuthenticated(false);
      } finally {
        setIsInitialized(true);
      }
    };

    initializeAuth();
  }, [getCurrentUser]);

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post(
        api.endpoints.auth.login,
        {
          email,
          password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.token) {
        localStorage.setItem("adminToken", response.data.token);
        localStorage.setItem("refreshToken", response.data.refreshToken);
        setUser(response.data.user);
        setIsAuthenticated(true);
      } else {
        throw new Error("No token in response");
      }
    } catch (error) {
      console.error("Login error:", error);
      throw new Error("Invalid email or password");
    }
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      if (token) {
        await axios.post(api.endpoints.auth.logout, null, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("adminToken");
      localStorage.removeItem("refreshToken");
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  // Don't render children until auth state is initialized
  if (!isInitialized) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        login,
        logout,
        getCurrentUser,
        refreshToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
