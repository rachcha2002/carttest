import React, { useState } from "react";
import axios from "axios";
import { api } from "../config/api";

interface AdminFormProps {
  mode: "create" | "edit";
  adminData?: {
    _id: string;
    name: string;
    email: string;
    phoneNumber: string;
    address?: string;
  };
  onSuccess: () => void;
  onCancel: () => void;
}

const AdminForm = ({
  mode,
  adminData,
  onSuccess,
  onCancel,
}: AdminFormProps) => {
  const [formData, setFormData] = useState({
    name: adminData?.name || "Test Admin",
    email: adminData?.email || "admin@example.com",
    password: "adminpassword123",
    phoneNumber: adminData?.phoneNumber || "1234567893",
    address: adminData?.address || "123 Admin Street, Admin City",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const token = localStorage.getItem("adminToken");
      if (mode === "create") {
        await axios.post(
          api.endpoints.auth.register,
          {
            ...formData,
            role: "admin",
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } else if (adminData) {
        await axios.put(
          api.endpoints.users.updateUser(adminData._id),
          {
            name: formData.name,
            email: formData.email,
            phoneNumber: formData.phoneNumber,
            address: formData.address,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      }
      onSuccess();
    } catch (error: any) {
      setError(error.response?.data?.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
      <div className="relative p-8 bg-white w-full max-w-md m-4 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-6">
          {mode === "create" ? "Register New Admin" : "Edit Admin"}
        </h2>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Name
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#f29f05] focus:ring-[#f29f05] sm:text-sm"
              required
            />
          </div>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#f29f05] focus:ring-[#f29f05] sm:text-sm"
              required
            />
          </div>
          {mode === "create" && (
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#f29f05] focus:ring-[#f29f05] sm:text-sm"
                required
              />
            </div>
          )}
          <div>
            <label
              htmlFor="phoneNumber"
              className="block text-sm font-medium text-gray-700"
            >
              Phone Number
            </label>
            <input
              type="tel"
              id="phoneNumber"
              value={formData.phoneNumber}
              onChange={(e) =>
                setFormData({ ...formData, phoneNumber: e.target.value })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#f29f05] focus:ring-[#f29f05] sm:text-sm"
              required
            />
          </div>
          <div>
            <label
              htmlFor="address"
              className="block text-sm font-medium text-gray-700"
            >
              Address
            </label>
            <textarea
              id="address"
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#f29f05] focus:ring-[#f29f05] sm:text-sm"
              rows={3}
              required
            />
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#f29f05]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#f29f05] hover:bg-[#d88f04] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#f29f05]"
            >
              {loading ? "Saving..." : mode === "create" ? "Register" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminForm;
