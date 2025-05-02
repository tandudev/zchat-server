const errorHandler = (err, req, res, next) => {
  // In lỗi ra console (chỉ trong môi trường phát triển)
  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      details: Object.values(err.errors).map(error => error.message),
    });
  }

  // Joi validation error
  if (err.isJoi) {
    return res.status(400).json({
      error: 'Validation Error',
      details: err.details.map(detail => detail.message),
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      error: 'Duplicate Entry',
      message: `${field} already exists`,
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Invalid Token',
      message: 'Please login again',
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Token Expired',
      message: 'Please login again',
    });
  }

  // Default error
  const statusCode = err.status || 500;
  const errorMessage = err.message || 'Internal Server Error';

  // In môi trường phát triển, cung cấp thêm stack trace (có thể tắt trong sản xuất)
  if (process.env.NODE_ENV === 'development') {
    return res.status(statusCode).json({
      error: errorMessage,
      stack: err.stack,
    });
  }

  return res.status(statusCode).json({
    error: errorMessage,
  });
};

module.exports = errorHandler;
