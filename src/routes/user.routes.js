const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authenticate = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

// Profile routes
router.get('/profile', authenticate, userController.getProfile);
router.put('/profile', authenticate, userController.updateProfile);

// Upload avatar và ảnh bìa
router.post(
  '/avatar',
  authenticate,
  upload.single('avatar'),
  async (req, res, next) => {
    // Kiểm tra ảnh có hợp lệ hay không
    if (!req.file) {
      return res
        .status(400)
        .json({ message: 'No file uploaded or invalid file type' });
    }
    next();
  },
  userController.uploadAvatar,
);

router.post(
  '/cover-photo',
  authenticate,
  upload.single('coverPhoto'),
  async (req, res, next) => {
    // Kiểm tra ảnh có hợp lệ hay không
    if (!req.file) {
      return res
        .status(400)
        .json({ message: 'No file uploaded or invalid file type' });
    }
    next();
  },
  userController.uploadCoverPhoto,
);

// User search and social features
router.get('/search', authenticate, userController.searchUsers);

// Friend request and social actions
router.post(
  '/friend-request/:friendId',
  authenticate,
  async (req, res, next) => {
    const { friendId } = req.params;
    const currentUserId = req.user.id;

    // Kiểm tra nếu friendId là chính mình, không thể gửi yêu cầu kết bạn
    if (friendId === currentUserId) {
      return res
        .status(400)
        .json({ message: 'You cannot send a friend request to yourself' });
    }
    next();
  },
  userController.sendFriendRequest,
);

router.post(
  '/accept-friend/:friendId',
  authenticate,
  userController.acceptFriendRequest,
);

router.post(
  '/block/:userId',
  authenticate,
  async (req, res, next) => {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    // Kiểm tra nếu userId là chính mình, không thể chặn chính mình
    if (userId === currentUserId) {
      return res.status(400).json({ message: 'You cannot block yourself' });
    }
    next();
  },
  userController.blockUser,
);

module.exports = router;
