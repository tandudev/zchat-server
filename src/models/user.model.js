const mongoose = require('mongoose');
const userSchema = require('../schemas/user.schema');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// Add methods to schema
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

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.generateVerificationCode = function () {
  const verificationCode = crypto.randomInt(100000, 999999).toString();
  this.verificationCode = verificationCode;
  this.verificationCodeExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  return verificationCode;
};

userSchema.methods.verifyCode = function (code) {
  if (this.verificationCode !== code) return false;
  if (this.verificationCodeExpires < Date.now()) return false;

  this.isVerified = true;
  this.verificationCode = null;
  this.verificationCodeExpires = null;
  return true;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
