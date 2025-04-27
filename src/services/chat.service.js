const Chat = require('../models/chat.model');
const Message = require('../models/message.model');
const User = require('../models/user.model');

class ChatService {
  // Tạo cuộc trò chuyện mới
  async createChat(chatData) {
    const chat = new Chat(chatData);
    await chat.save();
    return chat;
  }

  // Tạo cuộc trò chuyện 1-1
  async createPrivateChat(userId1, userId2) {
    // Kiểm tra xem đã có cuộc trò chuyện chưa
    const existingChat = await Chat.findOne({
      isGroup: false,
      members: { $all: [userId1, userId2] },
    });

    if (existingChat) {
      return existingChat;
    }

    // Lấy thông tin người dùng để tạo tên chat
    const user1 = await User.findById(userId1);
    const user2 = await User.findById(userId2);

    const chat = new Chat({
      name: `${user1.username} & ${user2.username}`,
      isGroup: false,
      members: [userId1, userId2],
    });

    await chat.save();
    return chat;
  }

  // Tạo nhóm chat
  async createGroupChat(creatorId, name, members) {
    const chat = new Chat({
      name,
      isGroup: true,
      members: [...members, creatorId],
      admins: [creatorId],
    });

    await chat.save();
    return chat;
  }

  // Lấy thông tin chat
  async getChatById(chatId) {
    return Chat.findById(chatId)
      .populate('members', 'username fullName avatar')
      .populate('admins', 'username fullName avatar')
      .populate('lastMessage');
  }

  // Lấy danh sách chat của người dùng
  async getUserChats(userId) {
    return Chat.find({ members: userId, isActive: true })
      .populate('members', 'username fullName avatar')
      .populate('admins', 'username fullName avatar')
      .populate('lastMessage')
      .sort({ updatedAt: -1 });
  }

  // Cập nhật thông tin chat
  async updateChat(chatId, updateData) {
    return Chat.findByIdAndUpdate(chatId, updateData, { new: true })
      .populate('members', 'username fullName avatar')
      .populate('admins', 'username fullName avatar');
  }

  // Xóa chat (chỉ đánh dấu không hoạt động)
  async deleteChat(chatId) {
    return Chat.findByIdAndUpdate(chatId, { isActive: false }, { new: true });
  }

  // Thêm thành viên vào nhóm
  async addMember(chatId, userId) {
    const chat = await Chat.findById(chatId);
    if (!chat) {
      throw new Error('Chat not found');
    }
    if (!chat.isGroup) {
      throw new Error('Cannot add members to private chat');
    }
    await chat.addMember(userId);
    return chat;
  }

  // Xóa thành viên khỏi nhóm
  async removeMember(chatId, userId) {
    const chat = await Chat.findById(chatId);
    if (!chat) {
      throw new Error('Chat not found');
    }
    if (!chat.isGroup) {
      throw new Error('Cannot remove members from private chat');
    }
    await chat.removeMember(userId);
    return chat;
  }

  // Thêm quản trị viên
  async addAdmin(chatId, userId) {
    const chat = await Chat.findById(chatId);
    if (!chat) {
      throw new Error('Chat not found');
    }
    if (!chat.isGroup) {
      throw new Error('Cannot add admins to private chat');
    }
    await chat.addAdmin(userId);
    return chat;
  }

  // Xóa quản trị viên
  async removeAdmin(chatId, userId) {
    const chat = await Chat.findById(chatId);
    if (!chat) {
      throw new Error('Chat not found');
    }
    if (!chat.isGroup) {
      throw new Error('Cannot remove admins from private chat');
    }
    await chat.removeAdmin(userId);
    return chat;
  }

  // Cập nhật ảnh đại diện nhóm
  async updateAvatar(chatId, avatarUrl) {
    return Chat.findByIdAndUpdate(chatId, { avatar: avatarUrl }, { new: true });
  }

  // Cập nhật tên nhóm
  async updateName(chatId, name) {
    return Chat.findByIdAndUpdate(chatId, { name }, { new: true });
  }

  // Cập nhật cài đặt chat
  async updateSettings(chatId, settings) {
    return Chat.findByIdAndUpdate(chatId, { settings }, { new: true });
  }

  // Tăng số tin nhắn chưa đọc
  async incrementUnreadCount(chatId, userId) {
    const chat = await Chat.findById(chatId);
    if (!chat) {
      throw new Error('Chat not found');
    }
    await chat.incrementUnreadCount(userId);
    return chat;
  }

  // Đặt lại số tin nhắn chưa đọc
  async resetUnreadCount(chatId, userId) {
    const chat = await Chat.findById(chatId);
    if (!chat) {
      throw new Error('Chat not found');
    }
    await chat.resetUnreadCount(userId);
    return chat;
  }

  // Tìm kiếm chat
  async searchChats(userId, query) {
    return Chat.find({
      members: userId,
      isActive: true,
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { 'members.username': { $regex: query, $options: 'i' } },
      ],
    })
      .populate('members', 'username fullName avatar')
      .populate('admins', 'username fullName avatar')
      .populate('lastMessage');
  }
}

module.exports = new ChatService();
