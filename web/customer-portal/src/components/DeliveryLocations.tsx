import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext";
import LocationPicker from "../components/LocationPicker";

// API base URL
const API_URL = "http://localhost:3001/api";

interface Location {
  _id?: string;
  name: string;
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  location: {
    type: string;
    coordinates: [number, number];
  };
  isDefault: boolean;
  createdAt: Date;
}

const DeliveryLocations: React.FC = () => {
  const { user, token } = useAuth();
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddLocation, setShowAddLocation] = useState(false);
  const [newLocation, setNewLocation] = useState({
    name: "",
    address: {
      street: "",
      city: "",
      state: "",
      postalCode: "",
      country: "",
    },
    location: {
      type: "Point",
      coordinates: [0, 0] as [number, number],
    },
    isDefault: false,
  });

  useEffect(() => {
    if (token) {
      fetchLocations();
    }
  }, [token]);

  const fetchLocations = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_URL}/users/customer/locations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLocations(response.data.locations || []);
    } catch (error) {
      console.error("Error fetching locations:", error);
      toast.error("Failed to load delivery locations");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLocationSelect = (locationData: {
    address: string;
    coordinates: [number, number];
  }) => {
    // Parse the address components from the formatted address
    const addressComponents = locationData.address
      .split(",")
      .map((comp) => comp.trim());
    const street = addressComponents[0] || "";
    const city = addressComponents[1] || "";
    const state = addressComponents[2] || "";
    const postalCode = addressComponents[3] || "";
    const country = addressComponents[4] || "";

    setNewLocation({
      ...newLocation,
      address: {
        street,
        city,
        state,
        postalCode,
        country,
      },
      location: {
        type: "Point",
        coordinates: locationData.coordinates,
      },
    });
  };

  const handleAddLocation = async () => {
    if (!newLocation.name) {
      toast.error("Please enter a name for this location");
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.post(
        `${API_URL}/users/customer/locations`,
        {
          ...newLocation,
          isDefault: locations.length === 0 ? true : newLocation.isDefault,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Location added successfully");
      setLocations(response.data.locations);
      setShowAddLocation(false);
      setNewLocation({
        name: "",
        address: {
          street: "",
          city: "",
          state: "",
          postalCode: "",
          country: "",
        },
        location: {
          type: "Point",
          coordinates: [0, 0],
        },
        isDefault: false,
      });
    } catch (error) {
      console.error("Error adding location:", error);
      toast.error("Failed to add location");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetDefault = async (locationId: string) => {
    try {
      setIsLoading(true);
      const response = await axios.put(
        `${API_URL}/users/customer/locations/${locationId}`,
        { isDefault: true },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Default location updated");
      setLocations(response.data.locations);
    } catch (error) {
      console.error("Error setting default location:", error);
      toast.error("Failed to update default location");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteLocation = async (locationId: string) => {
    try {
      setIsLoading(true);
      const response = await axios.delete(
        `${API_URL}/users/customer/locations/${locationId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Location deleted successfully");
      setLocations(response.data.locations);
    } catch (error) {
      console.error("Error deleting location:", error);
      toast.error("Failed to delete location");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Delivery Locations
        </h2>
        <button
          onClick={() => setShowAddLocation(true)}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          Add New Location
        </button>
      </div>

      {showAddLocation && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Add New Location
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Location Name
              </label>
              <input
                type="text"
                value={newLocation.name}
                onChange={(e) =>
                  setNewLocation({ ...newLocation, name: e.target.value })
                }
                className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white px-4 py-3 h-12"
                placeholder="e.g., Home, Office"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Location on Map
              </label>
              <div className="h-[300px] w-full mb-4">
                <LocationPicker
                  onLocationSelect={(
                    address: string,
                    lat: number,
                    lng: number
                  ) => {
                    handleLocationSelect({
                      address,
                      coordinates: [lng, lat],
                    });
                  }}
                  initialAddress={newLocation.address.street}
                  initialLat={newLocation.location.coordinates[1]}
                  initialLng={newLocation.location.coordinates[0]}
                />
              </div>
            </div>

            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={newLocation.isDefault}
                  onChange={(e) =>
                    setNewLocation({
                      ...newLocation,
                      isDefault: e.target.checked,
                    })
                  }
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Set as default delivery location
                </span>
              </label>
            </div>

            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={() => setShowAddLocation(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Cancel
              </button>
              <button
                onClick={handleAddLocation}
                disabled={isLoading}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50"
              >
                {isLoading ? "Adding..." : "Add Location"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {locations.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">
            No saved locations yet
          </p>
        ) : (
          locations.map((location) => (
            <div
              key={location._id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                    {location.name}
                    {location.isDefault && (
                      <span className="ml-2 text-sm text-primary">
                        (Default)
                      </span>
                    )}
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300 mt-1">
                    {location.address.street}
                    {location.address.city && `, ${location.address.city}`}
                    {location.address.state && `, ${location.address.state}`}
                    {location.address.postalCode &&
                      ` ${location.address.postalCode}`}
                  </p>
                </div>
                <div className="flex space-x-2">
                  {!location.isDefault && (
                    <button
                      onClick={() => handleSetDefault(location._id!)}
                      className="text-sm text-primary hover:text-primary-dark focus:outline-none"
                    >
                      Set as Default
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteLocation(location._id!)}
                    className="text-sm text-red-600 hover:text-red-700 focus:outline-none"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DeliveryLocations;
