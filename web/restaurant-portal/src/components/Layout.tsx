import React, { useState } from "react";
import { Link, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import NotificationBell from "./NotificationBell";

const Layout: React.FC = () => {
  const { logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActivePath = (path: string) => {
    return window.location.pathname === path
      ? "bg-[#f29f05] text-white"
      : "text-gray-300 hover:bg-gray-700 hover:text-white";
  };

  const isMobileActivePath = (path: string) => {
    return window.location.pathname === path
      ? "bg-[#f29f05] text-white"
      : "text-gray-300 hover:bg-gray-700 hover:text-white";
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-white font-bold text-xl">CraveCart</span>
              </div>
              <div className="hidden md:block">
                <div className="ml-10 flex items-baseline space-x-4">
                  <Link
                    to="/dashboard"
                    className={`${isActivePath(
                      "/dashboard"
                    )} px-3 py-2 rounded-md text-sm font-medium`}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/menu"
                    className={`${isActivePath(
                      "/menu"
                    )} px-3 py-2 rounded-md text-sm font-medium`}
                  >
                    Menu
                  </Link>
                  <Link
                    to="/orders"
                    className={`${isActivePath(
                      "/orders"
                    )} px-3 py-2 rounded-md text-sm font-medium`}
                  >
                    Orders
                  </Link>
                  <Link
                    to="/profile"
                    className={`${isActivePath(
                      "/profile"
                    )} px-3 py-2 rounded-md text-sm font-medium`}
                  >
                    Profile
                  </Link>
                </div>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="ml-4 flex items-center md:ml-6">
                <div className="mr-4">
                  <NotificationBell />
                </div>
                
                <button
                  onClick={logout}
                  className="bg-gray-800 p-1 rounded-full text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
                >
                  <span className="sr-only">Logout</span>
                  <svg
                    className="h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                </button>
              </div>
            </div>
            <div className="-mr-2 flex md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="bg-gray-800 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
              >
                <span className="sr-only">Open main menu</span>
                <svg
                  className={`${isMobileMenuOpen ? "hidden" : "block"} h-6 w-6`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
                <svg
                  className={`${isMobileMenuOpen ? "block" : "hidden"} h-6 w-6`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className={`${isMobileMenuOpen ? "block" : "hidden"} md:hidden`}>
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              to="/dashboard"
              className={`${isMobileActivePath(
                "/dashboard"
              )} block px-3 py-2 rounded-md text-base font-medium`}
            >
              Dashboard
            </Link>
            <Link
              to="/menu"
              className={`${isMobileActivePath(
                "/menu"
              )} block px-3 py-2 rounded-md text-base font-medium`}
            >
              Menu
            </Link>
            <Link
              to="/orders"
              className={`${isMobileActivePath(
                "/orders"
              )} block px-3 py-2 rounded-md text-base font-medium`}
            >
              Orders
            </Link>
            <Link
              to="/profile"
              className={`${isMobileActivePath(
                "/profile"
              )} block px-3 py-2 rounded-md text-base font-medium`}
            >
              Profile
            </Link>
            <div className="px-3 py-2">
              <NotificationBell />
            </div>
            <button
              onClick={logout}
              className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
