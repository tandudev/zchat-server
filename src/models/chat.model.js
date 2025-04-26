const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    isGroup: {
      type: Boolean,
      default: false,
    },
    avatar: {
      type: String,
      default: "",
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    admins: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
    unreadCount: {
      type: Map,
      of: Number,
      default: {},
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    settings: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
chatSchema.index({ members: 1 });
chatSchema.index({ lastMessage: 1 });
chatSchema.index({ isGroup: 1 });

// Methods
chatSchema.methods.addMember = async function (userId) {
  if (!this.members.includes(userId)) {
    this.members.push(userId);
    await this.save();
  }
};

chatSchema.methods.removeMember = async function (userId) {
  this.members = this.members.filter((memberId) => memberId.toString() !== userId.toString());
  this.admins = this.admins.filter((adminId) => adminId.toString() !== userId.toString());
  await this.save();
};

chatSchema.methods.addAdmin = async function (userId) {
  if (!this.admins.includes(userId)) {
    this.admins.push(userId);
    await this.save();
  }
};

chatSchema.methods.removeAdmin = async function (userId) {
  this.admins = this.admins.filter((adminId) => adminId.toString() !== userId.toString());
  await this.save();
};

chatSchema.methods.incrementUnreadCount = async function (userId) {
  const currentCount = this.unreadCount.get(userId.toString()) || 0;
  this.unreadCount.set(userId.toString(), currentCount + 1);
  await this.save();
};

chatSchema.methods.resetUnreadCount = async function (userId) {
  this.unreadCount.set(userId.toString(), 0);
  await this.save();
};

const Chat = mongoose.model("Chat", chatSchema);

module.exports = Chat;
