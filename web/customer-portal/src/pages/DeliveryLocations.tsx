import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import LocationPicker from "../components/LocationPicker";

interface DeliveryLocation {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  isDefault: boolean;
}

const DeliveryLocations: React.FC = () => {
  const [locations, setLocations] = useState<DeliveryLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingLocation, setEditingLocation] =
    useState<DeliveryLocation | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    latitude: 0,
    longitude: 0,
    isDefault: false,
  });

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/delivery-locations`
      );
      setLocations(response.data);
    } catch (error) {
      toast.error("Failed to fetch delivery locations");
    } finally {
      setLoading(false);
    }
  };

  const handleLocationSelect = (address: string, lat: number, lng: number) => {
    setFormData((prev) => ({
      ...prev,
      address,
      latitude: lat,
      longitude: lng,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingLocation) {
        await axios.put(
          `${process.env.REACT_APP_API_URL}/api/delivery-locations/${editingLocation.id}`,
          formData
        );
        toast.success("Location updated successfully");
      } else {
        await axios.post(
          `${process.env.REACT_APP_API_URL}/api/delivery-locations`,
          formData
        );
        toast.success("Location added successfully");
      }
      setShowModal(false);
      setEditingLocation(null);
      setFormData({
        name: "",
        address: "",
        latitude: 0,
        longitude: 0,
        isDefault: false,
      });
      fetchLocations();
    } catch (error) {
      toast.error("Failed to save location");
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this location?")) {
      try {
        await axios.delete(
          `${process.env.REACT_APP_API_URL}/api/delivery-locations/${id}`
        );
        toast.success("Location deleted successfully");
        fetchLocations();
      } catch (error) {
        toast.error("Failed to delete location");
      }
    }
  };

  const handleEdit = (location: DeliveryLocation) => {
    setEditingLocation(location);
    setFormData({
      name: location.name,
      address: location.address,
      latitude: location.latitude,
      longitude: location.longitude,
      isDefault: location.isDefault,
    });
    setShowModal(true);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Delivery Locations</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add Location
        </button>
      </div>

      {loading ? (
        <div className="text-center">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {locations.map((location) => (
            <div key={location.id} className="border rounded-lg p-4">
              <h3 className="font-bold">{location.name}</h3>
              <p className="text-gray-600">{location.address}</p>
              <div className="mt-4 flex justify-end space-x-2">
                <button
                  onClick={() => handleEdit(location)}
                  className="text-blue-500 hover:text-blue-700"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(location.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingLocation ? "Edit Location" : "Add Location"}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Location</label>
                <LocationPicker
                  onLocationSelect={handleLocationSelect}
                  initialAddress={editingLocation?.address}
                  initialLat={editingLocation?.latitude}
                  initialLng={editingLocation?.longitude}
                />
              </div>
              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isDefault}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        isDefault: e.target.checked,
                      }))
                    }
                    className="mr-2"
                  />
                  Set as default location
                </label>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingLocation(null);
                    setFormData({
                      name: "",
                      address: "",
                      latitude: 0,
                      longitude: 0,
                      isDefault: false,
                    });
                  }}
                  className="px-4 py-2 border rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  {editingLocation ? "Update" : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryLocations;
