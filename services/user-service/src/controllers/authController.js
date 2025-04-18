const jwt = require("jsonwebtoken");
const User = require("../models/User");
const config = require("../config");

/**
 * Register a new user
 * @route POST /api/auth/register
 * @access Public
 */
const register = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }

    // Ensure business hours are properly structured
    if (req.body.role === "restaurant" && req.body.restaurantInfo) {
      if (!req.body.restaurantInfo.businessHours) {
        req.body.restaurantInfo.businessHours = {
          open: "",
          close: "",
        };
      }
    }

    // Create new user
    const user = new User(req.body);

    // If user is admin or restaurant, mark as unverified until approved
    if (["admin", "restaurant"].includes(user.role)) {
      user.isVerified = false;
    } else {
      user.isVerified = true; // Auto-verify customers and delivery personnel
    }

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      config.jwtSecret,
      { expiresIn: config.jwtExpiration }
    );

    res.status(201).json({
      message: "User registered successfully",
      user: user.toJSON(),
      token,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Login a user
 * @route POST /api/auth/login
 * @access Public
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check if user is active
    if (user.status !== "active") {
      return res.status(403).json({ message: "Account is not active" });
    }

    // Check if user is verified
    if (!user.isVerified) {
      return res
        .status(403)
        .json({ message: "Account is pending verification" });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      config.jwtSecret,
      { expiresIn: config.jwtExpiration }
    );

    res.json({
      message: "Login successful",
      user: user.toJSON(),
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Get current user profile
 * @route GET /api/auth/me
 * @access Private
 */
const getCurrentUser = async (req, res) => {
  try {
    res.json({
      user: req.user.toJSON(),
    });
  } catch (error) {
    console.error("Get current user error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Change password
 * @route POST /api/auth/change-password
 * @access Private
 */
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Check if current password is correct
    const isMatch = await req.user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    // Update password
    req.user.password = newPassword;
    await req.user.save();

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Logout user
 * @route POST /api/auth/logout
 * @access Private
 */
const logout = async (req, res) => {
  try {
    // In a stateless JWT-based auth system, client-side logout is sufficient
    // This endpoint is provided for completeness
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Refresh JWT token
 * @route POST /api/auth/refresh-token
 * @access Public (with valid refresh token)
 */
const refreshToken = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: "Token is required" });
    }

    // Verify the existing token
    const decoded = jwt.verify(token, config.jwtSecret, {
      ignoreExpiration: true,
    });

    // Check if user still exists and is active
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.status !== "active") {
      return res.status(403).json({ message: "Account is not active" });
    }

    // Generate a new token
    const newToken = jwt.sign(
      { id: user._id, role: user.role },
      config.jwtSecret,
      { expiresIn: config.jwtExpiration }
    );

    res.json({
      message: "Token refreshed successfully",
      token: newToken,
    });
  } catch (error) {
    console.error("Token refresh error:", error);
    res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = {
  register,
  login,
  getCurrentUser,
  changePassword,
  logout,
  refreshToken,
};
