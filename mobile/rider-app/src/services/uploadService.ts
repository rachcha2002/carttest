// src/services/uploadService.ts
import { Platform } from "react-native";

const CLOUDINARY_PRESET = "delivery_profiles";
const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/dn1w8k2l1/image/upload`;

export const uploadToCloudinary = async (uri: string, type: string) => {
  try {
    // Fix URI for Android
    const fileUri =
      Platform.OS === "android" ? uri : uri.replace("file://", "");

    // Create form data
    const formData = new FormData();
    formData.append("file", {
      uri: fileUri,
      type: "image/jpeg",
      name: `${type}_${Date.now()}.jpg`,
    } as any);
    formData.append("upload_preset", CLOUDINARY_PRESET);

    // Upload to Cloudinary
    const response = await fetch(CLOUDINARY_URL, {
      method: "POST",
      body: formData,
      headers: {
        Accept: "application/json",
      },
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message);
    }

    return data.secure_url;
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    throw error;
  }
};
