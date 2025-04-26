const express = require("express");
const router = express.Router();
const messageController = require("../controllers/message.controller");
const authMiddleware = require("../middlewares/auth.middleware");

// Áp dụng middleware xác thực cho tất cả các routes
router.use(authMiddleware);

// Message routes
router.post("/:chatId/messages", messageController.sendMessage);
router.get("/:chatId/messages", messageController.getChatMessages);
router.get("/:chatId/messages/:messageId", messageController.getMessage);
router.put("/:chatId/messages/:messageId", messageController.editMessage);
router.delete("/:chatId/messages/:messageId", messageController.deleteMessage);
router.post("/:chatId/messages/:messageId/reactions", messageController.addReaction);
router.delete("/:chatId/messages/:messageId/reactions", messageController.removeReaction);
router.put("/:chatId/messages/:messageId/read", messageController.markAsRead);
router.post("/:chatId/messages/:messageId/forward", messageController.forwardMessage);
router.get("/:chatId/messages/search", messageController.searchMessages);
router.get("/:chatId/messages/unread", messageController.getUnreadMessages);
router.get("/:chatId/messages/type/:type", messageController.getMessagesByType);

module.exports = router;
