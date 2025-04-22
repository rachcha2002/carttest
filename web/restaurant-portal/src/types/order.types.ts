export interface FoodItem {
  _id: string;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  image?: string;
  options?: any[];
}

export interface TimelineEvent {
  status: string;
  time: Date;
  description: string;
}

export interface OrderLocation {
  latitude: number;
  longitude: number;
  updatedAt?: Date;
}

export interface UserInfo {
  _id: string;
  name: string;
  email: string;
  phoneNumber?: string;
}

export interface RestaurantInfo {
  _id: string;
  name: string;
  address?: string;
  phoneNumber?: string;
}

export interface DriverInfo {
  _id: string;
  name: string;
  phoneNumber?: string;
}

export interface Order {
  _id: string;
  orderId: string;
  user: UserInfo;
  restaurant: RestaurantInfo;
  foods: FoodItem[];
  status: string;
  paymentStatus: 'pending' | 'completed' | 'failed';
  subtotal: number;
  deliveryFee: number;
  tax: number;
  total: number;
  paymentId: string;
  paymentMethod: string;
  deliveryAddress?: string;
  deliveryLocation: OrderLocation;
  deliveryInstructions?: string;
  deliveryTimeline: TimelineEvent[];
  estimatedDeliveryTime?: Date;
  driver?: DriverInfo;
  driverCurrentLocation?: OrderLocation;
  createdAt: Date;
  updatedAt: Date;
} 