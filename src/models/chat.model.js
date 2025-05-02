const mongoose = require('mongoose');
const chatSchema = require('../schemas/chat.schema');

// Thêm thành viên vào nhóm
chatSchema.methods.addMember = async function (userId) {
  try {
    if (!this.members.includes(userId)) {
      this.members.push(userId);
      await this.save();
    }
  } catch (error) {
    throw new Error('Không thể thêm thành viên');
  }
};

// Xóa thành viên khỏi nhóm
chatSchema.methods.removeMember = async function (userId) {
  try {
    this.members = this.members.filter(
      memberId => memberId.toString() !== userId.toString(),
    );
    this.admins = this.admins.filter(
      adminId => adminId.toString() !== userId.toString(),
    );
    await this.save();
  } catch (error) {
    throw new Error('Không thể xóa thành viên');
  }
};

// Thêm admin vào nhóm
chatSchema.methods.addAdmin = async function (userId) {
  try {
    if (!this.admins.includes(userId)) {
      this.admins.push(userId);
      await this.save();
    }
  } catch (error) {
    throw new Error('Không thể thêm admin');
  }
};

// Xóa admin khỏi nhóm
chatSchema.methods.removeAdmin = async function (userId) {
  try {
    this.admins = this.admins.filter(
      adminId => adminId.toString() !== userId.toString(),
    );
    await this.save();
  } catch (error) {
    throw new Error('Không thể xóa admin');
  }
};

// Tăng số lượng tin nhắn chưa đọc
chatSchema.methods.incrementUnreadCount = async function (userId) {
  try {
    const currentCount = this.unreadCount.get(userId.toString()) || 0;
    this.unreadCount.set(userId.toString(), currentCount + 1);
    await this.save();
  } catch (error) {
    throw new Error('Không thể tăng số lượng tin nhắn chưa đọc');
  }
};

// Đặt lại số lượng tin nhắn chưa đọc
chatSchema.methods.resetUnreadCount = async function (userId) {
  try {
    this.unreadCount.set(userId.toString(), 0);
    await this.save();
  } catch (error) {
    throw new Error('Không thể đặt lại số lượng tin nhắn chưa đọc');
  }
};

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;
