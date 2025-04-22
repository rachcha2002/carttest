// app/verification-pending.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../src/context/AuthContext";

export default function VerificationPendingScreen() {
  const router = useRouter();
  const { logout, checkVerificationStatus, user } = useAuth();
  const [checking, setChecking] = useState(false);

  // Check verification status periodically
  useEffect(() => {
    const checkStatus = async () => {
      if (checking) return;

      setChecking(true);
      try {
        const isVerified = await checkVerificationStatus();
        if (isVerified) {
          // If verified, navigate to the main app
          router.replace("/(tabs)");
        }
      } catch (error) {
        console.error("Error checking verification status:", error);
      } finally {
        setChecking(false);
      }
    };

    // Check immediately on mount
    checkStatus();

    // Then set up interval to check every 30 seconds
    const interval = setInterval(checkStatus, 30000);

    // Clean up interval on unmount
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      router.replace("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <ActivityIndicator size="large" color="#f29f05" />
        <Text style={styles.title}>Account Verification</Text>
        <Text style={styles.message}>
          Your account is being verified by our team. This process usually takes
          24-48 hours. We'll notify you once your account is verified.
        </Text>
        <Text style={styles.status}>
          Status: {checking ? "Checking..." : "Pending"}
        </Text>
        {user && (
          <Text style={styles.emailInfo}>
            We'll send a notification to {user.email} once verified
          </Text>
        )}
      </View>
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginTop: 20,
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  status: {
    fontSize: 18,
    color: "#f29f05",
    fontWeight: "bold",
    marginBottom: 10,
  },
  emailInfo: {
    fontSize: 14,
    color: "#666",
    marginTop: 10,
  },
  logoutButton: {
    backgroundColor: "#f0f0f0",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
  },
  logoutButtonText: {
    color: "#333",
    fontSize: 16,
    fontWeight: "bold",
  },
});
