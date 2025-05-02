const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const userSchema = require('../schemas/user.schema');

// Hash password trước khi lưu vào DB
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// So sánh mật khẩu
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Tạo mã xác minh
userSchema.methods.generateVerificationCode = function () {
  const verificationCode = crypto.randomInt(100000, 999999).toString();
  this.verificationCode = verificationCode;
  this.verificationCodeExpires = Date.now() + 10 * 60 * 1000; // 10 phút
  return verificationCode;
};

// Xác minh mã xác minh
userSchema.methods.verifyCode = function (code) {
  if (this.verificationCode !== code) return false;
  if (this.verificationCodeExpires < Date.now()) return false;

  this.isVerified = true;
  this.verificationCode = null;
  this.verificationCodeExpires = null;
  return true;
};

// Ẩn mật khẩu và các thông tin nhạy cảm khi trả về JSON
userSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.refreshToken;
  return userObject;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
