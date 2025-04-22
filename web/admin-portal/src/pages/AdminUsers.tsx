import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { api } from "../config/api";
import Layout from "../components/Layout";
import AdminForm from "../components/AdminForm";

interface User {
  _id: string;
  email: string;
  name: string;
  role: string;
  status: string;
  isVerified: boolean;
  phoneNumber: string;
  address?: string;
}

interface PaginatedResponse {
  users: User[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

type UserRole = "admin" | "restaurant" | "delivery" | "customer";

const AdminUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<UserRole>("admin");
  const [showAdminForm, setShowAdminForm] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<User | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    pages: 0,
  });

  useEffect(() => {
    fetchUsers();
  }, [pagination.page, activeTab]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await axios.get<PaginatedResponse>(
        api.endpoints.users.getAll,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            page: pagination.page,
            limit: pagination.limit,
            role: activeTab,
          },
        }
      );
      setUsers(response.data.users);
      setPagination(response.data.pagination);
      setLoading(false);
    } catch (error) {
      setError("Failed to fetch users");
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (userId: string, status: string) => {
    try {
      const token = localStorage.getItem("adminToken");
      await axios.patch(
        api.endpoints.users.updateStatus(userId),
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchUsers(); // Refresh the user list
    } catch (error) {
      setError("Failed to update user status");
    }
  };

  const handleVerifyUser = async (userId: string) => {
    try {
      const token = localStorage.getItem("adminToken");
      await axios.patch(
        api.endpoints.users.verifyUser(userId),
        { isVerified: true },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchUsers(); // Refresh the user list
    } catch (error) {
      setError("Failed to verify user");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm("Are you sure you want to delete this user?")) {
      return;
    }

    try {
      const token = localStorage.getItem("adminToken");
      await axios.delete(api.endpoints.users.deleteUser(userId), {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchUsers(); // Refresh the user list
    } catch (error) {
      setError("Failed to delete user");
    }
  };

  const handleResetPassword = async (userId: string) => {
    if (
      !window.confirm("Are you sure you want to reset this user's password?")
    ) {
      return;
    }

    try {
      const token = localStorage.getItem("adminToken");
      await axios.post(api.endpoints.users.resetPassword(userId), null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert(
        "Password reset successful. The new password has been sent to the user's email."
      );
    } catch (error) {
      setError("Failed to reset password");
    }
  };

  const handleEditAdmin = (admin: User) => {
    setSelectedAdmin(admin);
    setShowAdminForm(true);
  };

  const handleAdminFormSuccess = () => {
    setShowAdminForm(false);
    setSelectedAdmin(null);
    fetchUsers();
  };

  const handleAdminFormCancel = () => {
    setShowAdminForm(false);
    setSelectedAdmin(null);
  };

  const tabs: { id: UserRole; label: string }[] = [
    { id: "admin", label: "Admins" },
    { id: "restaurant", label: "Restaurants" },
    { id: "delivery", label: "Delivery Partners" },
    { id: "customer", label: "Customers" },
  ];

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-8">Loading...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              User Management
            </h2>
            {activeTab === "admin" && (
              <button
                onClick={() => setShowAdminForm(true)}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#f29f05] hover:bg-[#d88f04] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#f29f05]"
              >
                Register New Admin
              </button>
            )}
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setPagination({ ...pagination, page: 1 });
                  }}
                  className={`
                    whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                    ${
                      activeTab === tab.id
                        ? "border-[#f29f05] text-[#f29f05]"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }
                  `}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="mt-8">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Phone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Address
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Verified
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.phoneNumber}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {user.address}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.status === "active"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.isVerified
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {user.isVerified ? "Verified" : "Unverified"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex space-x-2">
                          {activeTab === "admin" && (
                            <>
                              <button
                                onClick={() => handleEditAdmin(user)}
                                className="text-[#f29f05] hover:text-[#d88f04]"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleResetPassword(user._id)}
                                className="text-[#f29f05] hover:text-[#d88f04]"
                              >
                                Reset Password
                              </button>
                            </>
                          )}
                          <button
                            onClick={() =>
                              handleUpdateStatus(
                                user._id,
                                user.status === "active" ? "inactive" : "active"
                              )
                            }
                            className="text-[#f29f05] hover:text-[#d88f04]"
                          >
                            {user.status === "active"
                              ? "Deactivate"
                              : "Activate"}
                          </button>
                          {!user.isVerified && (
                            <button
                              onClick={() => handleVerifyUser(user._id)}
                              className="text-[#f29f05] hover:text-[#d88f04]"
                            >
                              Verify
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteUser(user._id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            <div className="flex items-center justify-between mt-4">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() =>
                    setPagination({ ...pagination, page: pagination.page - 1 })
                  }
                  disabled={pagination.page === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Previous
                </button>
                <button
                  onClick={() =>
                    setPagination({ ...pagination, page: pagination.page + 1 })
                  }
                  disabled={pagination.page === pagination.pages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing{" "}
                    <span className="font-medium">{pagination.page}</span> to{" "}
                    <span className="font-medium">{pagination.pages}</span> of{" "}
                    <span className="font-medium">{pagination.total}</span>{" "}
                    results
                  </p>
                </div>
                <div>
                  <nav
                    className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                    aria-label="Pagination"
                  >
                    <button
                      onClick={() =>
                        setPagination({
                          ...pagination,
                          page: pagination.page - 1,
                        })
                      }
                      disabled={pagination.page === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() =>
                        setPagination({
                          ...pagination,
                          page: pagination.page + 1,
                        })
                      }
                      disabled={pagination.page === pagination.pages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Form Modal */}
      {showAdminForm && (
        <AdminForm
          mode={selectedAdmin ? "edit" : "create"}
          adminData={selectedAdmin || undefined}
          onSuccess={handleAdminFormSuccess}
          onCancel={handleAdminFormCancel}
        />
      )}
    </Layout>
  );
};

export default AdminUsers;
