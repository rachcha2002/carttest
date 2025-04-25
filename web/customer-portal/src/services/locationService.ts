// src/services/locationService.ts
import axios from "axios";
import { DefaultLocation, DefaultLocationService } from "../types/locations";

class ApiLocationService implements DefaultLocationService {
  private api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || "http://localhost:3001",
    headers: {
      "Content-Type": "application/json",
    },
  });

  /**
   * Set auth token for API requests
   */
  setAuthToken(token: string | null) {
    if (token) {
      this.api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete this.api.defaults.headers.common["Authorization"];
    }
  }

  /**
   * Get all saved locations for a user
   */
  async getLocations(userId: string): Promise<DefaultLocation[]> {
    try {
      const response = await this.api.get("/api/auth/me");

      // Extract locations from user profile
      const locations = response.data.user.defaultLocations || [];

      // Transform backend response to match our frontend model
      return locations.map((loc: any) => ({
        id: loc._id,
        name: loc.name,
        address: loc.address,
        latitude: loc.location.coordinates[1], // Note: GeoJSON uses [longitude, latitude]
        longitude: loc.location.coordinates[0],
        isDefault: loc.isDefault,
        userId: userId,
        createdAt: loc.createdAt,
      }));
    } catch (error) {
      console.error("Error getting saved locations:", error);
      throw new Error("Failed to load your saved locations");
    }
  }

  /**
   * Add a new location for a user
   */
  async addLocation(
    location: Omit<DefaultLocation, "id">
  ): Promise<DefaultLocation> {
    try {
      const locationData = {
        name: location.name,
        address: location.address,
        coordinates: [location.longitude, location.latitude], // GeoJSON format is [lng, lat]
        isDefault: location.isDefault,
      };

      const response = await this.api.post(
        "/api/users/customer/locations",
        locationData
      );

      // Get the newly created location from the response
      const newLocation = response.data.locations.find(
        (loc: any) =>
          loc.name === location.name && loc.address === location.address
      );

      if (!newLocation) {
        throw new Error("Location was not found in response");
      }

      // Transform to match our frontend model
      return {
        id: newLocation._id,
        name: newLocation.name,
        address: newLocation.address,
        latitude: newLocation.location.coordinates[1],
        longitude: newLocation.location.coordinates[0],
        isDefault: newLocation.isDefault,
        userId: location.userId,
        createdAt: newLocation.createdAt,
      };
    } catch (error) {
      console.error("Error adding location:", error);
      throw new Error("Failed to add location");
    }
  }

  /**
   * Update an existing location
   */
  async updateLocation(
    locationId: string,
    data: Partial<DefaultLocation>
  ): Promise<DefaultLocation> {
    try {
      // Create the update payload in the format expected by the backend
      const updateData: any = {};

      if (data.name) updateData.name = data.name;
      if (data.address) updateData.address = data.address;
      if (data.latitude !== undefined && data.longitude !== undefined) {
        updateData.coordinates = [data.longitude, data.latitude];
      }
      if (data.isDefault !== undefined) updateData.isDefault = data.isDefault;

      const response = await this.api.put(
        `/api/users/customer/locations/${locationId}`,
        updateData
      );

      // Find the updated location in the response
      const updatedLocation = response.data.locations.find(
        (loc: any) => loc._id === locationId
      );

      if (!updatedLocation) {
        throw new Error("Updated location not found in response");
      }

      // Transform to match our frontend model
      return {
        id: updatedLocation._id,
        name: updatedLocation.name,
        address: updatedLocation.address,
        latitude: updatedLocation.location.coordinates[1],
        longitude: updatedLocation.location.coordinates[0],
        isDefault: updatedLocation.isDefault,
        userId: data.userId || "",
        createdAt: updatedLocation.createdAt,
      };
    } catch (error) {
      console.error("Error updating location:", error);
      throw new Error("Failed to update location");
    }
  }

  /**
   * Delete a location
   */
  async deleteLocation(locationId: string): Promise<boolean> {
    try {
      await this.api.delete(`/api/users/customer/locations/${locationId}`);
      return true;
    } catch (error) {
      console.error("Error deleting location:", error);
      throw new Error("Failed to delete location");
    }
  }

  /**
   * Set a location as the default
   */
  async setDefaultLocation(locationId: string): Promise<boolean> {
    try {
      // Use the updateLocation endpoint to set this location as default
      await this.api.put(`/api/users/customer/locations/${locationId}`, {
        isDefault: true,
      });

      return true;
    } catch (error) {
      console.error("Error setting default location:", error);
      throw new Error("Failed to set default location");
    }
  }
}

// Export an instance of the service
const locationService = new ApiLocationService();
export default locationService;
