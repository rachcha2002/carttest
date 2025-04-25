import React from "react";
import { useSelector } from "react-redux";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import { RootState } from "../store/store";
import { Toaster } from "react-hot-toast";

const MainLayout: React.FC = () => {
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);

  return (
    <div className={`min-h-screen ${isDarkMode ? "dark" : ""}`}>
      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Outlet />
        </main>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: isDarkMode ? "#374151" : "#fff",
              color: isDarkMode ? "#fff" : "#000",
            },
          }}
        />
      </div>
    </div>
  );
};

export default MainLayout;
