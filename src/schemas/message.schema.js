const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chat',
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      trim: true,
      required: function () {
        return this.type !== 'file' && this.type !== 'sticker';
      },
    },
    type: {
      type: String,
      enum: ['text', 'image', 'file', 'voice', 'video', 'sticker', 'system'],
      default: 'text',
    },
    attachments: [
      {
        url: String,
        type: String,
        name: String,
        size: Number,
        duration: Number,
      },
    ],
    reactions: {
      type: Map,
      of: [mongoose.Schema.Types.ObjectId],
      default: {},
    },
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
    },
    mentions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    readBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    deletedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
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
      ref: 'Chat',
    },
    metadata: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  },
);

messageSchema.index({ chat: 1, createdAt: -1 });
messageSchema.index({ sender: 1 });
messageSchema.index({ type: 1 });

module.exports = messageSchema;
