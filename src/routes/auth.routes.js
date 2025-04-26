const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const { authenticate } = require("../middleware");

// Auth routes
router.post("/register", authController.register);
router.post("/verify-email", authenticate, authController.verifyEmail);
router.post("/login", authController.login);
router.post("/logout", authenticate, authController.logout);

// Google OAuth routes
router.get("/auth/google", authController.googleAuth);
router.get("/auth/google/callback", authController.googleAuthCallback);

module.exports = router;
