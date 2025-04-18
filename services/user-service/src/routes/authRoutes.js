const express = require("express");
const authController = require("../controllers/authController");
const auth = require("../middleware/auth");
const {
  validator,
  validateRegistration,
  validateLogin,
} = require("../middleware/validation");

const router = express.Router();

// Public routes
router.post(
  "/register",
  validator(validateRegistration),
  authController.register
);
router.post("/login", validator(validateLogin), authController.login);

// Add refresh token route
router.post("/refresh-token", authController.refreshToken);

// Protected routes
router.get("/me", auth, authController.getCurrentUser);
router.post("/change-password", auth, authController.changePassword);
router.post("/logout", auth, authController.logout);

module.exports = router;
