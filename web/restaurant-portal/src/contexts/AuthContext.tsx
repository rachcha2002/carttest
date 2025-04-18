import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { userService } from "../services/userService";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  phoneNumber?: string;
  address?: string;
  restaurantInfo?: {
    restaurantName: string;
    description: string;
    cuisine: string[];
    businessHours: {
      open: string;
      close: string;
    };
    location: {
      type: string;
      coordinates: [number, number];
    };
    images: Array<{
      url: string;
      description: string;
      isPrimary?: boolean;
      _id: string;
      uploadedAt: string;
    }>;
  };
  deliveryInfo?: {
    currentLocation: {
      type: string;
      coordinates: [number, number];
    };
    availabilityStatus: string;
  };
  isVerified?: boolean;
  status?: string;
  defaultLocations?: any[];
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  sessionTimeRemaining: number | null;
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionTimeRemaining, setSessionTimeRemaining] = useState<
    number | null
  >(null);
  const [tokenCheckInterval, setTokenCheckInterval] =
    useState<NodeJS.Timeout | null>(null);

  // Refreshes the authentication token
  const refreshToken = useCallback(async (): Promise<void> => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await userService.refreshToken(token);
      if (response && response.token) {
        localStorage.setItem("token", response.token);
      }
    } catch (error) {
      console.error("Token refresh failed:", error);
    }
  }, []);

  // Validates the current token and checks its expiration
  const validateToken = useCallback(() => {
    const token = localStorage.getItem("token");
    console.log("Token from localStorage:", token ? "exists" : "not found");

    if (!token) {
      setSessionTimeRemaining(null);
      setIsAuthenticated(false);
      setUser(null);
      return false;
    }

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      console.log("Token payload:", payload);
      const expiryTime = payload.exp * 1000;
      const remaining = Math.floor((expiryTime - Date.now()) / 1000);
      console.log("Token remaining time (seconds):", remaining);

      // Token is expired
      if (remaining <= 0) {
        console.log("Token has expired");
        setSessionTimeRemaining(0);
        setIsAuthenticated(false);
        return false;
      }

      // Token is valid
      setSessionTimeRemaining(remaining);

      // If token is about to expire (within 5 minutes), try to refresh it
      if (remaining < 300) {
        console.log("Token about to expire, refreshing...");
        refreshToken().catch((err) => {
          console.error("Error while refreshing token:", err);
        });
      }

      return true;
    } catch (error) {
      console.error("Token validation error:", error);
      setSessionTimeRemaining(null);
      setIsAuthenticated(false);
      return false;
    }
  }, [refreshToken]);

  // Load minimal user data on initial mount and when token changes
  const loadUser = useCallback(async () => {
    setLoading(true);
    console.log("Loading user...");

    const isTokenValid = validateToken();
    console.log("Token validation result:", isTokenValid);

    if (!isTokenValid) {
      console.log("Token is not valid");
      setLoading(false);
      return;
    }

    try {
      console.log("Fetching current user...");
      const currentUser = await userService.getCurrentUser();
      console.log("Current user data:", currentUser);

      // Store only minimal user data in the context
      setUser({
        _id: currentUser._id,
        name: currentUser.name,
        email: currentUser.email,
        role: currentUser.role,
      });

      setIsAuthenticated(true);
      console.log("User authenticated successfully");
    } catch (error) {
      console.error("Failed to load user:", error);
      localStorage.removeItem("token");
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }, [validateToken]);

  // Setup token validation and user loading on mount
  useEffect(() => {
    loadUser();

    // Set up periodic token validation
    const interval = setInterval(() => {
      validateToken();
    }, 60000); // Check every minute

    setTokenCheckInterval(interval);

    return () => {
      if (tokenCheckInterval) {
        clearInterval(tokenCheckInterval);
      }
    };
  }, [loadUser, validateToken]);

  // Listen for storage events (if user logs out in another tab)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "token") {
        if (!e.newValue) {
          // Token was removed in another tab
          setUser(null);
          setIsAuthenticated(false);
          setSessionTimeRemaining(null);
        } else if (e.newValue !== e.oldValue) {
          // Token was changed in another tab
          loadUser();
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [loadUser]);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await userService.login(email, password);
      localStorage.setItem("token", response.token);

      // Store only minimal user data
      setUser({
        _id: response.user._id,
        name: response.user.name,
        email: response.user.email,
        role: response.user.role,
      });

      setIsAuthenticated(true);
      validateToken(); // Initialize session time
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Login failed";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: any) => {
    try {
      setLoading(true);
      setError(null);
      const response = await userService.register(data);
      localStorage.setItem("token", response.token);

      // Store only minimal user data
      setUser({
        _id: response.user._id,
        name: response.user.name,
        email: response.user.email,
        role: response.user.role,
      });

      setIsAuthenticated(true);
      validateToken(); // Initialize session time
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Registration failed";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setIsAuthenticated(false);
    setSessionTimeRemaining(null);
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        error,
        login,
        register,
        logout,
        clearError,
        sessionTimeRemaining,
        refreshToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
