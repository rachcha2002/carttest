// src/components/ImageUploader.tsx
import React, { useState } from "react";

interface ImageUploaderProps {
  onUploadSuccess: (url: string) => void;
  buttonText?: string;
  existingImages?: Array<{
    url: string;
    description: string;
    isPrimary?: boolean;
    _id: string;
    uploadedAt: string;
  }>;
  onRemoveImage?: (imageId: string) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  onUploadSuccess,
  buttonText = "Upload Image",
  existingImages = [],
  onRemoveImage,
}) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Hardcode the values for now - this will make debugging easier
  // These should match exactly what you see in your Cloudinary dashboard
  const cloudName = "dn1w8k2l1"; // Your cloud name
  const uploadPreset = "restaurant_images"; // Your upload preset name

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    // Basic validation
    if (!file.type.match(/image\/(jpeg|png|jpg|webp)/)) {
      setError("Please select a valid image file (JPEG, PNG, WebP)");
      return;
    }

    setUploading(true);
    setError(null);
    setUploadProgress(0);

    // Create form data for upload
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    try {
      console.log(
        `Uploading to: https://api.cloudinary.com/v1_1/${cloudName}/image/upload`
      );

      // Use fetch for simplicity during debugging
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error("Upload error response:", data);
        setError(data.error ? data.error.message : "Upload failed");
        setUploading(false);
        return;
      }

      console.log("Upload success:", data);
      onUploadSuccess(data.secure_url);
      setUploading(false);
    } catch (error) {
      console.error("Upload error:", error);
      setError("Network error during upload");
      setUploading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Display existing images */}
      {existingImages.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            Existing Images
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {existingImages.map((image) => (
              <div key={image._id} className="relative group">
                <img
                  src={image.url}
                  alt={image.description}
                  className="w-full h-32 object-cover rounded-lg"
                />
                {image.isPrimary && (
                  <span className="absolute top-2 right-2 bg-[#f29f05] text-white text-xs px-2 py-1 rounded">
                    Primary
                  </span>
                )}
                {onRemoveImage && (
                  <button
                    onClick={() => onRemoveImage(image._id)}
                    className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded hover:bg-red-600"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <label className="block">
        <span className="sr-only">Choose image</span>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          disabled={uploading}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-semibold
            file:bg-orange-50 file:text-[#f29f05]
            hover:file:bg-orange-100
            disabled:opacity-50"
        />
      </label>

      {uploading && (
        <div className="mt-2">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-[#f29f05] h-2.5 rounded-full"
              style={{ width: `100%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-1">Uploading...</p>
        </div>
      )}

      {error && <div className="mt-2 text-sm text-red-600">Error: {error}</div>}
    </div>
  );
};

export default ImageUploader;
