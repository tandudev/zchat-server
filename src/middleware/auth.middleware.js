require('dotenv').config();
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

// Middleware xác thực người dùng
const authenticate = async (req, res, next) => {
  try {
    const token =
      req.cookies.accessToken ||
      req.cookies.refreshToken ||
      req.headers['authorization'].replace('Bearer ', '');

    // Kiểm tra xem token có tồn tại không
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // Giải mã token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Tìm người dùng từ token
    const user = await User.findById(decoded.id);

    // Kiểm tra xem người dùng có tồn tại không
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Kiểm tra trạng thái tài khoản của người dùng
    if (!user.isActive) {
      return res.status(401).json({ message: 'User account is deactivated' });
    }

    // Gán người dùng vào request để các middleware tiếp theo có thể truy cập
    req.user = user;
    next();
  } catch (error) {
    // Xử lý lỗi nếu token hết hạn hoặc không hợp lệ
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    return res
      .status(401)
      .json({ message: 'Invalid token', error: error.message });
  }
};

module.exports = authenticate;
