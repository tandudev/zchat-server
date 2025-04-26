const mongoose = require("mongoose");
const messageSchema = require("../schemas/message.schema");

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
