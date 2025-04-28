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
router.post(
  '/verify-email',
  authenticate,
  validateVerifyEmail,
  authController.verifyEmail,
);
router.post(
  '/resend-verification-email',
  authenticate,
  authController.resendVerificationEmail,
);
router.post('/login', validateLogin, authController.login);
router.post('/logout', authenticate, authController.logout);

module.exports = router;
