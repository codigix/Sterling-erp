const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const userRole = req.user.role?.toLowerCase();
    const normalizedAllowedRoles = allowedRoles.map(role => role.toLowerCase());

    console.log(`[RoleMiddleware] User: ${req.user.username}, Role: ${userRole}, Allowed: ${normalizedAllowedRoles.join(', ')}`);

    if (!normalizedAllowedRoles.includes(userRole)) {
      console.warn(`[RoleMiddleware] ⛔ Access denied for user ${req.user.username} (role: ${userRole})`);
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    next();
  };
};

module.exports = roleMiddleware;