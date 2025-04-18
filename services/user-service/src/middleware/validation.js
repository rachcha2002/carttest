/**
 * Validator middleware
 * @param {Function} validationFunction - Function to validate request data
 * @returns {Function} Middleware function
 */
const validator = (validationFunction) => {
  return (req, res, next) => {
    const { error } = validationFunction(req.body);

    if (error) {
      return res.status(400).json({
        message: "Validation error",
        errors: error.details.map((detail) => ({
          field: detail.path.join("."),
          message: detail.message,
        })),
      });
    }

    next();
  };
};

// Basic validation functions
const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

const validatePassword = (password) => {
  // Password must be at least 6 characters
  return password && password.length >= 6;
};

const validatePhoneNumber = (phoneNumber) => {
  // Simple phone validation - can be improved based on requirements
  const regex = /^\d{10,15}$/;
  return regex.test(phoneNumber);
};

// Registration validation
const validateRegistration = (data) => {
  const errors = [];

  if (!data.name || data.name.trim().length < 2) {
    errors.push({
      path: ["name"],
      message: "Name must be at least 2 characters long",
    });
  }

  if (!data.email || !validateEmail(data.email)) {
    errors.push({ path: ["email"], message: "Valid email is required" });
  }

  if (!validatePassword(data.password)) {
    errors.push({
      path: ["password"],
      message: "Password must be at least 6 characters long",
    });
  }

  if (!data.phoneNumber || !validatePhoneNumber(data.phoneNumber)) {
    errors.push({
      path: ["phoneNumber"],
      message: "Valid phone number is required",
    });
  }

  if (
    data.role &&
    !["customer", "restaurant", "delivery", "admin"].includes(data.role)
  ) {
    errors.push({ path: ["role"], message: "Invalid role" });
  }

  // Restaurant specific validation
  if (data.role === "restaurant") {
    if (!data.restaurantInfo || !data.restaurantInfo.restaurantName) {
      errors.push({
        path: ["restaurantInfo.restaurantName"],
        message: "Restaurant name is required",
      });
    }

    if (
      !data.restaurantInfo.businessHours ||
      !data.restaurantInfo.businessHours.open ||
      !data.restaurantInfo.businessHours.close
    ) {
      errors.push({
        path: ["restaurantInfo.businessHours"],
        message: "Business hours (open and close) are required",
      });
    }
  }

  // Delivery personnel specific validation
  if (data.role === "delivery") {
    if (!data.deliveryInfo || !data.deliveryInfo.vehicleType) {
      errors.push({
        path: ["deliveryInfo.vehicleType"],
        message: "Vehicle type is required",
      });
    }
    if (!data.deliveryInfo || !data.deliveryInfo.vehicleNumber) {
      errors.push({
        path: ["deliveryInfo.vehicleNumber"],
        message: "Vehicle number is required",
      });
    }
  }

  return {
    error: errors.length ? { details: errors } : null,
  };
};

// Login validation
const validateLogin = (data) => {
  const errors = [];

  if (!data.email || !validateEmail(data.email)) {
    errors.push({ path: ["email"], message: "Valid email is required" });
  }

  if (!data.password) {
    errors.push({ path: ["password"], message: "Password is required" });
  }

  return {
    error: errors.length ? { details: errors } : null,
  };
};

// Update profile validation
const validateUpdateProfile = (data) => {
  const errors = [];

  if (data.email && !validateEmail(data.email)) {
    errors.push({ path: ["email"], message: "Valid email is required" });
  }

  if (data.phoneNumber && !validatePhoneNumber(data.phoneNumber)) {
    errors.push({
      path: ["phoneNumber"],
      message: "Valid phone number is required",
    });
  }

  return {
    error: errors.length ? { details: errors } : null,
  };
};

module.exports = {
  validator,
  validateRegistration,
  validateLogin,
  validateUpdateProfile,
};
