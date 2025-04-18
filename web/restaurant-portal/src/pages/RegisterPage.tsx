import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { RegisterData } from "../services/userService";
import ImageUploader from "../components/ImageUploader";
import LocationPicker from "../components/LocationPicker";

interface ImageInfo {
  url: string;
  description: string;
  isPrimary?: boolean;
}

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register, error, clearError, loading } = useAuth();
  const [formData, setFormData] = useState<RegisterData>({
    name: "",
    email: "",
    password: "",
    phoneNumber: "",
    role: "restaurant",
    address: "",
    restaurantInfo: {
      restaurantName: "",
      cuisine: [],
      description: "",
      businessHours: {
        open: "",
        close: "",
      },
      images: [] as ImageInfo[],
      location: {
        type: "Point",
        coordinates: [0, 0] as [number, number],
      },
    },
  });

  const [location, setLocation] = useState({
    address: "",
    coordinates: [0, 0] as [number, number],
  });

  const handleLocationChange = (locationData: {
    address: string;
    coordinates: [number, number];
  }) => {
    setLocation(locationData);

    // Update the formData
    setFormData((prev) => ({
      ...prev,
      address: locationData.address,
      restaurantInfo: {
        ...prev.restaurantInfo,
        location: {
          type: "Point",
          coordinates: locationData.coordinates,
        },
      },
    }));
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
        setFormData((prev) => ({
          ...prev,
          restaurantInfo: {
            ...prev.restaurantInfo,
            cuisine: [value], // Store the selected cuisine as an array with one item
          },
        }));
      } else if (field === "businessHours") {
        const subfield = name.split(".")[2];
        setFormData((prev) => ({
          ...prev,
          restaurantInfo: {
            ...prev.restaurantInfo,
            businessHours: {
              ...prev.restaurantInfo.businessHours,
              [subfield]: value,
            },
          },
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          restaurantInfo: {
            ...prev.restaurantInfo,
            [field]: value,
          },
        }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    if (error) clearError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(formData);
      navigate("/dashboard");
    } catch (error) {
      console.error("Registration failed:", error);
    }
  };

  // Handle image upload success
  const handleImageUpload = (url: string) => {
    setFormData((prev) => {
      const newImages = [...(prev.restaurantInfo.images || [])];

      // Make first image primary by default
      const isPrimary = newImages.length === 0;

      newImages.push({
        url,
        description: "",
        isPrimary,
      });

      return {
        ...prev,
        restaurantInfo: {
          ...prev.restaurantInfo,
          images: newImages,
        },
      };
    });
  };

  const removeImage = (index: number) => {
    setFormData((prev) => {
      const newImages = [...(prev.restaurantInfo.images || [])];
      newImages.splice(index, 1);

      // If we removed the primary image and there are other images,
      // make the first one primary
      if (newImages.length > 0) {
        const hasPrimary = newImages.some((img) => img.isPrimary);
        if (!hasPrimary) {
          newImages[0].isPrimary = true;
        }
      }

      return {
        ...prev,
        restaurantInfo: {
          ...prev.restaurantInfo,
          images: newImages,
        },
      };
    });
  };

  // Add handler to set an image as primary
  const setPrimaryImage = (index: number) => {
    setFormData((prev) => {
      const newImages = [...(prev.restaurantInfo.images || [])].map(
        (img, i) => ({
          ...img,
          isPrimary: i === index,
        })
      );

      return {
        ...prev,
        restaurantInfo: {
          ...prev.restaurantInfo,
          images: newImages,
        },
      };
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900">
            Register Your Restaurant
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Join CraveCart and start managing your restaurant online
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
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

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Restaurant Owner Name
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  required
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
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-[#f29f05] focus:outline-none focus:ring-1 focus:ring-[#f29f05] sm:text-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  id="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-[#f29f05] focus:outline-none focus:ring-1 focus:ring-[#f29f05] sm:text-sm"
                />
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
                  required
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
                  required
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
                  required
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
                  value={formData.restaurantInfo.description || ""}
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
                  required
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
                  required
                  value={formData.restaurantInfo.businessHours.close}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-[#f29f05] focus:outline-none focus:ring-1 focus:ring-[#f29f05] sm:text-sm"
                />
              </div>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Restaurant Images
              </label>
              <p className="text-xs text-gray-500 mb-2">
                Upload photos of your restaurant, food items, and ambiance
              </p>

              <ImageUploader onUploadSuccess={handleImageUpload} />

              {/* Display uploaded images */}
              {formData.restaurantInfo.images &&
                formData.restaurantInfo.images.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
                    {formData.restaurantInfo.images.map(
                      (image: ImageInfo, index: number) => (
                        <div key={index} className="relative group">
                          <img
                            src={image.url}
                            alt={`Restaurant ${index + 1}`}
                            className="h-32 w-full object-cover rounded-md"
                          />

                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-md"></div>

                          {/* Remove button */}
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>

                          {/* Primary badge or set as primary button */}
                          {image.isPrimary ? (
                            <div className="absolute bottom-1 left-1 bg-green-500 text-white text-xs py-1 px-2 rounded-md">
                              Primary
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setPrimaryImage(index)}
                              className="absolute bottom-1 left-1 bg-white bg-opacity-75 hover:bg-opacity-100 text-gray-800 text-xs py-1 px-2 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                            >
                              Set as primary
                            </button>
                          )}

                          {/* Add description input */}
                          <input
                            type="text"
                            placeholder="Image description"
                            value={image.description || ""}
                            onChange={(e) => {
                              const newImages = [
                                ...formData.restaurantInfo.images,
                              ];
                              newImages[index].description = e.target.value;
                              setFormData({
                                ...formData,
                                restaurantInfo: {
                                  ...formData.restaurantInfo,
                                  images: newImages,
                                },
                              });
                            }}
                            className="w-full mt-1 text-xs border rounded p-1"
                          />
                        </div>
                      )
                    )}
                  </div>
                )}
            </div>

            <div className="col-span-2">
              <LocationPicker onChange={handleLocationChange} />
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm">
                <Link
                  to="/login"
                  className="font-medium text-[#f29f05] hover:text-[#f2a706]"
                >
                  Already have an account? Sign in
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#f29f05] hover:bg-[#f2a706] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#f2a706] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Registering..." : "Register Restaurant"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
