// User type definitions
export interface User {
  _id: string;
  name: string;
  email: string;
  phoneNumber: string;
  role: string;
  address?: string;
  status: string;
  isVerified: boolean;
  profilePicture?: string;
  restaurantInfo?: RestaurantInfo;
  defaultLocations?: LocationInfo[];
  deliveryInfo?: DeliveryInfo;
  createdAt: Date;
  updatedAt: Date;
}

// Image info type
export interface ImageInfo {
  _id?: string;
  url: string;
  description: string;
  isPrimary?: boolean;
  uploadedAt?: Date;
}

// Restaurant info type
export interface RestaurantInfo {
  restaurantName: string;
  description: string;
  cuisine: string[];
  businessHours: {
    open: string;
    close: string;
  };
  location: {
    type?: string;
    coordinates: [number, number];
  };
  images?: ImageInfo[];
}

// Location info type for customer default locations
export interface LocationInfo {
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

// Delivery personnel info type
export interface DeliveryInfo {
  vehicleType: string;
  vehicleNumber: string;
  licenseNumber?: string;
  availabilityStatus: "available" | "busy" | "offline";
  currentLocation: {
    type: string;
    coordinates: [number, number];
  };
}

// Profile form data type for updating profile
export interface ProfileFormData {
  name: string;
  email: string;
  phoneNumber: string;
  address: string;
  restaurantInfo: RestaurantInfo;
}

// Location picker result type
export interface LocationPickerResult {
  address: string;
  coordinates: [number, number];
}
