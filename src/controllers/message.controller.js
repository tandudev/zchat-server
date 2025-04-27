const messageService = require('../services/message.service');

class MessageController {
  // Gửi tin nhắn
  async sendMessage(req, res) {
    try {
      const messageData = {
        ...req.body,
        sender: req.user.id,
      };
      const message = await messageService.sendMessage(messageData);
      res.status(201).json(message);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Lấy tin nhắn theo ID
  async getMessage(req, res) {
    try {
      const { messageId } = req.params;
      const message = await messageService.getMessageById(messageId);
      if (!message) {
        return res.status(404).json({ message: 'Message not found' });
      }
      res.json(message);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Lấy danh sách tin nhắn trong chat
  async getChatMessages(req, res) {
    try {
      const { chatId } = req.params;
      const { page = 1, limit = 20 } = req.query;
      const messages = await messageService.getChatMessages(
        chatId,
        page,
        limit,
      );
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Chỉnh sửa tin nhắn
  async editMessage(req, res) {
    try {
      const { messageId } = req.params;
      const { content } = req.body;
      const message = await messageService.editMessage(messageId, content);
      if (!message) {
        return res.status(404).json({ message: 'Message not found' });
      }
      res.json(message);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Xóa tin nhắn
  async deleteMessage(req, res) {
    try {
      const { messageId } = req.params;
      const message = await messageService.deleteMessage(
        messageId,
        req.user.id,
      );
      if (!message) {
        return res.status(404).json({ message: 'Message not found' });
      }
      res.json({ message: 'Message deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Thêm reaction
  async addReaction(req, res) {
    try {
      const { messageId } = req.params;
      const { reaction } = req.body;
      const message = await messageService.addReaction(
        messageId,
        req.user.id,
        reaction,
      );
      if (!message) {
        return res.status(404).json({ message: 'Message not found' });
      }
      res.json(message);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Xóa reaction
  async removeReaction(req, res) {
    try {
      const { messageId } = req.params;
      const { reaction } = req.body;
      const message = await messageService.removeReaction(
        messageId,
        req.user.id,
        reaction,
      );
      if (!message) {
        return res.status(404).json({ message: 'Message not found' });
      }
      res.json(message);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Đánh dấu đã đọc
  async markAsRead(req, res) {
    try {
      const { messageId } = req.params;
      const message = await messageService.markAsRead(messageId, req.user.id);
      if (!message) {
        return res.status(404).json({ message: 'Message not found' });
      }
      res.json(message);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Chuyển tiếp tin nhắn
  async forwardMessage(req, res) {
    try {
      const { messageId } = req.params;
      const { targetChatId } = req.body;
      const message = await messageService.forwardMessage(
        messageId,
        req.user.id,
        targetChatId,
      );
      if (!message) {
        return res.status(404).json({ message: 'Message not found' });
      }
      res.json(message);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Tìm kiếm tin nhắn
  async searchMessages(req, res) {
    try {
      const { chatId } = req.params;
      const { query } = req.query;
      const messages = await messageService.searchMessages(chatId, query);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Lấy tin nhắn chưa đọc
  async getUnreadMessages(req, res) {
    try {
      const { chatId } = req.params;
      const messages = await messageService.getUnreadMessages(
        chatId,
        req.user.id,
      );
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Lấy tin nhắn theo loại
  async getMessagesByType(req, res) {
    try {
      const { chatId } = req.params;
      const { type } = req.query;
      const messages = await messageService.getMessagesByType(chatId, type);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new MessageController();
