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
  isInitialized: boolean;
  isLoading: boolean;
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

// Simple storage helper
const storage = {
  get: (key: string) => {
    const item = sessionStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  },
  set: (key: string, value: any) => {
    sessionStorage.setItem(key, JSON.stringify(value));
  },
  remove: (key: string) => {
    sessionStorage.removeItem(key);
  },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Initialize state directly from storage
  const [user, setUser] = useState<User | null>(storage.get("adminUser"));
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!storage.get("adminToken")
  );
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Set up axios interceptors
  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        const token = storage.get("adminToken");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          try {
            await refreshToken();
            const token = storage.get("adminToken");
            error.config.headers.Authorization = `Bearer ${token}`;
            return axios(error.config);
          } catch (refreshError) {
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
      const token = storage.get("adminToken");
      if (!token) throw new Error("No token found");

      const response = await axios.get(api.endpoints.auth.me, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data) {
        setUser(response.data);
        storage.set("adminUser", response.data);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      throw error;
    }
  }, []);

  const refreshToken = async () => {
    try {
      const refreshToken = storage.get("refreshToken");
      if (!refreshToken) throw new Error("No refresh token found");

      const response = await axios.post(api.endpoints.auth.refreshToken, {
        refreshToken,
      });

      if (response.data.token) {
        storage.set("adminToken", response.data.token);
        storage.set("refreshToken", response.data.refreshToken);
        return response.data.token;
      }
      throw new Error("No token in response");
    } catch (error) {
      console.error("Error refreshing token:", error);
      await logout();
      throw error;
    }
  };

  // Initialize auth state
  useEffect(() => {
    const init = async () => {
      try {
        const token = storage.get("adminToken");
        if (token) {
          await getCurrentUser();
        }
      } catch (error) {
        console.error("Initialization error:", error);
        storage.remove("adminToken");
        storage.remove("refreshToken");
        storage.remove("adminUser");
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsInitialized(true);
      }
    };

    init();
  }, [getCurrentUser]);

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post(api.endpoints.auth.login, {
        email,
        password,
      });

      if (response.data.token) {
        storage.set("adminToken", response.data.token);
        storage.set("refreshToken", response.data.refreshToken);
        storage.set("adminUser", response.data.user);
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
      const token = storage.get("adminToken");
      if (token) {
        await axios.post(api.endpoints.auth.logout, null, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      storage.remove("adminToken");
      storage.remove("refreshToken");
      storage.remove("adminUser");
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  if (!isInitialized) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isInitialized,
        isLoading,
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
