const chatService = require('../services/chat.service');
const messageService = require('../services/message.service');

class ChatController {
  // Tạo cuộc trò chuyện 1-1
  async createPrivateChat(req, res) {
    try {
      const { userId } = req.body;
      if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
      }

      const chat = await chatService.createPrivateChat(req.user.id, userId);
      res.status(201).json(chat);
    } catch (error) {
      console.error(error); // Log lỗi chi tiết
      res
        .status(500)
        .json({ message: 'Có lỗi xảy ra khi tạo cuộc trò chuyện' });
    }
  }

  // Tạo nhóm chat
  async createGroupChat(req, res) {
    try {
      const { name, members } = req.body;
      if (!name || !members || members.length === 0) {
        return res
          .status(400)
          .json({ message: 'Name and members are required' });
      }

      const chat = await chatService.createGroupChat(
        req.user.id,
        name,
        members,
      );
      res.status(201).json(chat);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Có lỗi xảy ra khi tạo nhóm chat' });
    }
  }

  // Lấy thông tin chat
  async getChat(req, res) {
    try {
      const { chatId } = req.params;
      const chat = await chatService.getChatById(chatId);
      if (!chat) {
        return res.status(404).json({ message: 'Chat không tìm thấy' });
      }
      res.json(chat);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Có lỗi xảy ra khi lấy thông tin chat' });
    }
  }

  // Lấy danh sách chat của người dùng
  async getUserChats(req, res) {
    try {
      const chats = await chatService.getUserChats(req.user.id);
      res.json(chats);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Có lỗi xảy ra khi lấy danh sách chat' });
    }
  }

  // Cập nhật thông tin chat
  async updateChat(req, res) {
    try {
      const { chatId } = req.params;
      const updateData = req.body;
      const chat = await chatService.updateChat(chatId, updateData);
      if (!chat) {
        return res.status(404).json({ message: 'Chat không tìm thấy' });
      }
      res.json(chat);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Có lỗi xảy ra khi cập nhật chat' });
    }
  }

  // Xóa chat
  async deleteChat(req, res) {
    try {
      const { chatId } = req.params;
      const chat = await chatService.deleteChat(chatId);
      if (!chat) {
        return res.status(404).json({ message: 'Chat không tìm thấy' });
      }
      res.json({ message: 'Chat đã được xóa' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Có lỗi xảy ra khi xóa chat' });
    }
  }

  // Thêm thành viên vào nhóm
  async addMember(req, res) {
    try {
      const { chatId } = req.params;
      const { userId } = req.body;
      if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
      }

      const chat = await chatService.addMember(chatId, userId);
      res.json(chat);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Có lỗi xảy ra khi thêm thành viên' });
    }
  }

  // Xóa thành viên khỏi nhóm
  async removeMember(req, res) {
    try {
      const { chatId, userId } = req.params;
      const chat = await chatService.removeMember(chatId, userId);
      res.json(chat);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Có lỗi xảy ra khi xóa thành viên' });
    }
  }

  // Thêm quản trị viên
  async addAdmin(req, res) {
    try {
      const { chatId } = req.params;
      const { userId } = req.body;
      const chat = await chatService.addAdmin(chatId, userId);
      res.json(chat);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Có lỗi xảy ra khi thêm quản trị viên' });
    }
  }

  // Xóa quản trị viên
  async removeAdmin(req, res) {
    try {
      const { chatId, userId } = req.params;
      const chat = await chatService.removeAdmin(chatId, userId);
      res.json(chat);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Có lỗi xảy ra khi xóa quản trị viên' });
    }
  }

  // Cập nhật ảnh đại diện nhóm
  async updateAvatar(req, res) {
    try {
      const { chatId } = req.params;
      const { avatar } = req.body;
      const chat = await chatService.updateAvatar(chatId, avatar);
      res.json(chat);
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ message: 'Có lỗi xảy ra khi cập nhật ảnh đại diện' });
    }
  }

  // Cập nhật tên nhóm
  async updateName(req, res) {
    try {
      const { chatId } = req.params;
      const { name } = req.body;
      const chat = await chatService.updateName(chatId, name);
      res.json(chat);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Có lỗi xảy ra khi cập nhật tên nhóm' });
    }
  }

  // Cập nhật cài đặt chat
  async updateSettings(req, res) {
    try {
      const { chatId } = req.params;
      const { settings } = req.body;
      const chat = await chatService.updateSettings(chatId, settings);
      res.json(chat);
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ message: 'Có lỗi xảy ra khi cập nhật cài đặt chat' });
    }
  }

  // Đặt lại số tin nhắn chưa đọc
  async resetUnreadCount(req, res) {
    try {
      const { chatId } = req.params;
      const chat = await chatService.resetUnreadCount(chatId, req.user.id);
      res.json(chat);
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ message: 'Có lỗi xảy ra khi đặt lại số tin nhắn chưa đọc' });
    }
  }

  // Tìm kiếm chat
  async searchChats(req, res) {
    try {
      const { query } = req.query;
      if (!query) {
        return res.status(400).json({ message: 'Search query is required' });
      }
      const chats = await chatService.searchChats(req.user.id, query);
      res.json(chats);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Có lỗi xảy ra khi tìm kiếm chat' });
    }
  }
}

module.exports = new ChatController();
