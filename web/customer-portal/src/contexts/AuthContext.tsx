import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

// API base URL
const API_URL = "http://localhost:3000/api";

interface User {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
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
    phoneNumber: string
  ) => Promise<boolean>;
  logout: () => void;
  updateProfile: (userData: Partial<User>) => Promise<boolean>;
  refreshToken: () => Promise<boolean>;
  sessionTimeRemaining: number | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionTimeRemaining, setSessionTimeRemaining] = useState<
    number | null
  >(null);

  // Load user data if token exists
  useEffect(() => {
    const loadUser = async () => {
      if (token && !user) {
        try {
          const response = await axios.get(`${API_URL}/auth/me`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setUser(response.data.user);
        } catch (error) {
          localStorage.removeItem("token");
          setToken(null);
        }
      }
    };

    loadUser();
  }, [token, user]);

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
      setUser(userData);
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
    phoneNumber: string
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${API_URL}/auth/register`, {
        name,
        email,
        password,
        phoneNumber,
        role: "customer",
      });

      const { token: newToken, user: userData } = response.data;
      setUser(userData);
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
      setUser(response.data.user);
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
    try {
      const response = await axios.post(`${API_URL}/auth/refresh-token`, {
        token,
      });

      const { token: newToken } = response.data;
      setToken(newToken);
      localStorage.setItem("token", newToken);
      toast.success("Session refreshed", { id: "session-refresh" });
      return true;
    } catch (error) {
      logout();
      toast.error("Session expired. Please login again.");
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
