const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chat.controller");
const authMiddleware = require("../middlewares/auth.middleware");

// Áp dụng middleware xác thực cho tất cả các routes
router.use(authMiddleware);

// Chat routes
router.post("/private", chatController.createPrivateChat);
router.post("/group", chatController.createGroupChat);
router.get("/:chatId", chatController.getChat);
router.get("/", chatController.getUserChats);
router.put("/:chatId", chatController.updateChat);
router.delete("/:chatId", chatController.deleteChat);
router.post("/:chatId/members", chatController.addMember);
router.delete("/:chatId/members/:userId", chatController.removeMember);
router.post("/:chatId/admins", chatController.addAdmin);
router.delete("/:chatId/admins/:userId", chatController.removeAdmin);
router.put("/:chatId/avatar", chatController.updateAvatar);
router.put("/:chatId/name", chatController.updateName);
router.put("/:chatId/settings", chatController.updateSettings);
router.put("/:chatId/reset-unread", chatController.resetUnreadCount);
router.get("/search", chatController.searchChats);

module.exports = router;
