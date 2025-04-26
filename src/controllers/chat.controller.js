const chatService = require("../services/chat.service");
const messageService = require("../services/message.service");

class ChatController {
  // Tạo cuộc trò chuyện 1-1
  async createPrivateChat(req, res) {
    try {
      const { userId } = req.body;
      const chat = await chatService.createPrivateChat(req.user.id, userId);
      res.status(201).json(chat);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Tạo nhóm chat
  async createGroupChat(req, res) {
    try {
      const { name, members } = req.body;
      const chat = await chatService.createGroupChat(req.user.id, name, members);
      res.status(201).json(chat);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Lấy thông tin chat
  async getChat(req, res) {
    try {
      const { chatId } = req.params;
      const chat = await chatService.getChatById(chatId);
      if (!chat) {
        return res.status(404).json({ message: "Chat not found" });
      }
      res.json(chat);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Lấy danh sách chat của người dùng
  async getUserChats(req, res) {
    try {
      const chats = await chatService.getUserChats(req.user.id);
      res.json(chats);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Cập nhật thông tin chat
  async updateChat(req, res) {
    try {
      const { chatId } = req.params;
      const updateData = req.body;
      const chat = await chatService.updateChat(chatId, updateData);
      if (!chat) {
        return res.status(404).json({ message: "Chat not found" });
      }
      res.json(chat);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Xóa chat
  async deleteChat(req, res) {
    try {
      const { chatId } = req.params;
      const chat = await chatService.deleteChat(chatId);
      if (!chat) {
        return res.status(404).json({ message: "Chat not found" });
      }
      res.json({ message: "Chat deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Thêm thành viên vào nhóm
  async addMember(req, res) {
    try {
      const { chatId } = req.params;
      const { userId } = req.body;
      const chat = await chatService.addMember(chatId, userId);
      res.json(chat);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Xóa thành viên khỏi nhóm
  async removeMember(req, res) {
    try {
      const { chatId, userId } = req.params;
      const chat = await chatService.removeMember(chatId, userId);
      res.json(chat);
    } catch (error) {
      res.status(500).json({ message: error.message });
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
      res.status(500).json({ message: error.message });
    }
  }

  // Xóa quản trị viên
  async removeAdmin(req, res) {
    try {
      const { chatId, userId } = req.params;
      const chat = await chatService.removeAdmin(chatId, userId);
      res.json(chat);
    } catch (error) {
      res.status(500).json({ message: error.message });
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
      res.status(500).json({ message: error.message });
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
      res.status(500).json({ message: error.message });
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
      res.status(500).json({ message: error.message });
    }
  }

  // Đặt lại số tin nhắn chưa đọc
  async resetUnreadCount(req, res) {
    try {
      const { chatId } = req.params;
      const chat = await chatService.resetUnreadCount(chatId, req.user.id);
      res.json(chat);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Tìm kiếm chat
  async searchChats(req, res) {
    try {
      const { query } = req.query;
      const chats = await chatService.searchChats(req.user.id, query);
      res.json(chats);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new ChatController();
