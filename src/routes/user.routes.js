const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const { authenticate, upload } = require("../middleware");

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
