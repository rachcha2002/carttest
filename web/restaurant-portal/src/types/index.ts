export interface MenuItem {
  id: number;
  name: string;
  price: string;
  category: string;
  status: 'active' | 'inactive';
  image: string;
}

export interface Order {
  id: number;
  orderNumber: string;
  customer: string;
  items: string[];
  total: string;
  status: 'preparing' | 'ready' | 'completed';
  time: string;
}

export interface RestaurantProfile {
  name: string;
  email: string;
  phone: string;
  address: string;
  description: string;
  openingHours: string;
  cuisine: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
} 