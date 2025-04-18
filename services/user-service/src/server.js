const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const { port, serviceName, connectDB } = require("./config");

// Import routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");

// Initialize express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());

// Simple health check route
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", service: serviceName });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Internal Server Error",
    error:
      process.env.NODE_ENV === "production"
        ? "An unexpected error occurred"
        : err.message,
  });
});

// 404 middleware
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Start the server
app.listen(port, () => {
  console.log(`${serviceName} running on port ${port}`);
});

module.exports = app; // For testing
