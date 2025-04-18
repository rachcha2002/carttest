import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import ImageUploader from "../components/ImageUploader";
import LocationPicker from "../components/LocationPicker";
import PasswordChangeModal from "../components/PasswordChangeModal";
import {
  getUserProfile,
  updateUserProfile,
  deactivateAccount,
  removeRestaurantImage,
} from "../services/profileService";

const Profile = () => {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    address: "",
    restaurantInfo: {
      restaurantName: "",
      description: "",
      cuisine: [] as string[],
      businessHours: {
        open: "",
        close: "",
      },
      location: {
        type: "Point" as const,
        coordinates: [0, 0] as [number, number],
      },
      images: [] as Array<{
        url: string;
        description: string;
        isPrimary?: boolean;
        _id: string;
        uploadedAt: string;
      }>,
    },
  });
  const [location, setLocation] = useState({
    address: "",
    coordinates: [0, 0] as [number, number],
  });
  const [confirmDeactivate, setConfirmDeactivate] = useState(false);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user || !user._id) {
        setError("User not authenticated");
        setLoading(false);
        return;
      }

      const profileData = await getUserProfile(user._id);

      // Set form data with retrieved profile data
      setFormData({
        name: profileData.name || "",
        email: profileData.email || "",
        phoneNumber: profileData.phoneNumber || "",
        address: profileData.address || "",
        restaurantInfo: {
          restaurantName: profileData.restaurantInfo?.restaurantName || "",
          description: profileData.restaurantInfo?.description || "",
          cuisine: profileData.restaurantInfo?.cuisine || [],
          businessHours: {
            open: profileData.restaurantInfo?.businessHours?.open || "",
            close: profileData.restaurantInfo?.businessHours?.close || "",
          },
          location: {
            type: "Point",
            coordinates: profileData.restaurantInfo?.location?.coordinates || [
              0, 0,
            ],
          },
          images: profileData.restaurantInfo?.images || [],
        },
      });

      // Set location state if available
      if (profileData.address && profileData.restaurantInfo?.location) {
        setLocation({
          address: profileData.address,
          coordinates: profileData.restaurantInfo.location.coordinates,
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      setError("Failed to load profile data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    if (name.startsWith("restaurantInfo.")) {
      const field = name.split(".")[1];

      if (field === "cuisine") {
        setFormData({
          ...formData,
          restaurantInfo: {
            ...formData.restaurantInfo,
            cuisine: [value], // Store as array with one item
          },
        });
      } else if (field === "businessHours") {
        const subfield = name.split(".")[2];
        setFormData({
          ...formData,
          restaurantInfo: {
            ...formData.restaurantInfo,
            businessHours: {
              ...formData.restaurantInfo.businessHours,
              [subfield]: value,
            },
          },
        });
      } else {
        setFormData({
          ...formData,
          restaurantInfo: {
            ...formData.restaurantInfo,
            [field]: value,
          },
        });
      }
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleLocationChange = (locationData: {
    address: string;
    coordinates: [number, number];
  }) => {
    setLocation(locationData);

    // Update the form data with new location in GeoJSON format
    setFormData({
      ...formData,
      address: locationData.address,
      restaurantInfo: {
        ...formData.restaurantInfo,
        location: {
          type: "Point",
          coordinates: locationData.coordinates,
        },
      },
    });
  };

  const handleImageUpload = (url: string) => {
    // Update the form data with the new image
    setFormData((prev) => ({
      ...prev,
      restaurantInfo: {
        ...prev.restaurantInfo,
        images: [
          ...prev.restaurantInfo.images,
          {
            url,
            description: "Restaurant image",
            isPrimary: false,
            _id: Date.now().toString(), // Temporary ID
            uploadedAt: new Date().toISOString(),
          },
        ],
      },
    }));
  };

  const handleRemoveImage = async (imageId: string) => {
    try {
      setLoading(true);
      setError(null);

      await removeRestaurantImage(imageId);

      // Update the form data by removing the deleted image
      setFormData((prev) => ({
        ...prev,
        restaurantInfo: {
          ...prev.restaurantInfo,
          images: prev.restaurantInfo.images.filter(
            (img) => img._id !== imageId
          ),
        },
      }));

      setSuccess("Image removed successfully!");
    } catch (error) {
      console.error("Error removing image:", error);
      setError("Failed to remove image. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      if (!user || !user._id) {
        setError("User not authenticated");
        setLoading(false);
        return;
      }

      await updateUserProfile(user._id, formData);

      setSuccess("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      setError("Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivateAccount = async () => {
    if (!confirmDeactivate) {
      setConfirmDeactivate(true);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await deactivateAccount();

      // Logout the user after deactivation
      logout();
    } catch (error) {
      console.error("Error deactivating account:", error);
      setError("Failed to deactivate account. Please try again.");
      setConfirmDeactivate(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !formData.name) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#f29f05]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Restaurant Profile</h1>
        <p className="mt-2 text-lg text-gray-700">
          Manage your restaurant information and settings
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-green-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">{success}</p>
            </div>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg rounded-lg overflow-hidden"
      >
        <div className="p-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Owner Name
              </label>
              <input
                type="text"
                name="name"
                id="name"
                value={formData.name}
                onChange={handleChange}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-[#f29f05] focus:outline-none focus:ring-1 focus:ring-[#f29f05] sm:text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email Address
              </label>
              <input
                type="email"
                name="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
                disabled
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm bg-gray-50 sm:text-sm"
              />
              <p className="mt-1 text-xs text-gray-500">
                Email cannot be changed
              </p>
            </div>

            <div>
              <label
                htmlFor="phoneNumber"
                className="block text-sm font-medium text-gray-700"
              >
                Phone Number
              </label>
              <input
                type="tel"
                name="phoneNumber"
                id="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-[#f29f05] focus:outline-none focus:ring-1 focus:ring-[#f29f05] sm:text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="restaurantInfo.restaurantName"
                className="block text-sm font-medium text-gray-700"
              >
                Restaurant Name
              </label>
              <input
                type="text"
                name="restaurantInfo.restaurantName"
                id="restaurantInfo.restaurantName"
                value={formData.restaurantInfo.restaurantName}
                onChange={handleChange}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-[#f29f05] focus:outline-none focus:ring-1 focus:ring-[#f29f05] sm:text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="restaurantInfo.cuisine"
                className="block text-sm font-medium text-gray-700"
              >
                Cuisine Type
              </label>
              <select
                name="restaurantInfo.cuisine"
                id="restaurantInfo.cuisine"
                value={formData.restaurantInfo.cuisine[0] || ""}
                onChange={handleChange}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-[#f29f05] focus:outline-none focus:ring-1 focus:ring-[#f29f05] sm:text-sm"
              >
                <option value="">Select cuisine type</option>
                <option value="indian">Indian</option>
                <option value="chinese">Chinese</option>
                <option value="italian">Italian</option>
                <option value="mexican">Mexican</option>
                <option value="american">American</option>
                <option value="thai">Thai</option>
                <option value="japanese">Japanese</option>
                <option value="mediterranean">Mediterranean</option>
              </select>
            </div>

            <div className="col-span-2">
              <label
                htmlFor="restaurantInfo.description"
                className="block text-sm font-medium text-gray-700"
              >
                Restaurant Description
              </label>
              <textarea
                name="restaurantInfo.description"
                id="restaurantInfo.description"
                rows={3}
                value={formData.restaurantInfo.description}
                onChange={handleChange}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-[#f29f05] focus:outline-none focus:ring-1 focus:ring-[#f29f05] sm:text-sm"
                placeholder="Describe your restaurant, cuisine, and specialties..."
              />
            </div>

            <div>
              <label
                htmlFor="restaurantInfo.businessHours.open"
                className="block text-sm font-medium text-gray-700"
              >
                Opening Time
              </label>
              <input
                type="time"
                name="restaurantInfo.businessHours.open"
                id="restaurantInfo.businessHours.open"
                value={formData.restaurantInfo.businessHours.open}
                onChange={handleChange}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-[#f29f05] focus:outline-none focus:ring-1 focus:ring-[#f29f05] sm:text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="restaurantInfo.businessHours.close"
                className="block text-sm font-medium text-gray-700"
              >
                Closing Time
              </label>
              <input
                type="time"
                name="restaurantInfo.businessHours.close"
                id="restaurantInfo.businessHours.close"
                value={formData.restaurantInfo.businessHours.close}
                onChange={handleChange}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-[#f29f05] focus:outline-none focus:ring-1 focus:ring-[#f29f05] sm:text-sm"
              />
            </div>
          </div>

          <div className="space-y-6">
            {/* Restaurant Images */}
            <div>
              <h2 className="text-lg font-medium text-gray-900">
                Restaurant Images
              </h2>
              <ImageUploader
                onUploadSuccess={handleImageUpload}
                existingImages={formData.restaurantInfo.images}
                onRemoveImage={handleRemoveImage}
              />
            </div>

            {/* Location */}
            <div>
              <h2 className="text-lg font-medium text-gray-900">
                Restaurant Location
              </h2>
              <LocationPicker
                onChange={handleLocationChange}
                initialAddress={formData.address}
                initialCoordinates={
                  formData.restaurantInfo.location.coordinates
                }
              />
            </div>

            {/* Password Change Button */}
            <div>
              <button
                type="button"
                onClick={() => setShowPasswordModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#f29f05] hover:bg-[#f29f05]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#f29f05]"
              >
                Change Password
              </button>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 px-8 py-5">
          <div className="flex justify-between items-center">
            <div>
              <button
                type="button"
                onClick={handleDeactivateAccount}
                className="inline-flex items-center px-4 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                {confirmDeactivate
                  ? "Confirm Deactivation"
                  : "Deactivate Account"}
              </button>
              {confirmDeactivate && (
                <button
                  type="button"
                  onClick={() => setConfirmDeactivate(false)}
                  className="ml-2 inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex justify-center py-2 px-6 border border-transparent rounded-md shadow-md text-white bg-[#f29f05] hover:bg-[#f29f05]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#f29f05] font-medium text-lg"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </form>

      {/* Password Change Modal */}
      <PasswordChangeModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onSuccess={() => {
          setShowPasswordModal(false);
          setSuccess("Password changed successfully!");
        }}
      />
    </div>
  );
};

export default Profile;
