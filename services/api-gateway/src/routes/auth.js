const express = require("express");
const axios = require("axios");
const router = express.Router();

// Load environment variables
const USER_SERVICE_URL =
  process.env.USER_SERVICE_URL || "http://user-service:3000";

// Proxy register request to user-service
router.post("/register", async (req, res) => {
  try {
    const response = await axios.post(
      `${USER_SERVICE_URL}/api/auth/register`,
      req.body
    );
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Register proxy error:", error.message);

    // Forward the error response from the user service if available
    if (error.response) {
      return res.status(error.response.status).json(error.response.data);
    }

    res.status(500).json({ message: "Internal server error" });
  }
});

// Proxy login request to user-service
router.post("/login", async (req, res) => {
  try {
    const response = await axios.post(
      `${USER_SERVICE_URL}/api/auth/login`,
      req.body
    );
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Login proxy error:", error.message);

    // Forward the error response from the user service if available
    if (error.response) {
      return res.status(error.response.status).json(error.response.data);
    }

    res.status(500).json({ message: "Internal server error" });
  }
});

// Proxy get current user request to user-service
router.get("/me", async (req, res) => {
  try {
    // Forward the token from the request
    const token = req.header("Authorization");

    if (!token) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const response = await axios.get(`${USER_SERVICE_URL}/api/auth/me`, {
      headers: { Authorization: token },
    });

    res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Get user proxy error:", error.message);

    if (error.response) {
      return res.status(error.response.status).json(error.response.data);
    }

    res.status(500).json({ message: "Internal server error" });
  }
});

// Add other auth endpoints as needed (change password, logout, etc.)
router.post("/change-password", async (req, res) => {
  try {
    const token = req.header("Authorization");

    if (!token) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const response = await axios.post(
      `${USER_SERVICE_URL}/api/auth/change-password`,
      req.body,
      { headers: { Authorization: token } }
    );

    res.status(response.status).json(response.data);
  } catch (error) {
    if (error.response) {
      return res.status(error.response.status).json(error.response.data);
    }

    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/logout", async (req, res) => {
  try {
    const token = req.header("Authorization");

    if (!token) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const response = await axios.post(
      `${USER_SERVICE_URL}/api/auth/logout`,
      {},
      { headers: { Authorization: token } }
    );

    res.status(response.status).json(response.data);
  } catch (error) {
    if (error.response) {
      return res.status(error.response.status).json(error.response.data);
    }

    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
