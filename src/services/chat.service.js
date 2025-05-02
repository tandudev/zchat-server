const Chat = require('../models/chat.model');
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
    const chat = await Chat.findById(chatId)
      .populate('members', 'username fullName avatar')
      .populate('admins', 'username fullName avatar')
      .populate('lastMessage');

    if (!chat) {
      throw new Error('Chat not found');
    }
    return chat;
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
    const chat = await Chat.findByIdAndUpdate(chatId, updateData, { new: true })
      .populate('members', 'username fullName avatar')
      .populate('admins', 'username fullName avatar');

    if (!chat) {
      throw new Error('Chat not found');
    }

    return chat;
  }

  // Xóa chat (chỉ đánh dấu không hoạt động)
  async deleteChat(chatId) {
    const chat = await Chat.findByIdAndUpdate(
      chatId,
      { isActive: false },
      { new: true },
    );

    if (!chat) {
      throw new Error('Chat not found');
    }

    return chat;
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

    if (!chat.members.includes(userId)) {
      chat.members.push(userId);
      await chat.save();
    }

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

    chat.members = chat.members.filter(
      member => member.toString() !== userId.toString(),
    );
    await chat.save();

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

    if (!chat.admins.includes(userId)) {
      chat.admins.push(userId);
      await chat.save();
    }

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

    chat.admins = chat.admins.filter(
      admin => admin.toString() !== userId.toString(),
    );
    await chat.save();

    return chat;
  }

  // Cập nhật ảnh đại diện nhóm
  async updateAvatar(chatId, avatarUrl) {
    const chat = await Chat.findByIdAndUpdate(
      chatId,
      { avatar: avatarUrl },
      { new: true },
    );
    if (!chat) {
      throw new Error('Chat not found');
    }
    return chat;
  }

  // Cập nhật tên nhóm
  async updateName(chatId, name) {
    const chat = await Chat.findByIdAndUpdate(chatId, { name }, { new: true });
    if (!chat) {
      throw new Error('Chat not found');
    }
    return chat;
  }

  // Cập nhật cài đặt chat
  async updateSettings(chatId, settings) {
    const chat = await Chat.findByIdAndUpdate(
      chatId,
      { settings },
      { new: true },
    );
    if (!chat) {
      throw new Error('Chat not found');
    }
    return chat;
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
