// app/register.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../src/context/AuthContext";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";

export default function RegisterScreen() {
  const router = useRouter();
  const { register, loading } = useAuth();

  const [step, setStep] = useState(1);
  const [uploading, setUploading] = useState(false);

  // Personal Information
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [profilePicture, setProfilePicture] = useState(null);

  // Vehicle Information
  const [vehicleType, setVehicleType] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");

  // Documents
  const [driverLicense, setDriverLicense] = useState(null);
  const [vehicleRegistration, setVehicleRegistration] = useState(null);
  const [insurance, setInsurance] = useState(null);

  // CloudinaryUpload function
  // Update the uploadToCloudinary function
  const uploadToCloudinary = async (uri: string, type: string) => {
    try {
      setUploading(true);

      // Create form data
      const formData = new FormData();

      // This is the right way to append a file to FormData in React Native/TypeScript
      formData.append("file", {
        uri,
        type: "image/jpeg",
        name: `${type}_${Date.now()}.jpg`,
      } as unknown as Blob); // Type assertion to make TypeScript happy

      formData.append("upload_preset", "delivery_profiles");
      formData.append("cloud_name", "dn1w8k2l1");

      // Upload to Cloudinary
      const response = await fetch(
        "https://api.cloudinary.com/v1_1/dn1w8k2l1/image/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message);
      }

      return data.secure_url;
    } catch (error) {
      console.error("Error uploading to Cloudinary:", error);
      Alert.alert("Upload Failed", "Failed to upload image. Please try again.");
      return null;
    } finally {
      setUploading(false);
    }
  };
  // Pick Image function
  const pickImage = async (
    type: "profile" | "license" | "registration" | "insurance"
  ) => {
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
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;

        // Upload to Cloudinary
        const uploadedUrl = await uploadToCloudinary(imageUri, type);

        if (uploadedUrl) {
          // Set the appropriate state based on document type
          switch (type) {
            case "profile":
              setProfilePicture(uploadedUrl);
              break;
            case "license":
              setDriverLicense(uploadedUrl);
              break;
            case "registration":
              setVehicleRegistration(uploadedUrl);
              break;
            case "insurance":
              setInsurance(uploadedUrl);
              break;
          }
        }
      }
    } catch (error) {
      console.error("Image picker error:", error);
      Alert.alert("Error", "Failed to select image");
    }
  };
  // Validation functions
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateStep1 = () => {
    if (!name.trim()) {
      Alert.alert("Error", "Please enter your name");
      return false;
    }

    if (!email.trim() || !validateEmail(email)) {
      Alert.alert("Error", "Please enter a valid email address");
      return false;
    }

    if (!password || password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return false;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return false;
    }

    if (!phoneNumber.trim()) {
      Alert.alert("Error", "Please enter your phone number");
      return false;
    }

    return true;
  };

  const validateStep2 = () => {
    if (!vehicleType.trim()) {
      Alert.alert("Error", "Please enter your vehicle type");
      return false;
    }

    if (!vehicleNumber.trim()) {
      Alert.alert("Error", "Please enter your vehicle number");
      return false;
    }

    if (!licenseNumber.trim()) {
      Alert.alert("Error", "Please enter your license number");
      return false;
    }

    return true;
  };

  const validateStep3 = () => {
    if (!driverLicense) {
      Alert.alert("Error", "Please upload your driver's license");
      return false;
    }

    if (!vehicleRegistration) {
      Alert.alert("Error", "Please upload your vehicle registration");
      return false;
    }

    return true;
  };

  // Handle step transitions
  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  // Handle submission
  const handleSubmit = async () => {
    if (!validateStep3()) {
      return;
    }

    try {
      const documents = {
        driverLicense: {
          url: driverLicense,
          verified: false,
          uploadedAt: new Date().toISOString(),
        },
        vehicleRegistration: {
          url: vehicleRegistration,
          verified: false,
          uploadedAt: new Date().toISOString(),
        },
      };

      // Prepare registration data
      const registrationData = {
        name,
        email,
        password,
        phoneNumber,
        role: "delivery",
        profilePicture,
        deliveryInfo: {
          vehicleType,
          vehicleNumber,
          licenseNumber,
          availabilityStatus: "offline",
          currentLocation: {
            type: "Point",
            coordinates: [0, 0],
          },
          documents: documents, // Use the documents object defined above
        },
      };

      // Add insurance if provided
      if (insurance) {
        // TypeScript-safe way to add the insurance property
        (registrationData.deliveryInfo.documents as any).insurance = {
          url: insurance,
          verified: false,
          uploadedAt: new Date().toISOString(),
        };
      }

      // Register user
      await register(registrationData);

      // Navigate to verification page
      router.replace("/verification-pending");
    } catch (error: any) {
      console.error("Registration error:", error);
      let errorMessage = "Registration failed. Please try again.";

      if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      // const errorMessage =
      //   error.response?.data?.message ||
      //   "Registration failed. Please try again.";
      Alert.alert("Registration Error", errorMessage);
    }
  };

  // Render Step 1: Personal Information
  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Personal Information</Text>
      <Text style={styles.stepSubtitle}>Step 1 of 3</Text>

      <TouchableOpacity
        style={styles.profileImageContainer}
        onPress={() => pickImage("profile")}
        disabled={uploading}
      >
        {profilePicture ? (
          <Image source={{ uri: profilePicture }} style={styles.profileImage} />
        ) : (
          <View style={styles.profileImagePlaceholder}>
            <Text style={styles.profileImageText}>Upload Profile Picture</Text>
          </View>
        )}
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        placeholder="Full Name"
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />

      <TextInput
        style={styles.input}
        placeholder="Phone Number"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        keyboardType="phone-pad"
      />

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.nextButton}
          onPress={handleNext}
          disabled={uploading}
        >
          <Text style={styles.nextButtonText}>Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Render Step 2: Vehicle Information
  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Vehicle Information</Text>
      <Text style={styles.stepSubtitle}>Step 2 of 3</Text>

      <TextInput
        style={styles.input}
        placeholder="Vehicle Type (e.g., Bike, Car, Van)"
        value={vehicleType}
        onChangeText={setVehicleType}
      />

      <TextInput
        style={styles.input}
        placeholder="Vehicle Number"
        value={vehicleNumber}
        onChangeText={setVehicleNumber}
      />

      <TextInput
        style={styles.input}
        placeholder="License Number"
        value={licenseNumber}
        onChangeText={setLicenseNumber}
      />

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Render Step 3: Documents
  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Required Documents</Text>
      <Text style={styles.stepSubtitle}>Step 3 of 3</Text>

      <View style={styles.documentContainer}>
        <Text style={styles.documentLabel}>Driver's License *</Text>
        <TouchableOpacity
          style={styles.documentButton}
          onPress={() => pickImage("license")}
          disabled={uploading}
        >
          {driverLicense ? (
            <View style={styles.uploadedDocument}>
              <Image
                source={{ uri: driverLicense }}
                style={styles.documentThumbnail}
              />
              <Text style={styles.uploadedText}>Uploaded</Text>
            </View>
          ) : (
            <Text style={styles.documentButtonText}>Upload License</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.documentContainer}>
        <Text style={styles.documentLabel}>Vehicle Registration *</Text>
        <TouchableOpacity
          style={styles.documentButton}
          onPress={() => pickImage("registration")}
          disabled={uploading}
        >
          {vehicleRegistration ? (
            <View style={styles.uploadedDocument}>
              <Image
                source={{ uri: vehicleRegistration }}
                style={styles.documentThumbnail}
              />
              <Text style={styles.uploadedText}>Uploaded</Text>
            </View>
          ) : (
            <Text style={styles.documentButtonText}>Upload Registration</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.documentContainer}>
        <Text style={styles.documentLabel}>Insurance (Optional)</Text>
        <TouchableOpacity
          style={styles.documentButton}
          onPress={() => pickImage("insurance")}
          disabled={uploading}
        >
          {insurance ? (
            <View style={styles.uploadedDocument}>
              <Image
                source={{ uri: insurance }}
                style={styles.documentThumbnail}
              />
              <Text style={styles.uploadedText}>Uploaded</Text>
            </View>
          ) : (
            <Text style={styles.documentButtonText}>Upload Insurance</Text>
          )}
        </TouchableOpacity>
      </View>

      <Text style={styles.requiredText}>* Required documents</Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          disabled={loading || uploading}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.submitButton,
            (loading || uploading) && styles.disabledButton,
          ]}
          onPress={handleSubmit}
          disabled={loading || uploading}
        >
          {loading || uploading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Submit</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.progressBar}>
        <View style={[styles.progressStep, step >= 1 && styles.activeStep]} />
        <View style={[styles.progressStep, step >= 2 && styles.activeStep]} />
        <View style={[styles.progressStep, step >= 3 && styles.activeStep]} />
      </View>

      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}

      {uploading && (
        <View style={styles.uploadingOverlay}>
          <ActivityIndicator size="large" color="#f29f05" />
          <Text style={styles.uploadingText}>Uploading Image...</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  progressBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 40,
    marginBottom: 20,
  },
  progressStep: {
    flex: 1,
    height: 4,
    backgroundColor: "#ddd",
    marginHorizontal: 5,
  },
  activeStep: {
    backgroundColor: "#f29f05",
  },
  stepContainer: {
    marginBottom: 20,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
  },
  stepSubtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
  },
  profileImageContainer: {
    alignSelf: "center",
    marginBottom: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  profileImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderStyle: "dashed",
  },
  profileImageText: {
    textAlign: "center",
    color: "#666",
    fontSize: 14,
    padding: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  documentContainer: {
    marginBottom: 15,
  },
  documentLabel: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: "500",
  },
  documentButton: {
    backgroundColor: "#f0f0f0",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    height: 70,
  },
  documentButtonText: {
    color: "#333",
    fontSize: 16,
  },
  uploadedDocument: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  documentThumbnail: {
    width: 50,
    height: 50,
    borderRadius: 4,
    marginRight: 10,
  },
  uploadedText: {
    color: "#4CAF50",
    fontWeight: "500",
  },
  requiredText: {
    color: "#666",
    fontStyle: "italic",
    marginTop: 5,
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  backButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
    marginRight: 8,
    alignItems: "center",
  },
  backButtonText: {
    color: "#333",
    fontWeight: "bold",
  },
  nextButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    backgroundColor: "#f29f05",
    marginLeft: 8,
    alignItems: "center",
  },
  nextButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  submitButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    backgroundColor: "#f29f05",
    marginLeft: 8,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  disabledButton: {
    opacity: 0.7,
  },
  uploadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  uploadingText: {
    color: "#fff",
    marginTop: 10,
  },
});
