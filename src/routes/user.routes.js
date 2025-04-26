const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const { authenticate, upload } = require("../middleware");

// Auth routes
router.post("/register", userController.register);
router.post("/verify-email", authenticate, userController.verifyEmail);
router.post("/login", userController.login);
router.post("/logout", authenticate, userController.logout);

// Google OAuth routes
router.get("/auth/google", userController.googleAuth);
router.get("/auth/google/callback", userController.googleAuthCallback);

// Profile routes
router.get("/profile", authenticate, userController.getProfile);
router.put("/profile", authenticate, userController.updateProfile);
router.post("/avatar", authenticate, upload.single("avatar"), userController.uploadAvatar);
router.post(
  "/cover-photo",
  authenticate,
  upload.single("coverPhoto"),
  userController.uploadCoverPhoto
);

// User search and social features
router.get("/search", authenticate, userController.searchUsers);
router.post("/friend-request/:friendId", authenticate, userController.sendFriendRequest);
router.post("/accept-friend/:friendId", authenticate, userController.acceptFriendRequest);
router.post("/block/:userId", authenticate, userController.blockUser);

module.exports = router;
