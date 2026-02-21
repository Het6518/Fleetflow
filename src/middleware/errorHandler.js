const AppError = require('../utils/AppError');
const { sendError } = require('../utils/response');

/**
 * Handle Prisma known request errors (e.g., unique constraint)
 */
const handlePrismaError = (err) => {
  if (err.code === 'P2002') {
    const field = err.meta?.target?.[0] || 'field';
    return new AppError(`Duplicate value: ${field} already exists.`, 400);
  }
  if (err.code === 'P2025') {
    return new AppError('Record not found.', 404);
  }
  if (err.code === 'P2003') {
    return new AppError('Foreign key constraint failed. Referenced record does not exist.', 400);
  }
  return new AppError('Database error occurred.', 500);
};

/**
 * Handle JWT errors
 */
const handleJWTError = () => new AppError('Invalid token. Please log in again.', 401);
const handleJWTExpiredError = () => new AppError('Token expired. Please log in again.', 401);

/**
 * Global error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.statusCode = err.statusCode || 500;

  // Prisma errors
  if (err.constructor?.name === 'PrismaClientKnownRequestError') {
    error = handlePrismaError(err);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') error = handleJWTError();
  if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();

  // Zod validation errors
  if (err.name === 'ZodError') {
    const errors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    return sendError(res, 400, 'Validation failed', errors);
  }

  // Development: show full error
  if (process.env.NODE_ENV === 'development') {
    console.error('ERROR:', err);
  }

  // Operational errors: send to client
  if (error.isOperational) {
    return sendError(res, error.statusCode, error.message);
  }

  // Programming/unknown errors: generic message
  console.error('UNHANDLED ERROR:', err);
  return sendError(res, 500, 'Something went wrong on the server.');
};

module.exports = errorHandler;
