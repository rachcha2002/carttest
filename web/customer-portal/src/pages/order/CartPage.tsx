import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useCart } from '../../hooks/useCart';
import { addItem } from '../../features/cart/cartSlice';
import { TrashIcon, MinusIcon, PlusIcon } from '@heroicons/react/24/outline';

// Dummy food items data
const dummyFoodItems = [
  {
    id: '1',
    name: 'Chicken Burger',
    price: 12.99,
    restaurantId: 'rest1',
    image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTB8fGJ1cmdlcnxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=500&q=60',
  },
  {
    id: '2',
    name: 'Veggie Pizza',
    price: 15.99,
    restaurantId: 'rest1',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8cGl6emF8ZW58MHx8MHx8&auto=format&fit=crop&w=500&q=60',
  },
  {
    id: '3',
    name: 'French Fries',
    price: 4.99,
    restaurantId: 'rest1',
    image: 'https://images.unsplash.com/photo-1576107232684-1279f390859f?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8OXx8ZnJpZXN8ZW58MHx8MHx8&auto=format&fit=crop&w=500&q=60',
  },
  {
    id: '4',
    name: 'Chocolate Milkshake',
    price: 6.99,
    restaurantId: 'rest1',
    image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8bWlsa3NoYWtlfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60',
  },
];

const CartPage: React.FC = () => {
  const dispatch = useDispatch();
  const { items, totalAmount, removeItem, updateQuantity, isEmpty } = useCart();

  // Add dummy items to cart on initial load if cart is empty
  useEffect(() => {
    if (isEmpty) {
      // Add first two dummy items to cart
      dispatch(addItem({ 
        item: { ...dummyFoodItems[0], quantity: 1 }, 
        restaurantId: dummyFoodItems[0].restaurantId 
      }));
      dispatch(addItem({ 
        item: { ...dummyFoodItems[2], quantity: 2 }, 
        restaurantId: dummyFoodItems[2].restaurantId 
      }));
    }
  }, [dispatch, isEmpty]);

  // Handle quantity update
  const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity >= 1) {
      updateQuantity(itemId, newQuantity);
    }
  };

  // Calculate tax and delivery fee
  const tax = totalAmount * 0.08; // 8% tax
  const deliveryFee = 2.99;
  const orderTotal = totalAmount + tax + deliveryFee;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 dark:text-white">Your Cart</h1>

      {isEmpty ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
          <h2 className="text-xl font-semibold mb-4 dark:text-white">Your cart is empty</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">Add some delicious items to your cart!</p>
          <Link
            to="/"
            className="inline-block px-6 py-3 bg-primary text-white font-medium rounded-md hover:bg-primary/90 transition-colors"
          >
            Browse Restaurants
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4 dark:text-white">
                  Order Items ({items.length})
                </h2>
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {items.map((item) => (
                    <div key={item.id} className="py-4 flex items-center">
                      <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 dark:border-gray-700">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-full w-full object-cover object-center"
                        />
                      </div>
                      <div className="ml-4 flex flex-1 flex-col">
                        <div>
                          <div className="flex justify-between text-base font-medium text-gray-900 dark:text-white">
                            <h3>{item.name}</h3>
                            <p className="ml-4">${(item.price * item.quantity).toFixed(2)}</p>
                          </div>
                          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            ${item.price.toFixed(2)} each
                          </p>
                        </div>
                        <div className="flex flex-1 items-end justify-between text-sm">
                          <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-md">
                            <button
                              onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
                            >
                              <MinusIcon className="h-4 w-4" />
                            </button>
                            <span className="px-4 py-2 text-gray-700 dark:text-gray-200">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
                            >
                              <PlusIcon className="h-4 w-4" />
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="text-red-500 hover:text-red-700 dark:text-red-400"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-4 dark:text-white">Suggested Items</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {dummyFoodItems.slice(1, 3).map((item) => (
                  <div key={item.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-48 w-full object-cover"
                    />
                    <div className="p-4">
                      <h3 className="text-lg font-medium dark:text-white">{item.name}</h3>
                      <p className="text-gray-600 dark:text-gray-300 mt-1">${item.price.toFixed(2)}</p>
                      <button
                        onClick={() => dispatch(addItem({ item: { ...item, quantity: 1 }, restaurantId: item.restaurantId }))}
                        className="mt-3 w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90 transition-colors"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 sticky top-6">
              <h2 className="text-xl font-semibold mb-4 dark:text-white">Order Summary</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Subtotal</span>
                  <span className="font-medium dark:text-white">${totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Tax</span>
                  <span className="font-medium dark:text-white">${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Delivery Fee</span>
                  <span className="font-medium dark:text-white">${deliveryFee.toFixed(2)}</span>
                </div>
                <div className="pt-3 mt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between">
                    <span className="font-semibold dark:text-white">Total</span>
                    <span className="font-semibold dark:text-white">${orderTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              <Link
                to="/order/summary"
                className="mt-6 w-full bg-primary text-white py-3 px-4 rounded-md hover:bg-primary/90 transition-colors inline-block text-center font-medium"
              >
                Proceed to Checkout
              </Link>
              <Link
                to="/"
                className="mt-4 w-full text-gray-600 dark:text-gray-300 py-3 px-4 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors inline-block text-center border border-gray-300 dark:border-gray-600"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage; 