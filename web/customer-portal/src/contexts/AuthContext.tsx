import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

// API base URL
const API_URL = "http://localhost:3001/api";

interface User {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  address: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (
    name: string,
    email: string,
    password: string,
    phoneNumber: string,
    address: string
  ) => Promise<boolean>;
  logout: () => void;
  updateProfile: (userData: Partial<User>) => Promise<boolean>;
  refreshToken: () => Promise<boolean>;
  sessionTimeRemaining: number | null;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );
  const [isLoading, setIsLoading] = useState(true); // Start with loading true
  const [error, setError] = useState<string | null>(null);
  const [sessionTimeRemaining, setSessionTimeRemaining] = useState<
    number | null
  >(null);

  // Load user data if token exists
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          // First try to get user data with current token
          const response = await axios.get(`${API_URL}/auth/me`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          // Transform user data to match our interface
          const userData = response.data.user;
          setUser({
            ...userData,
            id: userData._id || userData.id, // Handle both formats
          });
          setIsLoading(false);
        } catch (error) {
          // If token is invalid, try to refresh it
          try {
            const refreshResponse = await axios.post(
              `${API_URL}/auth/refresh-token`,
              { token }
            );
            const newToken = refreshResponse.data.token;
            setToken(newToken);
            localStorage.setItem("token", newToken);

            // Retry getting user data with new token
            const userResponse = await axios.get(`${API_URL}/auth/me`, {
              headers: {
                Authorization: `Bearer ${newToken}`,
              },
            });

            // Transform user data to match our interface
            const userData = userResponse.data.user;
            setUser({
              ...userData,
              id: userData._id || userData.id, // Handle both formats
            });
          } catch (refreshError) {
            // If refresh also fails, clear everything
            localStorage.removeItem("token");
            setToken(null);
            setUser(null);
          } finally {
            setIsLoading(false);
          }
        }
      } else {
        setIsLoading(false);
      }
    };

    loadUser();
  }, [token]);

  // Token expiration check for session timer
  useEffect(() => {
    if (!token) {
      setSessionTimeRemaining(null);
      return;
    }

    const checkTokenExpiration = () => {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const expiryTime = payload.exp * 1000;
        const remaining = Math.floor((expiryTime - Date.now()) / 1000);
        setSessionTimeRemaining(remaining > 0 ? remaining : 0);

        // If token is about to expire (within 5 minutes), try to refresh it
        if (remaining < 300) {
          refreshToken();
        }
      } catch (error) {
        setSessionTimeRemaining(null);
      }
    };

    checkTokenExpiration();
    const timer = setInterval(checkTokenExpiration, 1000);

    return () => clearInterval(timer);
  }, [token]);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      });
      const { token: newToken, user: userData } = response.data;

      // Transform user data to match our interface
      setUser({
        ...userData,
        id: userData._id || userData.id, // Handle both formats
      });
      setToken(newToken);
      localStorage.setItem("token", newToken);
      toast.success("Login successful!");
      return true;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Login failed";
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    phoneNumber: string,
    address: string
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${API_URL}/auth/register`, {
        name,
        email,
        password,
        phoneNumber,
        address,
        role: "customer",
      });

      const { token: newToken, user: userData } = response.data;

      // Transform user data to match our interface
      setUser({
        ...userData,
        id: userData._id || userData.id, // Handle both formats
      });
      setToken(newToken);
      localStorage.setItem("token", newToken);
      toast.success("Registration successful!");
      return true;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Registration failed";
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    window.dispatchEvent(new Event("user-logout"));
  };

  const updateProfile = async (userData: Partial<User>): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.put(
        `${API_URL}/users/${user?.id}`,
        userData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Transform user data to match our interface
      const updatedUser = response.data.user;
      setUser({
        ...updatedUser,
        id: updatedUser._id || updatedUser.id, // Handle both formats
      });
      toast.success("Profile updated successfully");
      return true;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Profile update failed";
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshToken = async (): Promise<boolean> => {
    if (!token) return false;

    try {
      const response = await axios.post(`${API_URL}/auth/refresh-token`, {
        token,
      });

      const { token: newToken } = response.data;
      setToken(newToken);
      localStorage.setItem("token", newToken);
      return true;
    } catch (error) {
      logout();
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        error,
        isAuthenticated: !!token && !!user,
        login,
        register,
        logout,
        updateProfile,
        refreshToken,
        sessionTimeRemaining,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
