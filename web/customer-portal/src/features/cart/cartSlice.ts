import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  restaurantId: string;
  image: string;
}

interface CartState {
  items: CartItem[];
  restaurantId: string | null;
  totalAmount: number;
  isLoading: boolean;
}

const initialState: CartState = {
  items: [],
  restaurantId: null,
  totalAmount: 0,
  isLoading: false,
};

const calculateTotalAmount = (items: CartItem[]): number => {
  return items.reduce((total, item) => total + item.price * item.quantity, 0);
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem: (state, action: PayloadAction<{ item: CartItem; restaurantId: string }>) => {
      const { item, restaurantId } = action.payload;
      
      // If adding from a different restaurant, clear the cart first
      if (state.restaurantId && state.restaurantId !== restaurantId) {
        state.items = [];
      }
      
      state.restaurantId = restaurantId;
      const existingItem = state.items.find((i) => i.id === item.id);
      
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        state.items.push({ ...item, quantity: 1 });
      }
      
      state.totalAmount = calculateTotalAmount(state.items);
    },
    
    removeItem: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
      state.totalAmount = calculateTotalAmount(state.items);
      
      if (state.items.length === 0) {
        state.restaurantId = null;
      }
    },
    
    updateQuantity: (state, action: PayloadAction<{ id: string; quantity: number }>) => {
      const { id, quantity } = action.payload;
      const item = state.items.find((i) => i.id === id);
      
      if (item) {
        item.quantity = Math.max(0, quantity);
        if (item.quantity === 0) {
          state.items = state.items.filter((i) => i.id !== id);
        }
      }
      
      state.totalAmount = calculateTotalAmount(state.items);
      
      if (state.items.length === 0) {
        state.restaurantId = null;
      }
    },
    
    clearCart: (state) => {
      state.items = [];
      state.restaurantId = null;
      state.totalAmount = 0;
    },
  },
});

export const { addItem, removeItem, updateQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer; 