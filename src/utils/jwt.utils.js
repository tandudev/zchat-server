require('dotenv').config();
const jwt = require('jsonwebtoken');

// Tạo token với thời gian hết hạn tùy chọn (access token hoặc refresh token)
const generateToken = (userId, isRefreshToken = false) => {
  const payload = { id: userId };

  const options = {
    expiresIn: isRefreshToken ? '7d' : '1h', // Access token 1h, Refresh token 7d
  };

  return jwt.sign(payload, process.env.JWT_SECRET, options);
};

// Xác minh tính hợp lệ của token
const verifyToken = (token, isRefreshToken = false) => {
  try {
    // Nếu là refresh token, bạn có thể kiểm tra thêm các yếu tố khác nếu cần
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token expired');
    }
    if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    }
    throw new Error('Token verification failed');
  }
};

module.exports = {
  generateToken,
  verifyToken,
};
