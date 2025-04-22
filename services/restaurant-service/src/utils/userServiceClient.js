const axios = require('axios');

const userServiceBaseUrl = process.env.USER_SERVICE_URL || 'http://localhost:3000';

const getUserById = async (userId) => {
  try {
    const response = await axios.get(`${userServiceBaseUrl}/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user:', error.message);
    throw new Error('Failed to fetch user from user-service');
  }
};

module.exports = { getUserById };