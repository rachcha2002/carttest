import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { addItem, removeItem, updateQuantity, clearCart } from '../features/cart/cartSlice';
import type { CartItem } from '../types/cart';

export const useCart = () => {
  const dispatch = useDispatch();
  const { items, restaurantId, totalAmount } = useSelector((state: RootState) => state.cart);

  const handleAddItem = (item: Omit<CartItem, 'quantity'>, restaurantId: string) => {
    dispatch(addItem({ item: { ...item, quantity: 1 }, restaurantId }));
  };

  const handleRemoveItem = (itemId: string) => {
    dispatch(removeItem(itemId));
  };

  const handleUpdateQuantity = (itemId: string, quantity: number) => {
    dispatch(updateQuantity({ id: itemId, quantity }));
  };

  const handleClearCart = () => {
    dispatch(clearCart());
  };

  return {
    items,
    restaurantId,
    totalAmount,
    isEmpty: items.length === 0,
    addItem: handleAddItem,
    removeItem: handleRemoveItem,
    updateQuantity: handleUpdateQuantity,
    clearCart: handleClearCart,
  };
}; 