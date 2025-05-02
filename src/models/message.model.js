const mongoose = require('mongoose');
const messageSchema = require('../schemas/message.schema');

// Thêm reaction vào tin nhắn
messageSchema.methods.addReaction = async function (userId, reaction) {
  try {
    if (!this.reactions.has(reaction)) {
      this.reactions.set(reaction, []);
    }
    const users = this.reactions.get(reaction);
    if (!users.includes(userId)) {
      users.push(userId);
      this.reactions.set(reaction, users);
      await this.save();
    }
  } catch (error) {
    throw new Error('Không thể thêm reaction');
  }
};

// Xóa reaction khỏi tin nhắn
messageSchema.methods.removeReaction = async function (userId, reaction) {
  try {
    if (this.reactions.has(reaction)) {
      const users = this.reactions.get(reaction);
      const updatedUsers = users.filter(
        id => id.toString() !== userId.toString(),
      );
      this.reactions.set(reaction, updatedUsers);
      await this.save();
    }
  } catch (error) {
    throw new Error('Không thể xóa reaction');
  }
};

// Đánh dấu tin nhắn là đã đọc
messageSchema.methods.markAsRead = async function (userId) {
  try {
    if (!this.readBy.includes(userId)) {
      this.readBy.push(userId);
      await this.save();
    }
  } catch (error) {
    throw new Error('Không thể đánh dấu tin nhắn là đã đọc');
  }
};

// Xóa tin nhắn cho người dùng
messageSchema.methods.deleteForUser = async function (userId) {
  try {
    if (!this.deletedBy.includes(userId)) {
      this.deletedBy.push(userId);
      await this.save();
    }
  } catch (error) {
    throw new Error('Không thể xóa tin nhắn cho người dùng');
  }
};

// Chỉnh sửa nội dung tin nhắn
messageSchema.methods.edit = async function (newContent) {
  try {
    this.content = newContent;
    this.isEdited = true;
    await this.save();
  } catch (error) {
    throw new Error('Không thể chỉnh sửa tin nhắn');
  }
};

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
