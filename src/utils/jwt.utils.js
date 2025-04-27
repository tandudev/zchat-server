require('dotenv').config();
const jwt = require('jsonwebtoken');

const generateToken = (userId, isRefreshToken = false) => {
  const payload = {
    id: userId,
  };

  const options = {
    expiresIn: isRefreshToken ? '7d' : '1h',
  };

  return jwt.sign(payload, process.env.JWT_SECRET, options);
};

const verifyToken = token => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid token');
  }
};

module.exports = {
  generateToken,
  verifyToken,
};
