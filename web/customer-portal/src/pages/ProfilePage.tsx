import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useLocations } from "../hooks/useLocations";
import axios from "axios";
import toast from "react-hot-toast";
import LocationSelector from "../components/order/LocationSelector";
import {
  MapPinIcon,
  PlusIcon,
  TrashIcon,
  CheckCircleIcon,
  StarIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";

// Import from our types
import { DefaultLocation } from "../types/locations";

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, token, logout, setUser } = useAuth();

  // Use the custom hook for location management
  const {
    locations,
    defaultLocation,
    isLoading: locationsLoading,
    error: locationsError,
    addLocation,
    deleteLocation,
    setAsDefault,
  } = useLocations();

  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);

  // Add new states for location management
  const [showAddLocationModal, setShowAddLocationModal] = useState(false);
  const [newLocation, setNewLocation] = useState({
    name: "",
    address: "",
    latitude: 0,
    longitude: 0,
  });

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    address: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    address: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    locationName: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phoneNumber: user.phoneNumber || "",
        address: user.address || "",
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleNewLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewLocation((prev) => ({ ...prev, [name]: value }));

    if (name === "name" && errors.locationName) {
      setErrors((prev) => ({ ...prev, locationName: "" }));
    }
  };

  const handleAddressChange = (address: string) => {
    setNewLocation((prev) => ({ ...prev, address }));
  };

  const handleLocationSelect = (lat: number, lng: number) => {
    setNewLocation((prev) => ({
      ...prev,
      latitude: lat,
      longitude: lng,
    }));
  };

  const validatePasswordChange = () => {
    let isValid = true;
    const newErrors = {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    };

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = "Current password is required";
      isValid = false;
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword = "New password is required";
      isValid = false;
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = "Password must be at least 6 characters";
      isValid = false;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      isValid = false;
    }

    setErrors((prev) => ({ ...prev, ...newErrors }));
    return isValid;
  };

  const validateNewLocation = () => {
    let isValid = true;

    if (!newLocation.name.trim()) {
      setErrors((prev) => ({
        ...prev,
        locationName: "Location name is required",
      }));
      isValid = false;
    }

    if (!newLocation.address) {
      toast.error("Please select a location on the map");
      isValid = false;
    }

    return isValid;
  };

  const handleUpdateProfile = async () => {
    try {
      setIsLoading(true);

      // First get current user to ensure we have the ID
      const currentUserResponse = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/auth/me`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const userId = currentUserResponse.data.user._id;

      if (!userId) {
        throw new Error("User ID not found");
      }

      // Now make the update request with the correct user ID
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/users/${userId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      toast.success("Profile updated successfully");
      setIsEditing(false);

      // Update the local user state with the new data
      if (response.data.user) {
        setUser(response.data.user);
      }
    } catch (error: any) {
      console.error("Update profile error:", error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!validatePasswordChange()) {
      return;
    }

    try {
      setIsLoading(true);
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/auth/change-password`,
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Password changed successfully");
      setShowPasswordModal(false);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to change password");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeactivateAccount = async () => {
    try {
      setIsLoading(true);
      await axios.patch(
        `${process.env.REACT_APP_API_URL}/api/users/me/deactivate`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Account deactivated successfully");
      logout();
      navigate("/");
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to deactivate account"
      );
    } finally {
      setIsLoading(false);
      setShowDeactivateModal(false);
    }
  };

  const handleAddLocation = async () => {
    if (!validateNewLocation()) {
      return;
    }

    try {
      // Create the location object
      const locationData = {
        name: newLocation.name,
        address: newLocation.address,
        latitude: newLocation.latitude,
        longitude: newLocation.longitude,
        isDefault: locations.length === 0, // Make default if it's the first
      };

      // Use the hook to add location
      const result = await addLocation(locationData);

      if (result) {
        // Clear form and close modal
        setNewLocation({
          name: "",
          address: "",
          latitude: 0,
          longitude: 0,
        });

        setShowAddLocationModal(false);
        toast.success("Location added successfully");
      }
    } catch (error) {
      console.error("Error adding location:", error);
      toast.error("Failed to add location");
    }
  };

  const handleDeleteLocation = async (locationId: string) => {
    try {
      // Use the hook to delete location
      const success = await deleteLocation(locationId);

      if (success) {
        toast.success("Location removed successfully");
      } else {
        toast.error("Failed to remove location");
      }
    } catch (error) {
      console.error("Error removing location:", error);
      toast.error("Failed to remove location");
    }
  };

  const handleSetDefaultLocation = async (locationId: string) => {
    try {
      // Use the hook to set default location
      const success = await setAsDefault(locationId);

      if (success) {
        toast.success("Default location updated");
      } else {
        toast.error("Failed to update default location");
      }
    } catch (error) {
      console.error("Error setting default location:", error);
      toast.error("Failed to update default location");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
        Profile Settings
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Section - Personal Info */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-6">
            {/* Profile Information */}
            <div>
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                Personal Information
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`mt-1 block w-full rounded-md border ${
                      errors.name
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 dark:border-gray-600 focus:ring-primary"
                    } focus:outline-none focus:ring-2 dark:bg-gray-700 dark:text-white px-4 py-3 h-12`}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`mt-1 block w-full rounded-md border ${
                      errors.email
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 dark:border-gray-600 focus:ring-primary"
                    } focus:outline-none focus:ring-2 dark:bg-gray-700 dark:text-white px-4 py-3 h-12`}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`mt-1 block w-full rounded-md border ${
                      errors.phoneNumber
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 dark:border-gray-600 focus:ring-primary"
                    } focus:outline-none focus:ring-2 dark:bg-gray-700 dark:text-white px-4 py-3 h-12`}
                  />
                  {errors.phoneNumber && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.phoneNumber}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`mt-1 block w-full rounded-md border ${
                      errors.address
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 dark:border-gray-600 focus:ring-primary"
                    } focus:outline-none focus:ring-2 dark:bg-gray-700 dark:text-white px-4 py-3 h-12`}
                  />
                  {errors.address && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.address}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4">
              {!isEditing ? (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-[#f29f05] text-white rounded-md hover:bg-[#e69504] focus:outline-none focus:ring-2 focus:ring-[#f29f05] focus:ring-offset-2"
                  >
                    Edit Profile
                  </button>
                  <button
                    onClick={() => setShowPasswordModal(true)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-offset-2"
                  >
                    Change Password
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleUpdateProfile}
                    disabled={isLoading}
                    className="px-4 py-2 bg-[#f29f05] text-white rounded-md hover:bg-[#e69504] focus:outline-none focus:ring-2 focus:ring-[#f29f05] focus:ring-offset-2 disabled:opacity-50"
                  >
                    {isLoading ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-offset-2"
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>

            {/* Deactivate Account Button */}
            <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowDeactivateModal(true)}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2"
              >
                Deactivate Account
              </button>
            </div>
          </div>
        </div>

        {/* Right Section - Default Locations */}
        <div className="md:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Saved Locations
              </h2>
              <button
                onClick={() => setShowAddLocationModal(true)}
                className="p-1.5 bg-[#f29f05] text-white rounded-full hover:bg-[#e69504] focus:outline-none focus:ring-2 focus:ring-[#f29f05]"
                title="Add new location"
              >
                <PlusIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              {locationsLoading ? (
                <div className="text-center py-6">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#f29f05] mx-auto"></div>
                  <p className="text-gray-500 dark:text-gray-400 mt-2">
                    Loading your locations...
                  </p>
                </div>
              ) : locations.length === 0 ? (
                <div className="text-center py-6">
                  <MapPinIcon className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-500 mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">
                    No saved locations
                  </p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                    Add locations for faster checkout
                  </p>
                </div>
              ) : (
                locations.map((location) => (
                  <div
                    key={location.id}
                    className={`p-3 rounded-lg border ${
                      location.isDefault
                        ? "border-[#f29f05] bg-[#f29f05]/5"
                        : "border-gray-200 dark:border-gray-700"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center">
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {location.name}
                          </h3>
                          {location.isDefault && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#f29f05] text-white">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {location.address}
                        </p>
                      </div>
                      <div className="flex space-x-1">
                        {!location.isDefault && (
                          <button
                            onClick={() =>
                              handleSetDefaultLocation(location.id)
                            }
                            className="p-1 text-gray-500 hover:text-[#f29f05] transition-colors"
                            title="Set as default"
                          >
                            <StarIcon className="h-5 w-5" />
                          </button>
                        )}
                        {location.isDefault && (
                          <div
                            className="p-1 text-[#f29f05]"
                            title="Default location"
                          >
                            <StarIconSolid className="h-5 w-5" />
                          </div>
                        )}
                        <button
                          onClick={() => handleDeleteLocation(location.id)}
                          className="p-1 text-gray-500 hover:text-red-500 transition-colors"
                          title="Delete location"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}

              {locationsError && (
                <div className="text-center py-3">
                  <p className="text-red-500">{locationsError}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="mt-2 text-sm text-primary hover:underline"
                  >
                    Try refreshing the page
                  </button>
                </div>
              )}
            </div>

            <div className="pt-4 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700">
              <p>
                Saved locations will be available during checkout for quicker
                delivery.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              Change Password
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Current Password
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className={`mt-1 block w-full rounded-md border ${
                    errors.currentPassword
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 dark:border-gray-600 focus:ring-primary"
                  } focus:outline-none focus:ring-2 dark:bg-gray-700 dark:text-white px-4 py-3 h-12`}
                />
                {errors.currentPassword && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.currentPassword}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  New Password
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className={`mt-1 block w-full rounded-md border ${
                    errors.newPassword
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 dark:border-gray-600 focus:ring-primary"
                  } focus:outline-none focus:ring-2 dark:bg-gray-700 dark:text-white px-4 py-3 h-12`}
                />
                {errors.newPassword && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.newPassword}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className={`mt-1 block w-full rounded-md border ${
                    errors.confirmPassword
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 dark:border-gray-600 focus:ring-primary"
                  } focus:outline-none focus:ring-2 dark:bg-gray-700 dark:text-white px-4 py-3 h-12`}
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-4">
              <button
                onClick={handleChangePassword}
                disabled={isLoading}
                className="px-4 py-2 bg-[#f29f05] text-white rounded-md hover:bg-[#e69504] focus:outline-none focus:ring-2 focus:ring-[#f29f05] focus:ring-offset-2 disabled:opacity-50"
              >
                {isLoading ? "Changing..." : "Change Password"}
              </button>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-offset-2"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deactivate Account Modal */}
      {showDeactivateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              Deactivate Account
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to deactivate your account? This action
              cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={handleDeactivateAccount}
                disabled={isLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 disabled:opacity-50"
              >
                {isLoading ? "Deactivating..." : "Deactivate Account"}
              </button>
              <button
                onClick={() => setShowDeactivateModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-offset-2"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Location Modal */}
      {/* Add Location Modal */}
      {showAddLocationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white flex items-center">
              <MapPinIcon className="h-5 w-5 mr-2 text-[#f29f05]" />
              Add New Location
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Location Name
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="Home, Work, Gym, etc."
                  value={newLocation.name}
                  onChange={handleNewLocationChange}
                  className={`block w-full rounded-md border ${
                    errors.locationName
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 dark:border-gray-600 focus:ring-primary"
                  } focus:outline-none focus:ring-2 dark:bg-gray-700 dark:text-white px-4 py-3 h-12`}
                />
                {errors.locationName && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.locationName}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Select Location
                </label>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                  Use the map below to pin your location or search for an
                  address
                </p>

                <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                  <LocationSelector
                    initialAddress={newLocation.address}
                    onAddressChange={handleAddressChange}
                    onLocationSelect={handleLocationSelect}
                  />
                </div>

                {newLocation.address && (
                  <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-md flex items-start">
                    <CheckCircleIcon className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-green-800 dark:text-green-400">
                        Location selected
                      </p>
                      <p className="text-xs text-green-700 dark:text-green-500 mt-1">
                        {newLocation.address}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-4">
              <button
                onClick={handleAddLocation}
                disabled={locationsLoading}
                className="px-4 py-2 bg-[#f29f05] text-white rounded-md hover:bg-[#e69504] focus:outline-none focus:ring-2 focus:ring-[#f29f05] focus:ring-offset-2 disabled:opacity-50"
              >
                {locationsLoading ? "Adding..." : "Add Location"}
              </button>
              <button
                onClick={() => setShowAddLocationModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-offset-2"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
