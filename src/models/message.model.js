const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      enum: ["text", "image", "file", "voice", "video", "sticker", "system"],
      default: "text",
    },
    attachments: [
      {
        url: String,
        type: String,
        name: String,
        size: Number,
        duration: Number, // for voice/video messages
      },
    ],
    reactions: {
      type: Map,
      of: [mongoose.Schema.Types.ObjectId], // userIds who reacted
      default: {},
    },
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
    mentions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    readBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    deletedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    isEdited: {
      type: Boolean,
      default: false,
    },
    isForwarded: {
      type: Boolean,
      default: false,
    },
    forwardedFrom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
    },
    metadata: {
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
messageSchema.index({ chat: 1, createdAt: -1 });
messageSchema.index({ sender: 1 });
messageSchema.index({ type: 1 });

// Methods
messageSchema.methods.addReaction = async function (userId, reaction) {
  if (!this.reactions.has(reaction)) {
    this.reactions.set(reaction, []);
  }
  const users = this.reactions.get(reaction);
  if (!users.includes(userId)) {
    users.push(userId);
    this.reactions.set(reaction, users);
    await this.save();
  }
};

messageSchema.methods.removeReaction = async function (userId, reaction) {
  if (this.reactions.has(reaction)) {
    const users = this.reactions.get(reaction);
    this.reactions.set(
      reaction,
      users.filter((id) => id.toString() !== userId.toString())
    );
    await this.save();
  }
};

messageSchema.methods.markAsRead = async function (userId) {
  if (!this.readBy.includes(userId)) {
    this.readBy.push(userId);
    await this.save();
  }
};

messageSchema.methods.deleteForUser = async function (userId) {
  if (!this.deletedBy.includes(userId)) {
    this.deletedBy.push(userId);
    await this.save();
  }
};

messageSchema.methods.edit = async function (newContent) {
  this.content = newContent;
  this.isEdited = true;
  await this.save();
};

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;
