// src/context/AuthContext.tsx
import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authApi } from "../api/authApi";
import { Alert } from "react-native";
import { useRouter } from "expo-router";
type User = {
  _id: string;
  name: string;
  email: string;
  phoneNumber: string;
  role: string;
  isVerified: boolean;
  status: string;
  profilePicture?: string;
  deliveryInfo?: {
    vehicleType: string;
    vehicleNumber: string;
    licenseNumber: string;
    availabilityStatus: string;
    currentLocation?: {
      type: string;
      coordinates: number[];
    };
    documents?: any;
  };
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  initializing: boolean;
  login: (email: string, password: string) => Promise<any>;
  logout: (callback?: () => void) => Promise<void>;
  register: (userData: any) => Promise<any>;
  updateProfile: (userData: any) => Promise<any>;
  updateProfileImage: (imageUrl: string) => Promise<any>;
  changePassword: (
    currentPassword: string,
    newPassword: string
  ) => Promise<any>;
  checkVerificationStatus: () => Promise<boolean>;
  updateDriverDocuments: (
    documentType: string,
    documentUrl: string
  ) => Promise<any>;
  updateLicenseNumber: (licenseNumber: string) => Promise<any>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: false,
  initializing: true,
  login: async () => ({}),
  logout: async () => {},
  register: async () => ({}),
  updateProfile: async () => ({}),
  updateProfileImage: async () => ({}),
  changePassword: async () => ({}),
  checkVerificationStatus: async () => false,
  updateDriverDocuments: async () => ({}),
  updateLicenseNumber: async () => ({}),
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const router = useRouter();

  // Check if user is already logged in on app startup
  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (token) {
          const response = await authApi.getCurrentUser();
          setUser(response.user);
        }
      } catch (error) {
        console.error("Error loading user:", error);
        // If token is invalid, remove it
        await AsyncStorage.removeItem("token");
      } finally {
        setInitializing(false);
      }
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const data = await authApi.login(email, password);

      // Handle pending verification
      if (data.pendingVerification) {
        Alert.alert(
          "Verification Required",
          "Your account is pending verification. Please wait for an admin to verify your account."
        );
        return data;
      }

      // Save token
      if (data.token) {
        await AsyncStorage.setItem("token", data.token);
      }

      // Set user
      setUser(data.user);
      return data;
    } catch (error: any) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // src/context/AuthContext.tsx
  const logout = async (callback?: () => void) => {
    setLoading(true);
    try {
      await authApi.logout();
      setUser(null);

      // Execute callback if provided (for navigation)
      if (callback) {
        callback();
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: any) => {
    setLoading(true);
    try {
      const data = await authApi.register(userData);

      // Save token
      await AsyncStorage.setItem("token", data.token);

      // Set user
      setUser(data.user);
      return data;
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (userData: any) => {
    setLoading(true);
    try {
      const data = await authApi.updateUserProfile(userData);

      // Update local user state
      setUser((prevUser) => {
        if (!prevUser) return data.user;

        return {
          ...prevUser,
          ...data.user,
        };
      });

      return data;
    } catch (error) {
      console.error("Update profile error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateProfileImage = async (imageUrl: string) => {
    setLoading(true);
    try {
      // Call the API endpoint to update profile picture
      const result = await authApi.updateProfilePicture(imageUrl);

      // Update local user state
      setUser((prevUser) => {
        if (!prevUser) return null;

        // Create an updated user object with the new profile picture
        const updatedUser: User = {
          ...prevUser,
          profilePicture: imageUrl,
        };

        return updatedUser;
      });

      return result;
    } catch (error) {
      console.error("Update profile picture error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateAvailability = async (status: string) => {
    setLoading(true);
    try {
      const data = await authApi.updateDeliveryAvailability(
        status as "online" | "offline"
      );

      // Update local user state with proper type checking
      setUser((prevUser) => {
        if (!prevUser) return null;

        // Make sure all required properties are present
        const updatedUser: User = {
          ...prevUser,
          deliveryInfo: {
            // Keep all existing properties
            vehicleType: prevUser.deliveryInfo?.vehicleType || "", // Provide default if undefined
            vehicleNumber: prevUser.deliveryInfo?.vehicleNumber || "", // Provide default if undefined
            licenseNumber: prevUser.deliveryInfo?.licenseNumber || "", // Provide default if undefined
            // Other optional properties
            ...(prevUser.deliveryInfo || {}),
            // Update the availability status
            availabilityStatus: status,
          },
        };

        return updatedUser;
      });

      return data;
    } catch (error) {
      console.error("Update availability error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (
    currentPassword: string,
    newPassword: string
  ) => {
    setLoading(true);
    try {
      const result = await authApi.changePassword(currentPassword, newPassword);
      return result;
    } catch (error) {
      console.error("Change password error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const checkVerificationStatus = async () => {
    try {
      return await authApi.checkVerificationStatus();
    } catch (error) {
      console.error("Check verification status error:", error);
      return false;
    }
  };

  const updateDriverDocuments = async (
    documentType: string,
    documentUrl: string
  ) => {
    setLoading(true);
    try {
      const result = await authApi.updateDriverDocuments(
        documentType,
        documentUrl
      );

      // Update local user state
      setUser((prevUser) => {
        if (!prevUser) return null;

        // Create a copy with proper typing
        const updatedUser: User = {
          ...prevUser,
          deliveryInfo: {
            // Required properties with defaults if not present
            vehicleType: prevUser.deliveryInfo?.vehicleType || "",
            vehicleNumber: prevUser.deliveryInfo?.vehicleNumber || "",
            licenseNumber: prevUser.deliveryInfo?.licenseNumber || "",
            availabilityStatus:
              prevUser.deliveryInfo?.availabilityStatus || "offline",
            // Other properties
            ...(prevUser.deliveryInfo || {}),
            documents: {
              ...(prevUser.deliveryInfo?.documents || {}),
              [documentType]: {
                url: documentUrl,
                verified: false,
                uploadedAt: new Date().toISOString(),
              },
            },
          },
        };

        return updatedUser;
      });

      return result;
    } catch (error) {
      console.error("Update driver documents error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateLicenseNumber = async (licenseNumber: string) => {
    setLoading(true);
    try {
      const result = await authApi.updateLicenseNumber(licenseNumber);

      // Update local user state
      setUser((prevUser) => {
        if (!prevUser) return null;

        // Create an updated user object with the proper typing
        const updatedUser: User = {
          ...prevUser,
          deliveryInfo: {
            // Required properties with defaults if not present
            vehicleType: prevUser.deliveryInfo?.vehicleType || "",
            vehicleNumber: prevUser.deliveryInfo?.vehicleNumber || "",
            availabilityStatus:
              prevUser.deliveryInfo?.availabilityStatus || "offline",
            // Update the license number
            licenseNumber: licenseNumber,
            // Keep other properties
            ...(prevUser.deliveryInfo || {}),
          },
        };

        return updatedUser;
      });

      return result;
    } catch (error) {
      console.error("Update license number error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        initializing,
        login,
        logout,
        register,
        updateProfile,
        updateProfileImage,
        changePassword,
        checkVerificationStatus,
        updateDriverDocuments,
        updateLicenseNumber,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
