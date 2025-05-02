require('dotenv').config();
const userService = require('../services/user.service');

class UserController {
  // Lấy thông tin profile
  async getProfile(req, res) {
    try {
      const user = await userService.findUserById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'Không tìm thấy người dùng' });
      }

      res.json({
        id: user._id,
        email: user.email,
        username: user.username,
        fullName: user.fullName,
        avatar: user.avatar,
        coverPhoto: user.coverPhoto,
        bio: user.bio,
        gender: user.gender,
        dateOfBirth: user.dateOfBirth,
        isVerified: user.isVerified,
        settings: user.settings,
        friends: user.friends,
        friendRequests: user.friendRequests,
      });
    } catch (error) {
      console.error(error); // Log error details
      res.status(500).json({ message: 'Có lỗi xảy ra, vui lòng thử lại sau' });
    }
  }

  // Cập nhật profile
  async updateProfile(req, res) {
    try {
      const { fullName, bio, gender, dateOfBirth, settings } = req.body;
      const user = await userService.updateUser(req.user.id, {
        fullName,
        bio,
        gender,
        dateOfBirth,
        settings,
      });

      res.json({
        message: 'Cập nhật thông tin thành công',
        user: {
          id: user._id,
          fullName: user.fullName,
          bio: user.bio,
          gender: user.gender,
          dateOfBirth: user.dateOfBirth,
          settings: user.settings,
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Có lỗi xảy ra, vui lòng thử lại sau' });
    }
  }

  // Tải lên avatar
  async uploadAvatar(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'Không có file được tải lên' });
      }

      // Check file type for avatar (example)
      const allowedTypes = ['image/jpeg', 'image/png'];
      if (!allowedTypes.includes(req.file.mimetype)) {
        return res.status(400).json({ message: 'Chỉ cho phép tải lên ảnh' });
      }

      const user = await userService.uploadAvatar(req.user.id, req.file);
      res.json({
        message: 'Tải lên avatar thành công',
        avatar: user.avatar,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Có lỗi xảy ra, vui lòng thử lại sau' });
    }
  }

  // Tải lên ảnh bìa
  async uploadCoverPhoto(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'Không có file được tải lên' });
      }

      // Check file type for cover photo (example)
      const allowedTypes = ['image/jpeg', 'image/png'];
      if (!allowedTypes.includes(req.file.mimetype)) {
        return res.status(400).json({ message: 'Chỉ cho phép tải lên ảnh' });
      }

      const user = await userService.uploadCoverPhoto(req.user.id, req.file);
      res.json({
        message: 'Tải lên ảnh bìa thành công',
        coverPhoto: user.coverPhoto,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Có lỗi xảy ra, vui lòng thử lại sau' });
    }
  }

  // Tìm kiếm người dùng
  async searchUsers(req, res) {
    try {
      const { query } = req.query;
      if (!query) {
        return res
          .status(400)
          .json({ message: 'Vui lòng nhập từ khóa tìm kiếm' });
      }

      const users = await userService.searchUsers(query);
      res.json(users);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Có lỗi xảy ra, vui lòng thử lại sau' });
    }
  }

  // Gửi lời mời kết bạn
  async sendFriendRequest(req, res) {
    try {
      const { friendId } = req.params;

      // Validate friendId
      if (!friendId) {
        return res.status(400).json({ message: 'ID người bạn không hợp lệ' });
      }

      const existingRequest = await userService.checkExistingFriendRequest(
        req.user.id,
        friendId,
      );
      if (existingRequest) {
        return res
          .status(400)
          .json({ message: 'Đã gửi lời mời kết bạn hoặc đã là bạn' });
      }

      const friend = await userService.sendFriendRequest(req.user.id, friendId);
      res.json({
        message: 'Gửi lời mời kết bạn thành công',
        friend: {
          id: friend._id,
          username: friend.username,
          fullName: friend.fullName,
          avatar: friend.avatar,
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Có lỗi xảy ra, vui lòng thử lại sau' });
    }
  }

  // Chấp nhận lời mời kết bạn
  async acceptFriendRequest(req, res) {
    try {
      const { friendId } = req.params;

      const user = await userService.addFriend(req.user.id, friendId);

      res.json({
        message: 'Chấp nhận lời mời kết bạn thành công',
        user: {
          id: user._id,
          friends: user.friends,
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Có lỗi xảy ra, vui lòng thử lại sau' });
    }
  }

  // Chặn người dùng
  async blockUser(req, res) {
    try {
      const { userId } = req.params;
      const user = await userService.blockUser(req.user.id, userId);

      res.json({
        message: 'Chặn người dùng thành công',
        user: {
          id: user._id,
          blockedUsers: user.blockedUsers,
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Có lỗi xảy ra, vui lòng thử lại sau' });
    }
  }
}

module.exports = new UserController();
