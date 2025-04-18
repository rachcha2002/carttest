export const cloudinaryConfig = {
  cloudName: "dn1w8k2l1",
  uploadPreset: "delivery_profiles",
};

export const uploadToCloudinary = async (uri, type) => {
  try {
    const formData = new FormData();
    formData.append("file", {
      uri,
      type: "image/jpeg",
      name: `${type}_${Date.now()}.jpg`,
    });
    formData.append("upload_preset", cloudinaryConfig.uploadPreset);
    formData.append("cloud_name", cloudinaryConfig.cloudName);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    throw error;
  }
};
