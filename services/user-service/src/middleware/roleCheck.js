/**
 * Middleware to check if the user has one of the allowed roles
 * @param {Array} allowedRoles - Array of allowed roles
 * @returns {Function} Middleware function
 */
const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    if (allowedRoles.includes(req.user.role)) {
      return next();
    }

    return res.status(403).json({
      message:
        "Access denied. You do not have permission to perform this action",
    });
  };
};

// Export role-specific middleware for convenience
module.exports = {
  checkRole,
  isAdmin: checkRole(["admin"]),
  isRestaurant: checkRole(["restaurant", "admin"]),
  isDelivery: checkRole(["delivery", "admin"]),
  isCustomer: checkRole(["customer", "admin"]),
  isRestaurantOrAdmin: checkRole(["restaurant", "admin"]),
};
