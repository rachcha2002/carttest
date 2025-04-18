const dotenv = require("dotenv");
const connectDB = require("./db");

// Load environment variables
dotenv.config();

module.exports = {
  port: process.env.PORT || 3001,
  serviceName: process.env.SERVICE_NAME || "user-service",
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiration: process.env.JWT_EXPIRATION || "7d",
  mongoUri: process.env.MONGODB_URI,
  connectDB,
};
