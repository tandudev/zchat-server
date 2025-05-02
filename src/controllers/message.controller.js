const messageService = require('../services/message.service');

class MessageController {
  // Gửi tin nhắn
  async sendMessage(req, res) {
    try {
      const messageData = {
        ...req.body,
        sender: req.user.id,
      };

      if (!messageData.content) {
        return res.status(400).json({ message: 'Content is required' });
      }

      const message = await messageService.sendMessage(messageData);
      res.status(201).json(message);
    } catch (error) {
      console.error(error); // Log error details for debugging
      res.status(500).json({ message: 'Có lỗi xảy ra, vui lòng thử lại sau' });
    }
  }

  // Lấy tin nhắn theo ID
  async getMessage(req, res) {
    try {
      const { messageId } = req.params;
      const message = await messageService.getMessageById(messageId);
      if (!message) {
        return res.status(404).json({ message: 'Tin nhắn không tìm thấy' });
      }
      res.json(message);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Có lỗi xảy ra, vui lòng thử lại sau' });
    }
  }

  // Lấy danh sách tin nhắn trong chat
  async getChatMessages(req, res) {
    try {
      const { chatId } = req.params;
      const { page = 1, limit = 20, unread = false } = req.query;

      // Nếu cần, bạn có thể thêm lọc theo trạng thái đã đọc/unread
      const messages = await messageService.getChatMessages(
        chatId,
        page,
        limit,
        unread,
      );
      res.json(messages);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Có lỗi xảy ra, vui lòng thử lại sau' });
    }
  }

  // Chỉnh sửa tin nhắn
  async editMessage(req, res) {
    try {
      const { messageId } = req.params;
      const { content } = req.body;

      if (!content) {
        return res.status(400).json({ message: 'Content is required' });
      }

      const message = await messageService.editMessage(
        messageId,
        content,
        req.user.id,
      );
      if (!message) {
        return res.status(404).json({ message: 'Tin nhắn không tìm thấy' });
      }
      res.json(message);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Có lỗi xảy ra, vui lòng thử lại sau' });
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
        return res.status(404).json({ message: 'Tin nhắn không tìm thấy' });
      }
      res.json({ message: 'Tin nhắn đã được xóa' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Có lỗi xảy ra, vui lòng thử lại sau' });
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
        return res.status(404).json({ message: 'Tin nhắn không tìm thấy' });
      }
      res.json(message);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Có lỗi xảy ra, vui lòng thử lại sau' });
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
        return res.status(404).json({ message: 'Tin nhắn không tìm thấy' });
      }
      res.json(message);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Có lỗi xảy ra, vui lòng thử lại sau' });
    }
  }

  // Đánh dấu đã đọc
  async markAsRead(req, res) {
    try {
      const { messageId } = req.params;
      const message = await messageService.markAsRead(messageId, req.user.id);
      if (!message) {
        return res.status(404).json({ message: 'Tin nhắn không tìm thấy' });
      }
      res.json(message);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Có lỗi xảy ra, vui lòng thử lại sau' });
    }
  }

  // Chuyển tiếp tin nhắn
  async forwardMessage(req, res) {
    try {
      const { messageId } = req.params;
      const { targetChatId } = req.body;
      if (!targetChatId) {
        return res.status(400).json({ message: 'Target chat ID is required' });
      }

      const message = await messageService.forwardMessage(
        messageId,
        req.user.id,
        targetChatId,
      );
      if (!message) {
        return res.status(404).json({ message: 'Tin nhắn không tìm thấy' });
      }
      res.json(message);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Có lỗi xảy ra, vui lòng thử lại sau' });
    }
  }

  // Tìm kiếm tin nhắn
  async searchMessages(req, res) {
    try {
      const { chatId } = req.params;
      const { query } = req.query;
      if (!query) {
        return res.status(400).json({ message: 'Search query is required' });
      }
      const messages = await messageService.searchMessages(chatId, query);
      res.json(messages);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Có lỗi xảy ra, vui lòng thử lại sau' });
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
      console.error(error);
      res.status(500).json({ message: 'Có lỗi xảy ra, vui lòng thử lại sau' });
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
      console.error(error);
      res.status(500).json({ message: 'Có lỗi xảy ra, vui lòng thử lại sau' });
    }
  }
}

module.exports = new MessageController();
