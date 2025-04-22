// app/(tabs)/profile.tsx
import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Image,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FontAwesome5 } from "@expo/vector-icons";
import { useAuth } from "../../src/context/AuthContext";
import * as ImagePicker from "expo-image-picker";
import { uploadToCloudinary } from "../../src/services/uploadService";
import { useRouter } from "expo-router";

export default function Profile() {
  const { user, loading, updateProfile, updateProfileImage, logout } =
    useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const router = useRouter();

  // Initialize form data with user information
  const [formData, setFormData] = useState({
    name: "",
    phoneNumber: "",
    email: "",
    deliveryInfo: {
      vehicleNumber: "",
      vehicleType: "",
    },
  });

  // Load user data when component mounts or user changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        phoneNumber: user.phoneNumber || "",
        email: user.email || "",
        deliveryInfo: {
          vehicleNumber: user.deliveryInfo?.vehicleNumber || "",
          vehicleType: user.deliveryInfo?.vehicleType || "",
        },
      });
    }
  }, [user]);

  // Handle profile picture upload
  const handleProfileImageUpload = async () => {
    try {
      // Request permission
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please allow access to your photo library to upload images."
        );
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;

        setUploadingImage(true);

        try {
          // Upload to Cloudinary
          const uploadedUrl = await uploadToCloudinary(imageUri, "profile");

          if (uploadedUrl) {
            // Update profile picture in backend
            await updateProfileImage(uploadedUrl);
            Alert.alert("Success", "Profile picture updated successfully");
          }
        } catch (error) {
          console.error("Upload error:", error);
          Alert.alert("Upload Failed", "Failed to upload image");
        } finally {
          setUploadingImage(false);
        }
      }
    } catch (error) {
      console.error("Image picker error:", error);
      Alert.alert("Error", "Failed to select image");
      setUploadingImage(false);
    }
  };

  // Handle form submission
  const handleSaveProfile = async () => {
    // Validate form data
    if (!formData.name.trim()) {
      Alert.alert("Error", "Name is required");
      return;
    }

    if (!formData.phoneNumber.trim()) {
      Alert.alert("Error", "Phone number is required");
      return;
    }

    try {
      await updateProfile(formData);
      Alert.alert("Success", "Profile updated successfully");
      setIsEditing(false);
    } catch (error) {
      console.error("Update profile error:", error);
      Alert.alert("Error", "Failed to update profile");
    }
  };

  // Handle logout
  // In app/(tabs)/profile.tsx
  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await logout(() => {
            router.replace("/"); // Navigate to landing screen
          });
        },
      },
    ]);
  };

  // Default profile image if none is available
  const profileImageSource = user?.profilePicture
    ? { uri: user.profilePicture }
    : require("../../assets/default-profile.png"); // Make sure to add a default image

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() =>
              isEditing ? handleSaveProfile() : setIsEditing(true)
            }
            disabled={loading}
          >
            <Text style={styles.editButtonText}>
              {isEditing ? "Save" : "Edit Profile"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Profile Info */}
        <View style={styles.profileSection}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              {uploadingImage ? (
                <ActivityIndicator
                  size="large"
                  color="#f29f05"
                  style={styles.avatar}
                />
              ) : (
                <Image source={profileImageSource} style={styles.avatar} />
              )}
              <TouchableOpacity
                style={styles.editImageButton}
                onPress={handleProfileImageUpload}
                disabled={uploadingImage}
              >
                <FontAwesome5 name="camera" size={16} color="#ffffff" />
              </TouchableOpacity>
            </View>
            <View style={styles.profileInfo}>
              {isEditing ? (
                <TextInput
                  style={styles.inputField}
                  value={formData.name}
                  onChangeText={(text) =>
                    setFormData({ ...formData, name: text })
                  }
                  placeholder="Your Name"
                />
              ) : (
                <Text style={styles.name}>{user?.name || "Rider Name"}</Text>
              )}

              {isEditing ? (
                <TextInput
                  style={styles.inputField}
                  value={formData.phoneNumber}
                  onChangeText={(text) =>
                    setFormData({ ...formData, phoneNumber: text })
                  }
                  placeholder="Phone Number"
                  keyboardType="phone-pad"
                />
              ) : (
                <Text style={styles.phone}>
                  {user?.phoneNumber || "Phone Number"}
                </Text>
              )}
            </View>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{/*user?.rating ||*/ 4.8}</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {/*user?.totalDeliveries ||*/ 156}
              </Text>
              <Text style={styles.statLabel}>Deliveries</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {/*user?.joinDate || */ "Jan 2024"}
              </Text>
              <Text style={styles.statLabel}>Member Since</Text>
            </View>
          </View>
        </View>

        {/* Details Section */}
        <View style={styles.detailsSection}>
          <Text style={styles.sectionTitle}>Account Details</Text>
          <View style={styles.detailItem}>
            <FontAwesome5 name="envelope" size={20} color="#f29f05" />
            <Text style={styles.detailLabel}>Email</Text>
            {isEditing ? (
              <TextInput
                style={[styles.inputField, styles.detailInputField]}
                value={formData.email}
                onChangeText={(text) =>
                  setFormData({ ...formData, email: text })
                }
                placeholder="Email"
                keyboardType="email-address"
                autoCapitalize="none"
                editable={false} // Email should not be editable
              />
            ) : (
              <Text style={styles.detailValue}>
                {user?.email || "Email Address"}
              </Text>
            )}
          </View>
          <View style={styles.detailItem}>
            <FontAwesome5 name="motorcycle" size={20} color="#f29f05" />
            <Text style={styles.detailLabel}>Vehicle Number</Text>
            {isEditing ? (
              <TextInput
                style={[styles.inputField, styles.detailInputField]}
                value={formData.deliveryInfo.vehicleNumber}
                onChangeText={(text) =>
                  setFormData({
                    ...formData,
                    deliveryInfo: {
                      ...formData.deliveryInfo,
                      vehicleNumber: text,
                    },
                  })
                }
                placeholder="Vehicle Number"
              />
            ) : (
              <Text style={styles.detailValue}>
                {user?.deliveryInfo?.vehicleNumber || "Vehicle Number"}
              </Text>
            )}
          </View>
          <View style={styles.detailItem}>
            <FontAwesome5 name="car" size={20} color="#f29f05" />
            <Text style={styles.detailLabel}>Vehicle Type</Text>
            {isEditing ? (
              <TextInput
                style={[styles.inputField, styles.detailInputField]}
                value={formData.deliveryInfo.vehicleType}
                onChangeText={(text) =>
                  setFormData({
                    ...formData,
                    deliveryInfo: {
                      ...formData.deliveryInfo,
                      vehicleType: text,
                    },
                  })
                }
                placeholder="Vehicle Type"
              />
            ) : (
              <Text style={styles.detailValue}>
                {user?.deliveryInfo?.vehicleType || "Vehicle Type"}
              </Text>
            )}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push("/change-password")}
          >
            <FontAwesome5 name="key" size={20} color="#f29f05" />
            <Text style={styles.actionButtonText}>Change Password</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push("/update-documents")}
          >
            <FontAwesome5 name="file-alt" size={20} color="#f29f05" />
            <Text style={styles.actionButtonText}>Update Documents</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <FontAwesome5 name="cog" size={20} color="#f29f05" />
            <Text style={styles.actionButtonText}>Settings</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <FontAwesome5 name="question-circle" size={20} color="#f29f05" />
            <Text style={styles.actionButtonText}>Help & Support</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.logoutButton]}
            onPress={handleLogout}
          >
            <FontAwesome5 name="sign-out-alt" size={20} color="#ef4444" />
            <Text style={[styles.actionButtonText, styles.logoutText]}>
              Logout
            </Text>
          </TouchableOpacity>
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
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#ffffff",
  },
  editButton: {
    backgroundColor: "#ffffff",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  editButtonText: {
    color: "#f29f05",
    fontWeight: "600",
  },
  profileSection: {
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
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  avatarContainer: {
    marginRight: 16,
    position: "relative",
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#f3f4f6",
  },
  editImageButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#f29f05",
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#ffffff",
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  phone: {
    fontSize: 16,
    color: "#6b7280",
  },
  inputField: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 8,
    marginBottom: 5,
    fontSize: 16,
  },
  detailInputField: {
    flex: 1,
    marginLeft: 8,
    textAlign: "right",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 16,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#f29f05",
  },
  statLabel: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 4,
  },
  detailsSection: {
    margin: 16,
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  detailLabel: {
    fontSize: 16,
    color: "#6b7280",
    marginLeft: 12,
    flex: 1,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: "500",
  },
  actionButtons: {
    margin: 16,
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
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  actionButtonText: {
    fontSize: 16,
    marginLeft: 12,
    color: "#374151",
  },
  logoutButton: {
    borderBottomWidth: 0,
  },
  logoutText: {
    color: "#ef4444",
  },
});
