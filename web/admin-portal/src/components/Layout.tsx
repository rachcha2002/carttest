import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Header from "./Header";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isInitialized } = useAuth();

  const navigation = [
    { name: "Dashboard", path: "/dashboard", icon: "📊" },
    { name: "Users", path: "/users", icon: "👥" },
    { name: "Restaurants", path: "/restaurants", icon: "🍽️" },
    { name: "Orders", path: "/orders", icon: "📦" },
    { name: "Reports", path: "/reports", icon: "📈" },
    { name: "Settings", path: "/settings", icon: "⚙️" },
  ];

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  if (!isInitialized) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`${
          isSidebarOpen ? "w-64" : "w-20"
        } bg-white shadow-lg transition-all duration-300`}
      >
        <div className="flex items-center justify-between p-4 border-b">
          {isSidebarOpen && (
            <h1 className="text-xl font-bold text-[#f29f05]">Admin Portal</h1>
          )}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            {isSidebarOpen ? "◀" : "▶"}
          </button>
        </div>
        <nav className="p-4">
          <ul className="space-y-2">
            {navigation.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center p-2 rounded-lg ${
                    location.pathname === item.path
                      ? "bg-[#f29f05] text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <span className="text-xl mr-3">{item.icon}</span>
                  {isSidebarOpen && <span>{item.name}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
