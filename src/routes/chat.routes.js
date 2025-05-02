const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Áp dụng middleware xác thực cho tất cả các routes
router.use(authMiddleware);

// Check quyền truy cập và tồn tại của chat
const checkChatExistence = async (chatId, userId) => {
  const chat = await chatController.getChatById(chatId);
  if (!chat) {
    throw new Error('Chat not found');
  }
  // Kiểm tra quyền truy cập, ví dụ: chỉ người tạo chat mới có quyền chỉnh sửa
  if (chat.createdBy !== userId) {
    throw new Error('You do not have permission to modify this chat');
  }
  return chat;
};

// Chat routes
router.post('/private', chatController.createPrivateChat);
router.post('/group', chatController.createGroupChat);
router.get('/:chatId', chatController.getChat);
router.get('/', chatController.getUserChats);
router.put('/:chatId', async (req, res, next) => {
  try {
    await checkChatExistence(req.params.chatId, req.user.id);
    await chatController.updateChat(req, res);
  } catch (error) {
    next(error);
  }
});
router.delete('/:chatId', async (req, res, next) => {
  try {
    await checkChatExistence(req.params.chatId, req.user.id);
    await chatController.deleteChat(req, res);
  } catch (error) {
    next(error);
  }
});
router.post('/:chatId/members', async (req, res, next) => {
  try {
    const chat = await checkChatExistence(req.params.chatId, req.user.id);
    // Kiểm tra nếu người dùng có quyền thêm thành viên
    if (chat.createdBy !== req.user.id) {
      throw new Error('Only the creator can add members');
    }
    await chatController.addMember(req, res);
  } catch (error) {
    next(error);
  }
});
router.delete('/:chatId/members/:userId', async (req, res, next) => {
  try {
    const chat = await checkChatExistence(req.params.chatId, req.user.id);
    // Kiểm tra nếu người dùng có quyền xóa thành viên
    if (chat.createdBy !== req.user.id) {
      throw new Error('Only the creator can remove members');
    }
    await chatController.removeMember(req, res);
  } catch (error) {
    next(error);
  }
});
router.post('/:chatId/admins', async (req, res, next) => {
  try {
    const chat = await checkChatExistence(req.params.chatId, req.user.id);
    // Kiểm tra nếu người dùng có quyền thêm quản trị viên
    if (chat.createdBy !== req.user.id) {
      throw new Error('Only the creator can add admins');
    }
    await chatController.addAdmin(req, res);
  } catch (error) {
    next(error);
  }
});
router.delete('/:chatId/admins/:userId', async (req, res, next) => {
  try {
    const chat = await checkChatExistence(req.params.chatId, req.user.id);
    // Kiểm tra nếu người dùng có quyền xóa quản trị viên
    if (chat.createdBy !== req.user.id) {
      throw new Error('Only the creator can remove admins');
    }
    await chatController.removeAdmin(req, res);
  } catch (error) {
    next(error);
  }
});
router.put('/:chatId/avatar', async (req, res, next) => {
  try {
    await checkChatExistence(req.params.chatId, req.user.id);
    await chatController.updateAvatar(req, res);
  } catch (error) {
    next(error);
  }
});
router.put('/:chatId/name', async (req, res, next) => {
  try {
    await checkChatExistence(req.params.chatId, req.user.id);
    await chatController.updateName(req, res);
  } catch (error) {
    next(error);
  }
});
router.put('/:chatId/settings', async (req, res, next) => {
  try {
    await checkChatExistence(req.params.chatId, req.user.id);
    await chatController.updateSettings(req, res);
  } catch (error) {
    next(error);
  }
});
router.put('/:chatId/reset-unread', async (req, res, next) => {
  try {
    await checkChatExistence(req.params.chatId, req.user.id);
    await chatController.resetUnreadCount(req, res);
  } catch (error) {
    next(error);
  }
});
router.get('/search', chatController.searchChats);

module.exports = router;
