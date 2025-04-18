export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  restaurantId: string;
  image: string;
}

export interface Restaurant {
  id: string;
  name: string;
  image: string;
  cuisine: string;
  rating: number;
  deliveryTime: string;
  minimumOrder: string;
  address: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  restaurantId: string;
  isAvailable: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  addresses: string[];
}

export interface Order {
  id: string;
  items: CartItem[];
  restaurantId: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';
  totalAmount: number;
  deliveryAddress: string;
  createdAt: string;
  estimatedDeliveryTime?: string;
  deliveryPersonnel?: {
    name: string;
    phone: string;
    location?: {
      lat: number;
      lng: number;
    };
  };
} 