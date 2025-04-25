// src/types/locations.ts

export interface DefaultLocation {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  isDefault: boolean;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DefaultLocationService {
  getLocations: (userId: string) => Promise<DefaultLocation[]>;
  addLocation: (
    location: Omit<DefaultLocation, "id">
  ) => Promise<DefaultLocation>;
  updateLocation: (
    locationId: string,
    data: Partial<DefaultLocation>
  ) => Promise<DefaultLocation>;
  deleteLocation: (locationId: string) => Promise<boolean>;
  setDefaultLocation: (locationId: string) => Promise<boolean>;
}
