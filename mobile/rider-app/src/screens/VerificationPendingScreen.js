import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const VerificationPendingScreen = ({ navigation }) => {
  const [verificationStatus, setVerificationStatus] = useState("pending");

  useEffect(() => {
    const checkVerificationStatus = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const response = await axios.get("http://your-api-url/api/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.user.isVerified) {
          setVerificationStatus("verified");
          navigation.replace("Home");
        }
      } catch (error) {
        console.error("Error checking verification status:", error);
      }
    };

    const interval = setInterval(checkVerificationStatus, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem("token");
    navigation.replace("Landing");
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <ActivityIndicator size="large" color="#FF6B6B" />
        <Text style={styles.title}>Account Verification</Text>
        <Text style={styles.message}>
          Your account is being verified by our team. This process usually takes
          24-48 hours. We'll notify you once your account is verified.
        </Text>
        <Text style={styles.status}>
          Status: {verificationStatus === "pending" ? "Pending" : "Verified"}
        </Text>
      </View>
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

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
    color: "#FF6B6B",
    fontWeight: "bold",
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

export default VerificationPendingScreen;
