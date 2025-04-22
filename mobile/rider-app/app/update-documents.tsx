// app/update-documents.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FontAwesome5 } from "@expo/vector-icons";
import { useAuth } from "../src/context/AuthContext";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { uploadToCloudinary } from "../src/services/uploadService";

export default function UpdateDocumentsScreen() {
  const {
    user,
    loading,
    updateProfile,
    updateDriverDocuments,
    updateLicenseNumber,
  } = useAuth();
  const router = useRouter();
  const [licenseNumber, setLicenseNumber] = useState("");
  const [uploadingType, setUploadingType] = useState<string | null>(null);

  // Initialize state with user data
  useEffect(() => {
    if (user && user.deliveryInfo) {
      setLicenseNumber(user.deliveryInfo.licenseNumber || "");
    }
  }, [user]);

  // For debugging
  useEffect(() => {
    if (user) {
      console.log(
        "User data:",
        JSON.stringify(
          {
            name: user.name,
            licensNumber: user.deliveryInfo?.licenseNumber,
            documents: user.deliveryInfo?.documents,
          },
          null,
          2
        )
      );
    }
  }, [user]);

  // Handle document upload
  const handleDocumentUpload = async (documentType: string) => {
    try {
      // Request permission
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please allow access to your photo library to upload documents."
        );
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;

        // Set uploading status
        setUploadingType(documentType);

        try {
          // Upload to Cloudinary
          const uploadedUrl = await uploadToCloudinary(imageUri, documentType);

          if (uploadedUrl) {
            // Update document in backend
            // For this example, we'll use updateProfile to update the full user object
            const updatedDeliveryInfo = {
              ...user?.deliveryInfo,
              documents: {
                ...user?.deliveryInfo?.documents,
                [documentType]: {
                  url: uploadedUrl,
                  verified: false,
                  uploadedAt: new Date().toISOString(),
                },
              },
            };

            await updateProfile({
              deliveryInfo: updatedDeliveryInfo,
            });

            Alert.alert("Success", `${documentType} updated successfully`);
          }
        } catch (error) {
          console.error("Upload error:", error);
          Alert.alert("Upload Failed", "Failed to upload document");
        } finally {
          setUploadingType(null);
        }
      }
    } catch (error) {
      console.error("Image picker error:", error);
      Alert.alert("Error", "Failed to select image");
      setUploadingType(null);
    }
  };

  // Handle license number update
  const handleLicenseNumberUpdate = async () => {
    if (!licenseNumber.trim()) {
      Alert.alert("Error", "License number cannot be empty");
      return;
    }

    try {
      await updateProfile({
        deliveryInfo: {
          ...user?.deliveryInfo,
          licenseNumber,
        },
      });

      Alert.alert("Success", "License number updated successfully");
    } catch (error) {
      console.error("Update license number error:", error);
      Alert.alert("Error", "Failed to update license number");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <FontAwesome5 name="arrow-left" size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Update Documents</Text>
        <View style={styles.placeholderView} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>License Information</Text>
          <View style={styles.licenseContainer}>
            <Text style={styles.label}>License Number</Text>
            <TextInput
              style={styles.input}
              value={licenseNumber}
              onChangeText={setLicenseNumber}
              placeholder="Enter license number"
            />
            <TouchableOpacity
              style={styles.updateButton}
              onPress={handleLicenseNumberUpdate}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Update License Number</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Documents</Text>

          <View style={styles.documentItem}>
            <Text style={styles.documentTitle}>Driver's License *</Text>
            {user?.deliveryInfo?.documents?.driverLicense?.verified !==
              undefined && (
              <View
                style={[
                  styles.statusIndicator,
                  user.deliveryInfo.documents.driverLicense.verified
                    ? styles.verifiedStatus
                    : styles.pendingStatus,
                ]}
              >
                <Text style={styles.statusText}>
                  {user.deliveryInfo.documents.driverLicense.verified
                    ? "Verified"
                    : "Pending"}
                </Text>
              </View>
            )}
            <View style={styles.documentContent}>
              {user?.deliveryInfo?.documents?.driverLicense?.url ? (
                <Image
                  source={{
                    uri: user.deliveryInfo.documents.driverLicense.url,
                  }}
                  style={styles.documentImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.documentPlaceholder}>
                  <FontAwesome5 name="id-card" size={24} color="#ccc" />
                  <Text style={styles.placeholderText}>No document</Text>
                </View>
              )}

              <TouchableOpacity
                style={styles.documentButton}
                onPress={() => handleDocumentUpload("driverLicense")}
                disabled={uploadingType !== null}
              >
                {uploadingType === "driverLicense" ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>
                    {user?.deliveryInfo?.documents?.driverLicense?.url
                      ? "Update"
                      : "Upload"}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.documentItem}>
            <Text style={styles.documentTitle}>Vehicle Registration *</Text>
            {user?.deliveryInfo?.documents?.vehicleRegistration?.verified !==
              undefined && (
              <View
                style={[
                  styles.statusIndicator,
                  user.deliveryInfo.documents.vehicleRegistration.verified
                    ? styles.verifiedStatus
                    : styles.pendingStatus,
                ]}
              >
                <Text style={styles.statusText}>
                  {user.deliveryInfo.documents.vehicleRegistration.verified
                    ? "Verified"
                    : "Pending"}
                </Text>
              </View>
            )}
            <View style={styles.documentContent}>
              {user?.deliveryInfo?.documents?.vehicleRegistration?.url ? (
                <Image
                  source={{
                    uri: user.deliveryInfo.documents.vehicleRegistration.url,
                  }}
                  style={styles.documentImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.documentPlaceholder}>
                  <FontAwesome5 name="car" size={24} color="#ccc" />
                  <Text style={styles.placeholderText}>No document</Text>
                </View>
              )}

              <TouchableOpacity
                style={styles.documentButton}
                onPress={() => handleDocumentUpload("vehicleRegistration")}
                disabled={uploadingType !== null}
              >
                {uploadingType === "vehicleRegistration" ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>
                    {user?.deliveryInfo?.documents?.vehicleRegistration?.url
                      ? "Update"
                      : "Upload"}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.documentItem}>
            <Text style={styles.documentTitle}>Insurance (Optional)</Text>
            {user?.deliveryInfo?.documents?.insurance?.verified !==
              undefined && (
              <View
                style={[
                  styles.statusIndicator,
                  user.deliveryInfo.documents.insurance.verified
                    ? styles.verifiedStatus
                    : styles.pendingStatus,
                ]}
              >
                <Text style={styles.statusText}>
                  {user.deliveryInfo.documents.insurance.verified
                    ? "Verified"
                    : "Pending"}
                </Text>
              </View>
            )}
            <View style={styles.documentContent}>
              {user?.deliveryInfo?.documents?.insurance?.url ? (
                <Image
                  source={{ uri: user.deliveryInfo.documents.insurance.url }}
                  style={styles.documentImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.documentPlaceholder}>
                  <FontAwesome5 name="file-alt" size={24} color="#ccc" />
                  <Text style={styles.placeholderText}>No document</Text>
                </View>
              )}

              <TouchableOpacity
                style={styles.documentButton}
                onPress={() => handleDocumentUpload("insurance")}
                disabled={uploadingType !== null}
              >
                {uploadingType === "insurance" ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>
                    {user?.deliveryInfo?.documents?.insurance?.url
                      ? "Update"
                      : "Upload"}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.noteText}>* Required documents</Text>
        </View>

        {/* Show upload timestamps if documents exist */}
        {user?.deliveryInfo?.documents && (
          <View style={styles.uploadTimestamps}>
            <Text style={styles.timestampTitle}>Document Upload History</Text>

            {user.deliveryInfo.documents.driverLicense?.uploadedAt && (
              <View style={styles.timestampItem}>
                <Text style={styles.timestampLabel}>Driver's License:</Text>
                <Text style={styles.timestampValue}>
                  {new Date(
                    user.deliveryInfo.documents.driverLicense.uploadedAt
                  ).toLocaleString()}
                </Text>
              </View>
            )}

            {user.deliveryInfo.documents.vehicleRegistration?.uploadedAt && (
              <View style={styles.timestampItem}>
                <Text style={styles.timestampLabel}>Vehicle Registration:</Text>
                <Text style={styles.timestampValue}>
                  {new Date(
                    user.deliveryInfo.documents.vehicleRegistration.uploadedAt
                  ).toLocaleString()}
                </Text>
              </View>
            )}

            {user.deliveryInfo.documents.insurance?.uploadedAt && (
              <View style={styles.timestampItem}>
                <Text style={styles.timestampLabel}>Insurance:</Text>
                <Text style={styles.timestampValue}>
                  {new Date(
                    user.deliveryInfo.documents.insurance.uploadedAt
                  ).toLocaleString()}
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Same styles as before
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },
  header: {
    backgroundColor: "#f29f05",
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
  },
  placeholderView: {
    width: 36,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  licenseContainer: {
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  updateButton: {
    backgroundColor: "#f29f05",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "bold",
  },
  documentItem: {
    marginBottom: 24,
  },
  documentTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
  },
  statusIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  verifiedStatus: {
    backgroundColor: "#d1fae5",
  },
  pendingStatus: {
    backgroundColor: "#fef3c7",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  documentContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  documentImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 16,
  },
  documentPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  placeholderText: {
    color: "#999",
    fontSize: 12,
    marginTop: 4,
  },
  documentButton: {
    backgroundColor: "#f29f05",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 80,
  },
  noteText: {
    color: "#666",
    fontStyle: "italic",
    marginTop: 8,
  },
  uploadTimestamps: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  timestampTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
  },
  timestampItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  timestampLabel: {
    color: "#666",
  },
  timestampValue: {
    fontWeight: "500",
  },
});
