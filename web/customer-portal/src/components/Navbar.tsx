import { Fragment, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Menu, Transition } from '@headlessui/react';
import {
  ShoppingCartIcon,
  MagnifyingGlassIcon,
  UserIcon,
  SunIcon,
  MoonIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import { toggleTheme } from '../features/theme/themeSlice';
import CartModal from './CartModal';

const Navbar = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated, logout } = useAuth();
  const { items } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <>
      <nav className="bg-white dark:bg-gray-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Link to="/" className="text-2xl font-bold text-primary dark:text-white">
                  FoodDelivery
                </Link>
              </div>
              <div className="hidden md:block ml-10">
                <div className="flex items-baseline space-x-4">
                  <Link
                    to="/"
                    className="text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Home
                  </Link>
                  <Link
                    to="/about"
                    className="text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                  >
                    About Us
                  </Link>
                  <Link
                    to="/contact"
                    className="text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Contact
                  </Link>
                </div>
              </div>
            </div>
            
            <div className="flex-1 max-w-lg mx-8">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-primary dark:focus:border-primary focus:ring-1 focus:ring-primary dark:text-white"
                  placeholder="Search for restaurants or dishes..."
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => dispatch(toggleTheme())}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <SunIcon className="h-6 w-6 text-gray-600 dark:text-gray-300 hidden dark:block" />
                <MoonIcon className="h-6 w-6 text-gray-600 dark:text-gray-300 block dark:hidden" />
              </button>

              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <ShoppingCartIcon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                {items.length > 0 && (
                  <span className="absolute top-0 right-0 block h-4 w-4 transform -translate-y-1/2 translate-x-1/2 rounded-full bg-primary text-white text-xs flex items-center justify-center">
                    {items.length}
                  </span>
                )}
              </button>

              {isAuthenticated ? (
                <Menu as="div" className="relative">
                  <Menu.Button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                    <UserIcon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                  </Menu.Button>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items className="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white dark:bg-gray-700 ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            to="/profile"
                            className={`${
                              active ? 'bg-gray-100 dark:bg-gray-600' : ''
                            } block px-4 py-2 text-sm text-gray-700 dark:text-gray-200`}
                          >
                            Profile
                          </Link>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            to="/orders"
                            className={`${
                              active ? 'bg-gray-100 dark:bg-gray-600' : ''
                            } block px-4 py-2 text-sm text-gray-700 dark:text-gray-200`}
                          >
                            Orders
                          </Link>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={logout}
                            className={`${
                              active ? 'bg-gray-100 dark:bg-gray-600' : ''
                            } block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200`}
                          >
                            Sign out
                          </button>
                        )}
                      </Menu.Item>
                    </Menu.Items>
                  </Transition>
                </Menu>
              ) : (
                <Link
                  to="/login"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90"
                >
                  Sign in
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      <CartModal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
};

export default Navbar; 