const baseURL = process.env.REACT_APP_API_BASE_URL || "http://localhost:3001";

export const api = {
  baseURL,
  endpoints: {
    auth: {
      login: `${baseURL}/api/auth/login`,
      logout: `${baseURL}/api/auth/logout`,
      register: `${baseURL}/api/auth/register`,
      me: `${baseURL}/api/auth/me`,
      refreshToken: `${baseURL}/api/auth/refresh-token`,
    },
    users: {
      getAll: `${baseURL}/api/users`,
      getById: (id: string) => `${baseURL}/api/users/${id}`,
      updateStatus: (id: string) => `${baseURL}/api/users/${id}/status`,
      verifyUser: (id: string) => `${baseURL}/api/users/${id}/verify`,
      deleteUser: (id: string) => `${baseURL}/api/users/${id}`,
      updateUser: (id: string) => `${baseURL}/api/users/${id}`,
      deactivateAccount: (id: string) =>
        `${baseURL}/api/users/${id}/deactivate`,
      resetPassword: (id: string) =>
        `${baseURL}/api/users/${id}/reset-password`,
    },
    restaurants: {
      getAll: `${baseURL}/api/restaurants`,
      getById: (id: string) => `${baseURL}/api/restaurants/${id}`,
      updateStatus: (id: string) => `${baseURL}/api/restaurants/${id}/status`,
      verifyRestaurant: (id: string) =>
        `${baseURL}/api/restaurants/${id}/verify`,
      deleteRestaurant: (id: string) => `${baseURL}/api/restaurants/${id}`,
    },
    orders: {
      getAll: `${baseURL}/api/orders`,
      getById: (id: string) => `${baseURL}/api/orders/${id}`,
      updateStatus: (id: string) => `${baseURL}/api/orders/${id}/status`,
    },
    reports: {
      getSales: `${baseURL}/api/reports/sales`,
      getUsers: `${baseURL}/api/reports/users`,
      getRestaurants: `${baseURL}/api/reports/restaurants`,
    },
  },
};
