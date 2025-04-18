import React, { useState } from "react";
import ImageUploader from "./ImageUploader";
import {
  addRestaurantImage,
  removeRestaurantImage,
} from "../services/profileService";

interface ImageInfo {
  _id?: string;
  url: string;
  description: string;
  isPrimary?: boolean;
  uploadedAt?: Date;
}

interface RestaurantImagesProps {
  initialImages: ImageInfo[];
  onImagesUpdated: (newImages: ImageInfo[]) => void;
}

const RestaurantImages: React.FC<RestaurantImagesProps> = ({
  initialImages,
  onImagesUpdated,
}) => {
  const [images, setImages] = useState<ImageInfo[]>(initialImages || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = async (url: string) => {
    try {
      setLoading(true);
      setError(null);

      // Default description
      const description = "Restaurant image";

      // Determine if this is the first image (make it primary)
      const isPrimary = images.length === 0;

      // Call API to add the image
      const response = await addRestaurantImage(url, description, isPrimary);

      // Update the images state with the new list from API response
      if (response && response.images) {
        setImages(response.images);
        onImagesUpdated(response.images);
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      setError("Failed to upload image. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveImage = async (imageId: string) => {
    try {
      setLoading(true);
      setError(null);

      // Call API to remove the image
      const response = await removeRestaurantImage(imageId);

      // Update the images state with the new list from API response
      if (response && response.images) {
        setImages(response.images);
        onImagesUpdated(response.images);
      }
    } catch (error) {
      console.error("Error removing image:", error);
      setError("Failed to remove image. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSetPrimary = async (imageId: string) => {
    try {
      // Create a new array with the updated isPrimary flags
      const updatedImages = images.map((img) => ({
        ...img,
        isPrimary: img._id === imageId,
      }));

      // Update local state first for immediate UI feedback
      setImages(updatedImages);
      onImagesUpdated(updatedImages);

      // You would typically call an API to update this on the server
      // This would depend on your API implementation
      // For now, we'll just update the local state
    } catch (error) {
      console.error("Error setting primary image:", error);
      setError("Failed to set primary image.");
    }
  };

  const handleDescriptionChange = (imageId: string, description: string) => {
    // Update local state with the new description
    const updatedImages = images.map((img) =>
      img._id === imageId ? { ...img, description } : img
    );

    setImages(updatedImages);
    onImagesUpdated(updatedImages);

    // In a real application, you would call an API to update this on the server
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Upload New Image
        </h3>
        <ImageUploader
          onUploadSuccess={handleImageUpload}
          buttonText="Upload Restaurant Image"
        />
        {loading && (
          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className="bg-[#f29f05] h-2.5 rounded-full w-full animate-pulse"></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">Uploading...</p>
          </div>
        )}
      </div>

      {images.length > 0 ? (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Restaurant Images
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {images.map((image) => (
              <div
                key={image._id}
                className="relative group border rounded-lg overflow-hidden"
              >
                <img
                  src={image.url}
                  alt={image.description || "Restaurant image"}
                  className="h-48 w-full object-cover"
                />

                <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-30 transition-opacity duration-200"></div>

                <div className="absolute bottom-0 left-0 right-0 bg-white p-2">
                  <input
                    type="text"
                    value={image.description || ""}
                    onChange={(e) =>
                      handleDescriptionChange(image._id!, e.target.value)
                    }
                    className="w-full text-sm border-gray-300 rounded px-2 py-1"
                    placeholder="Image description"
                  />

                  <div className="flex justify-between mt-2">
                    <button
                      onClick={() => handleSetPrimary(image._id!)}
                      className={`text-xs px-2 py-1 rounded ${
                        image.isPrimary
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800 hover:bg-green-50"
                      }`}
                    >
                      {image.isPrimary ? "Primary" : "Set as Primary"}
                    </button>

                    <button
                      onClick={() => handleRemoveImage(image._id!)}
                      className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded hover:bg-red-200"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-6 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-500">No restaurant images uploaded yet</p>
        </div>
      )}
    </div>
  );
};

export default RestaurantImages;
