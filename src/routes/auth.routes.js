const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authenticate = require('../middleware/auth.middleware');
const {
  validateRegister,
  validateLogin,
  validateVerifyEmail,
} = require('../validators/auth.validator');

// Auth routes
router.post('/register', validateRegister, authController.register);

// Chỉ cho phép xác minh email nếu người dùng chưa xác minh
router.post(
  '/verify-email',
  authenticate,
  validateVerifyEmail,
  async (req, res, next) => {
    // Kiểm tra người dùng đã xác minh email hay chưa
    if (req.user.isEmailVerified) {
      return res.status(400).json({ message: 'Email is already verified' });
    }
    next();
  },
  authController.verifyEmail,
);

// Gửi lại email xác minh nếu chưa xác minh
router.post(
  '/resend-verification-email',
  authenticate,
  async (req, res, next) => {
    if (req.user.isEmailVerified) {
      return res.status(400).json({ message: 'Email is already verified' });
    }
    next();
  },
  authController.resendVerificationEmail,
);

// Đăng nhập
router.post('/login', validateLogin, authController.login);

// Đăng xuất và vô hiệu hóa token
router.post('/logout', authenticate, authController.logout);

router.get('/check-login', authenticate, (req, res) => {
  // Nếu middleware authenticate đã qua, nghĩa là người dùng đã đăng nhập
  return res.status(200).json({
    message: 'User is logged in',
    user: req.user, // Trả về thông tin người dùng
  });
});

module.exports = router;
