const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const { authenticate } = require("../middleware");
const {
  validateRegister,
  validateLogin,
  validateVerifyEmail,
} = require("../validators/auth.validator");

// Auth routes
router.post("/register", validateRegister, authController.register);
router.post("/verify-email", authenticate, validateVerifyEmail, authController.verifyEmail);
router.post("/login", validateLogin, authController.login);
router.post("/logout", authenticate, authController.logout);

// Google OAuth routes
router.get("/auth/google", authController.googleAuth);
router.get("/auth/google/callback", authController.googleAuthCallback);

module.exports = router;
