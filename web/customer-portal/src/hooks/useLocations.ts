// src/hooks/useLocations.ts
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { DefaultLocation } from "../types/locations";
import locationService from "../services/locationService";
import toast from "react-hot-toast";

export const useLocations = () => {
  const { user, token } = useAuth();
  const [locations, setLocations] = useState<DefaultLocation[]>([]);
  const [defaultLocation, setDefaultLocation] =
    useState<DefaultLocation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Set auth token whenever it changes
  useEffect(() => {
    if (token) {
      locationService.setAuthToken(token);
    }
  }, [token]);

  // Fetch locations whenever user changes
  useEffect(() => {
    if (user?.id) {
      fetchLocations();
    } else {
      // Clear locations if user is not authenticated
      setLocations([]);
      setDefaultLocation(null);
    }
  }, [user?.id]);

  // Fetch all locations for the current user
  const fetchLocations = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      setError(null);

      const userLocations = await locationService.getLocations(user.id);
      setLocations(userLocations);

      // Find and set the default location
      const defaultLoc = userLocations.find((loc) => loc.isDefault) || null;
      setDefaultLocation(defaultLoc);
    } catch (err) {
      console.error("Error fetching locations:", err);
      setError("Failed to load your saved locations");
    } finally {
      setIsLoading(false);
    }
  };

  // Add a new location
  const addLocation = async (
    locationData: Omit<DefaultLocation, "id" | "userId">
  ) => {
    const userId = user?.id;
    if (!userId) {
      toast.error("You must be logged in to save locations");
      return null;
    }

    try {
      setIsLoading(true);
      setError(null);

      const newLocation = await locationService.addLocation({
        ...locationData,
        userId: user.id,
      });

      // Update local state
      await fetchLocations();
      return newLocation;
    } catch (err) {
      console.error("Error adding location:", err);
      setError("Failed to add location");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Delete a location
  const deleteLocation = async (locationId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const success = await locationService.deleteLocation(locationId);

      if (success) {
        // Update local state
        await fetchLocations();
        return true;
      }
      return false;
    } catch (err) {
      console.error("Error deleting location:", err);
      setError("Failed to delete location");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Set a location as default
  const setAsDefault = async (locationId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const success = await locationService.setDefaultLocation(locationId);

      if (success) {
        // Update local state
        await fetchLocations();
        return true;
      }
      return false;
    } catch (err) {
      console.error("Error setting default location:", err);
      setError("Failed to set default location");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    locations,
    defaultLocation,
    isLoading,
    error,
    fetchLocations,
    addLocation,
    deleteLocation,
    setAsDefault,
  };
};
