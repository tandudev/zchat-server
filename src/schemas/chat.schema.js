const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    isGroup: {
      type: Boolean,
      default: false,
    },
    avatar: {
      type: String,
      default: '',
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    admins: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
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
    isArchived: {
      type: Boolean,
      default: false,
    },
    settings: {
      notifications: {
        type: Boolean,
        default: true,
      },
      privacy: {
        type: String,
        enum: ['public', 'private', 'friendsOnly'],
        default: 'private',
      },
    },
    lastActive: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

chatSchema.index({ members: 1 });
chatSchema.index({ lastMessage: 1 });
chatSchema.index({ isGroup: 1 });
chatSchema.index({ isActive: 1 });

module.exports = chatSchema;
