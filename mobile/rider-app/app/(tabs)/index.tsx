import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FontAwesome5 } from "@expo/vector-icons";
import { useAuth } from "../../src/context/AuthContext";
import { useRouter } from "expo-router";

export default function Dashboard() {
  const [isOnline, setIsOnline] = useState(true);
  const { user, updateProfile } = useAuth();
  const router = useRouter();

  const stats = {
    deliveries: 12,
    earnings: 1250,
    rating: 4.8,
    avgTime: 25,
  };

  // Default profile image if none is available
  const profileImageSource = user?.profilePicture
    ? { uri: user.profilePicture }
    : require("../../assets/default-profile.png"); // Make sure to add a default image

  // Handle availability status change
  const toggleAvailability = async () => {
    try {
      const newStatus = isOnline ? "offline" : "online";

      // Update the status in the backend
      await updateProfile({
        deliveryInfo: {
          ...user?.deliveryInfo,
          availabilityStatus: newStatus,
        },
      });

      // Update local state
      setIsOnline(!isOnline);
    } catch (error) {
      console.error("Failed to update availability:", error);
      console.error("Failed to update availability:", error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>
              Welcome, {user?.name || "Rider"}!
            </Text>
            <Text style={styles.headerSubtitle}>Ready for deliveries?</Text>
          </View>
          <TouchableOpacity
            style={styles.profileImageContainer}
            onPress={() => router.push("/profile")}
          >
            <Image source={profileImageSource} style={styles.profileImage} />
          </TouchableOpacity>
        </View>

        {/* Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusRow}>
            <Text style={styles.statusText}>
              Status: {isOnline ? "Active" : "Offline"}
            </Text>
            <TouchableOpacity
              style={[
                styles.statusButton,
                isOnline ? styles.offlineButton : styles.onlineButton,
              ]}
              onPress={toggleAvailability}
            >
              <Text style={styles.buttonText}>
                {isOnline ? "Go Offline" : "Go Online"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statsItem}>
            <View style={styles.statsContent}>
              <FontAwesome5 name="motorcycle" size={24} color="#f29f05" />
              <Text style={styles.statsNumber}>{stats.deliveries}</Text>
              <Text style={styles.statsLabel}>Today's Deliveries</Text>
            </View>
          </View>
          <View style={styles.statsItem}>
            <View style={styles.statsContent}>
              <FontAwesome5 name="rupee-sign" size={24} color="#f29f05" />
              <Text style={styles.statsNumber}>Rs {stats.earnings}</Text>
              <Text style={styles.statsLabel}>Today's Earnings</Text>
            </View>
          </View>
          <View style={styles.statsItem}>
            <View style={styles.statsContent}>
              <FontAwesome5 name="star" size={24} color="#f29f05" />
              <Text style={styles.statsNumber}>{stats.rating}</Text>
              <Text style={styles.statsLabel}>Rating</Text>
            </View>
          </View>
          <View style={styles.statsItem}>
            <View style={styles.statsContent}>
              <FontAwesome5 name="clock" size={24} color="#f29f05" />
              <Text style={styles.statsNumber}>{stats.avgTime} min</Text>
              <Text style={styles.statsLabel}>Avg. Delivery Time</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: "#f29f05",
    padding: 20,
    paddingTop: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#ffffff",
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#ffffff",
    marginTop: 5,
  },
  profileImageContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#ffffff",
    padding: 2,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  profileImage: {
    width: "100%",
    height: "100%",
    borderRadius: 24,
  },
  statusCard: {
    margin: 16,
    marginTop: -20,
    backgroundColor: "#ffffff",
    borderRadius: 15,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusText: {
    fontSize: 18,
    fontWeight: "600",
  },
  statusButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  onlineButton: {
    backgroundColor: "#f29f05",
  },
  offlineButton: {
    backgroundColor: "#ef4444",
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "600",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 8,
  },
  statsItem: {
    width: "50%",
    padding: 8,
  },
  statsContent: {
    backgroundColor: "#ffffff",
    borderRadius: 15,
    padding: 16,
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  statsNumber: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 8,
  },
  statsLabel: {
    color: "#6b7280",
    marginTop: 4,
  },
});
