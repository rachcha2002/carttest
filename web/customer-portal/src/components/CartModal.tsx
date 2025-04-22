import { Fragment, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useDispatch } from 'react-redux';
import { useCart } from '../hooks/useCart';
import { addItem } from '../features/cart/cartSlice';
import CartItems from './order/CartItems';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Dummy food items data for initial cart population
const dummyFoodItems = [
  {
    id: '1',
    name: 'Chicken Burger',
    price: 12.99,
    restaurantId: 'rest1',
    image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTB8fGJ1cmdlcnxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=500&q=60',
  },
  {
    id: '3',
    name: 'French Fries',
    price: 4.99,
    restaurantId: 'rest1',
    image: 'https://images.unsplash.com/photo-1576107232684-1279f390859f?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8OXx8ZnJpZXN8ZW58MHx8MHx8&auto=format&fit=crop&w=500&q=60',
  },
];

const CartModal: React.FC<CartModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items, totalAmount, isEmpty } = useCart();

  // Add dummy items to cart on initial load if cart is empty
  useEffect(() => {
    if (isEmpty && isOpen) {
      // Add first two dummy items to cart
      dispatch(addItem({ 
        item: { ...dummyFoodItems[0], quantity: 1 }, 
        restaurantId: dummyFoodItems[0].restaurantId 
      }));
      dispatch(addItem({ 
        item: { ...dummyFoodItems[1], quantity: 2 }, 
        restaurantId: dummyFoodItems[1].restaurantId 
      }));
    }
  }, [dispatch, isEmpty, isOpen]);

  // Calculate tax and delivery fee
  const tax = totalAmount * 0.08; // 8% tax
  const deliveryFee = 2.99;
  const orderTotal = totalAmount + tax + deliveryFee;

  const handleCheckout = () => {
    // Close the modal first
    onClose();
    // Navigate to order summary page
    navigate('/order/summary');
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-500"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-500"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                  <div className="flex h-full flex-col bg-white dark:bg-gray-800 shadow-xl">
                    <div className="flex-1 overflow-y-auto py-6 px-4 sm:px-6">
                      <div className="flex items-start justify-between">
                        <Dialog.Title className="text-lg font-medium text-gray-900 dark:text-white">Shopping cart</Dialog.Title>
                        <div className="ml-3 flex h-7 items-center">
                          <button
                            type="button"
                            className="relative -m-2 p-2 text-gray-400 hover:text-gray-500"
                            onClick={onClose}
                          >
                            <span className="absolute -inset-0.5" />
                            <span className="sr-only">Close panel</span>
                            <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                          </button>
                        </div>
                      </div>

                      <div className="mt-8">
                        <div className="flow-root">
                          <CartItems compact />
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 py-6 px-4 sm:px-6">
                      <div className="flex justify-between text-base font-medium text-gray-900 dark:text-white">
                        <p>Subtotal</p>
                        <p>${totalAmount.toFixed(2)}</p>
                      </div>
                      <div className="flex justify-between mt-1 text-sm text-gray-600 dark:text-gray-400">
                        <p>Tax</p>
                        <p>${tax.toFixed(2)}</p>
                      </div>
                      <div className="flex justify-between mt-1 text-sm text-gray-600 dark:text-gray-400">
                        <p>Delivery Fee</p>
                        <p>${deliveryFee.toFixed(2)}</p>
                      </div>
                      <div className="flex justify-between mt-2 pt-2 border-t border-gray-200 dark:border-gray-700 text-base font-medium text-gray-900 dark:text-white">
                        <p>Total</p>
                        <p>${orderTotal.toFixed(2)}</p>
                      </div>
                      <p className="mt-0.5 text-sm text-gray-500">Shipping and taxes calculated at checkout.</p>
                      <div className="mt-6">
                        <button
                          onClick={handleCheckout}
                          className="w-full flex justify-center items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-primary-600 hover:bg-primary-700"
                        >
                          Checkout
                        </button>
                      </div>
                      <div className="mt-6 flex justify-center text-center text-sm text-gray-500">
                        <p>
                          or{' '}
                          <button
                            type="button"
                            className="font-medium text-primary hover:text-primary-dark"
                            onClick={onClose}
                          >
                            Continue Shopping
                            <span aria-hidden="true"> &rarr;</span>
                          </button>
                        </p>
                      </div>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default CartModal; 