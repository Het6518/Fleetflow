const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

/**
 * Middleware: Verify JWT token from Authorization header
 */
const authenticateToken = catchAsync(async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.split(' ')[1]
    : null;

  if (!token) {
    return next(new AppError('Access denied. No token provided.', 401));
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.user = decoded; // { userId, role }
  next();
});

/**
 * Middleware: Restrict access to specific roles
 * @param {...string} roles - Allowed roles
 */
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new AppError(
          `Access denied. Requires one of these roles: ${roles.join(', ')}`,
          403
        )
      );
    }
    next();
  };
};

module.exports = { authenticateToken, authorizeRoles };
