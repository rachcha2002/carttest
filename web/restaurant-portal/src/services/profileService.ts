import api from "./api";

/**
 * Get user profile by ID
 * @param {string} userId - The user ID
 * @returns {Promise<Object>} - The user profile data
 */
export const getUserProfile = async (userId: string) => {
  try {
    const response = await api.get(`/users/${userId}`);
    return response.data.user;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
};

/**
 * Update user profile
 * @param {string} userId - The user ID
 * @param {Object} profileData - The updated profile data
 * @returns {Promise<Object>} - The updated user profile
 */
export const updateUserProfile = async (userId: string, profileData: any) => {
  try {
    const response = await api.put(`/users/${userId}`, profileData);
    return response.data.user;
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};

/**
 * Deactivate user account
 * @returns {Promise<Object>} - Response message
 */
export const deactivateAccount = async () => {
  try {
    const response = await api.patch("/users/me/deactivate");
    return response.data;
  } catch (error) {
    console.error("Error deactivating account:", error);
    throw error;
  }
};

/**
 * Add restaurant image
 * @param {string} url - The image URL
 * @param {string} description - The image description
 * @param {boolean} isPrimary - Whether this is the primary image
 * @returns {Promise<Object>} - The updated restaurant images
 */
export const addRestaurantImage = async (
  url: string,
  description: string,
  isPrimary: boolean = false
) => {
  try {
    const response = await api.post("/users/restaurant/images", {
      url,
      description,
      isPrimary,
    });
    return response.data;
  } catch (error) {
    console.error("Error adding restaurant image:", error);
    throw error;
  }
};

/**
 * Remove restaurant image
 * @param {string} imageId - The image ID
 * @returns {Promise<Object>} - Response message
 */
export const removeRestaurantImage = async (imageId: string) => {
  try {
    const response = await api.delete(`/users/restaurant/images/${imageId}`);
    return response.data;
  } catch (error) {
    console.error("Error removing restaurant image:", error);
    throw error;
  }
};

/**
 * Update restaurant description
 * @param {string} description - The updated description
 * @returns {Promise<Object>} - Response message
 */
export const updateRestaurantDescription = async (description: string) => {
  try {
    const response = await api.patch("/users/restaurant/description", {
      description,
    });
    return response.data;
  } catch (error) {
    console.error("Error updating restaurant description:", error);
    throw error;
  }
};

/**
 * Change password
 * @param {string} currentPassword - The current password
 * @param {string} newPassword - The new password
 * @returns {Promise<Object>} - Response message
 */
export const changePassword = async (
  currentPassword: string,
  newPassword: string
) => {
  try {
    const response = await api.post("/auth/change-password", {
      currentPassword,
      newPassword,
    });
    return response.data;
  } catch (error) {
    console.error("Error changing password:", error);
    throw error;
  }
};
