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
} from "react-native";
import { launchImageLibrary } from "react-native-image-picker";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { cloudinary } from "../config/cloudinary";

const RegisterScreen = ({ navigation }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phoneNumber: "",
    vehicleType: "",
    vehicleNumber: "",
    licenseNumber: "",
    profilePicture: null,
    driverLicense: null,
    vehicleRegistration: null,
    insurance: null,
  });

  const handleImageUpload = async (type) => {
    try {
      const result = await launchImageLibrary({
        mediaType: "photo",
        quality: 0.8,
      });

      if (result.assets && result.assets[0]) {
        const image = result.assets[0];
        const formData = new FormData();
        formData.append("file", {
          uri: image.uri,
          type: image.type,
          name: image.fileName,
        });
        formData.append("upload_preset", "delivery_profiles");
        formData.append("cloud_name", "dn1w8k2l1");

        const response = await fetch(
          `https://api.cloudinary.com/v1_1/dn1w8k2l1/image/upload`,
          {
            method: "POST",
            body: formData,
          }
        );

        const data = await response.json();
        setFormData((prev) => ({
          ...prev,
          [type]: data.secure_url,
        }));
      }
    } catch (error) {
      Alert.alert("Error", "Failed to upload image");
    }
  };

  const handleSubmit = async () => {
    try {
      const response = await axios.post(
        "http://your-api-url/api/users/register",
        {
          ...formData,
          role: "delivery",
        }
      );

      if (response.data.token) {
        await AsyncStorage.setItem("token", response.data.token);
        navigation.navigate("VerificationPending");
      }
    } catch (error) {
      Alert.alert(
        "Error",
        error.response?.data?.message || "Registration failed"
      );
    }
  };

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Basic Information</Text>
      <TextInput
        style={styles.input}
        placeholder="Full Name"
        value={formData.name}
        onChangeText={(text) => setFormData({ ...formData, name: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={formData.email}
        onChangeText={(text) => setFormData({ ...formData, email: text })}
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={formData.password}
        onChangeText={(text) => setFormData({ ...formData, password: text })}
        secureTextEntry
      />
      <TextInput
        style={styles.input}
        placeholder="Phone Number"
        value={formData.phoneNumber}
        onChangeText={(text) => setFormData({ ...formData, phoneNumber: text })}
        keyboardType="phone-pad"
      />
      <TouchableOpacity
        style={styles.uploadButton}
        onPress={() => handleImageUpload("profilePicture")}
      >
        <Text style={styles.uploadButtonText}>Upload Profile Picture</Text>
      </TouchableOpacity>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Vehicle Information</Text>
      <TextInput
        style={styles.input}
        placeholder="Vehicle Type"
        value={formData.vehicleType}
        onChangeText={(text) => setFormData({ ...formData, vehicleType: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="Vehicle Number"
        value={formData.vehicleNumber}
        onChangeText={(text) =>
          setFormData({ ...formData, vehicleNumber: text })
        }
      />
      <TextInput
        style={styles.input}
        placeholder="License Number"
        value={formData.licenseNumber}
        onChangeText={(text) =>
          setFormData({ ...formData, licenseNumber: text })
        }
      />
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Required Documents</Text>
      <TouchableOpacity
        style={styles.uploadButton}
        onPress={() => handleImageUpload("driverLicense")}
      >
        <Text style={styles.uploadButtonText}>Upload Driver's License</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.uploadButton}
        onPress={() => handleImageUpload("vehicleRegistration")}
      >
        <Text style={styles.uploadButtonText}>Upload Vehicle Registration</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.uploadButton}
        onPress={() => handleImageUpload("insurance")}
      >
        <Text style={styles.uploadButtonText}>Upload Insurance Document</Text>
      </TouchableOpacity>
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

      <View style={styles.buttonContainer}>
        {step > 1 && (
          <TouchableOpacity
            style={[styles.button, styles.backButton]}
            onPress={() => setStep(step - 1)}
          >
            <Text style={styles.buttonText}>Back</Text>
          </TouchableOpacity>
        )}
        {step < 3 ? (
          <TouchableOpacity
            style={[styles.button, styles.nextButton]}
            onPress={() => setStep(step + 1)}
          >
            <Text style={styles.buttonText}>Next</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.button, styles.submitButton]}
            onPress={handleSubmit}
          >
            <Text style={styles.buttonText}>Submit</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  progressBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  progressStep: {
    flex: 1,
    height: 4,
    backgroundColor: "#ddd",
    marginHorizontal: 5,
  },
  activeStep: {
    backgroundColor: "#FF6B6B",
  },
  stepContainer: {
    marginBottom: 20,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  uploadButton: {
    backgroundColor: "#f0f0f0",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 15,
  },
  uploadButtonText: {
    color: "#333",
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 5,
  },
  backButton: {
    backgroundColor: "#ddd",
  },
  nextButton: {
    backgroundColor: "#FF6B6B",
  },
  submitButton: {
    backgroundColor: "#FF6B6B",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default RegisterScreen;
