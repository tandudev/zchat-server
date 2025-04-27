const Message = require('../models/message.model');
const Chat = require('../models/chat.model');
const User = require('../models/user.model');

class MessageService {
  // Gửi tin nhắn mới
  async sendMessage(messageData) {
    const message = new Message(messageData);
    await message.save();

    // Cập nhật lastMessage cho chat
    await Chat.findByIdAndUpdate(messageData.chat, {
      lastMessage: message._id,
    });

    // Tăng unreadCount cho các thành viên khác
    const chat = await Chat.findById(messageData.chat);
    chat.members.forEach(memberId => {
      if (memberId.toString() !== messageData.sender.toString()) {
        chat.incrementUnreadCount(memberId);
      }
    });

    return message;
  }

  // Lấy tin nhắn theo ID
  async getMessageById(messageId) {
    return Message.findById(messageId)
      .populate('sender', 'username fullName avatar')
      .populate('chat')
      .populate('replyTo')
      .populate('mentions', 'username fullName avatar');
  }

  // Lấy tin nhắn trong chat
  async getChatMessages(chatId, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    return Message.find({ chat: chatId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('sender', 'username fullName avatar')
      .populate('replyTo')
      .populate('mentions', 'username fullName avatar');
  }

  // Chỉnh sửa tin nhắn
  async editMessage(messageId, content) {
    const message = await Message.findById(messageId);
    if (!message) {
      throw new Error('Message not found');
    }
    await message.edit(content);
    return message;
  }

  // Xóa tin nhắn (cho người dùng cụ thể)
  async deleteMessage(messageId, userId) {
    const message = await Message.findById(messageId);
    if (!message) {
      throw new Error('Message not found');
    }
    await message.deleteForUser(userId);
    return message;
  }

  // Thêm reaction
  async addReaction(messageId, userId, reaction) {
    const message = await Message.findById(messageId);
    if (!message) {
      throw new Error('Message not found');
    }
    await message.addReaction(userId, reaction);
    return message;
  }

  // Xóa reaction
  async removeReaction(messageId, userId, reaction) {
    const message = await Message.findById(messageId);
    if (!message) {
      throw new Error('Message not found');
    }
    await message.removeReaction(userId, reaction);
    return message;
  }

  // Đánh dấu đã đọc
  async markAsRead(messageId, userId) {
    const message = await Message.findById(messageId);
    if (!message) {
      throw new Error('Message not found');
    }
    await message.markAsRead(userId);
    return message;
  }

  // Chuyển tiếp tin nhắn
  async forwardMessage(messageId, senderId, targetChatId) {
    const originalMessage = await Message.findById(messageId);
    if (!originalMessage) {
      throw new Error('Message not found');
    }

    const forwardedMessage = new Message({
      chat: targetChatId,
      sender: senderId,
      content: originalMessage.content,
      type: originalMessage.type,
      attachments: originalMessage.attachments,
      isForwarded: true,
      forwardedFrom: originalMessage.chat,
    });

    await forwardedMessage.save();

    // Cập nhật lastMessage cho chat đích
    await Chat.findByIdAndUpdate(targetChatId, {
      lastMessage: forwardedMessage._id,
    });

    return forwardedMessage;
  }

  // Tìm kiếm tin nhắn
  async searchMessages(chatId, query) {
    return Message.find({
      chat: chatId,
      $or: [
        { content: { $regex: query, $options: 'i' } },
        { 'attachments.name': { $regex: query, $options: 'i' } },
      ],
    })
      .populate('sender', 'username fullName avatar')
      .populate('replyTo')
      .populate('mentions', 'username fullName avatar');
  }

  // Lấy tin nhắn chưa đọc
  async getUnreadMessages(chatId, userId) {
    return Message.find({
      chat: chatId,
      readBy: { $ne: userId },
      sender: { $ne: userId },
    })
      .populate('sender', 'username fullName avatar')
      .populate('replyTo')
      .populate('mentions', 'username fullName avatar');
  }

  // Lấy tin nhắn theo loại
  async getMessagesByType(chatId, type) {
    return Message.find({ chat: chatId, type })
      .populate('sender', 'username fullName avatar')
      .populate('replyTo')
      .populate('mentions', 'username fullName avatar');
  }
}

module.exports = new MessageService();
