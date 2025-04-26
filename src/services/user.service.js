const User = require("../models/user.model");
const nodemailer = require("nodemailer");
const cloudinary = require("cloudinary").v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure email transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_SERVICE,
    pass: process.env.PASSWORD_SERVICE,
  },
});

class UserService {
  async createUser(userData) {
    const username = userData.email.split("@")[0];
    const user = new User({
      ...userData,
      username,
    });
    await user.save();
    return user;
  }

  async findUserByEmail(email) {
    return User.findOne({ email });
  }

  async findUserById(id) {
    return User.findById(id);
  }

  async updateUser(id, updateData) {
    return User.findByIdAndUpdate(id, updateData, { new: true });
  }

  async deleteUser(id) {
    return User.findByIdAndDelete(id);
  }

  async sendVerificationEmail(user) {
    const verificationCode = user.generateVerificationCode();
    await user.save();

    const mailOptions = {
      from: process.env.EMAIL_SERVICE,
      to: user.email,
      subject: "Verify your ZChat account",
      html: `
                <h1>Welcome to ZChat!</h1>
                <p>Your verification code is: <strong>${verificationCode}</strong></p>
                <p>This code will expire in 10 minutes.</p>
            `,
    };

    await transporter.sendMail(mailOptions);
    return verificationCode;
  }

  async uploadAvatar(userId, file) {
    const result = await cloudinary.uploader.upload(file.path, {
      folder: "zchat/avatars",
      resource_type: "auto",
    });

    const user = await this.updateUser(userId, { avatar: result.secure_url });
    return user;
  }

  async uploadCoverPhoto(userId, file) {
    const result = await cloudinary.uploader.upload(file.path, {
      folder: "zchat/cover-photos",
      resource_type: "auto",
    });

    const user = await this.updateUser(userId, { coverPhoto: result.secure_url });
    return user;
  }

  async addFriend(userId, friendId) {
    const user = await User.findById(userId);
    const friend = await User.findById(friendId);

    if (!user.friends.includes(friendId)) {
      user.friends.push(friendId);
      friend.friends.push(userId);
      user.friendRequests = user.friendRequests.filter(
        (id) => id.toString() !== friendId.toString()
      );
      friend.friendRequests = friend.friendRequests.filter(
        (id) => id.toString() !== userId.toString()
      );
    }

    await user.save();
    await friend.save();
    return user;
  }

  async sendFriendRequest(userId, friendId) {
    const friend = await User.findById(friendId);
    if (!friend.friendRequests.includes(userId)) {
      friend.friendRequests.push(userId);
      await friend.save();
    }
    return friend;
  }

  async blockUser(userId, blockedUserId) {
    const user = await User.findById(userId);
    if (!user.blockedUsers.includes(blockedUserId)) {
      user.blockedUsers.push(blockedUserId);
      user.friends = user.friends.filter((id) => id.toString() !== blockedUserId.toString());
      user.friendRequests = user.friendRequests.filter(
        (id) => id.toString() !== blockedUserId.toString()
      );
      await user.save();
    }
    return user;
  }

  async searchUsers(query) {
    return User.find({
      $or: [
        { username: { $regex: query, $options: "i" } },
        { fullName: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
      ],
      isActive: true,
    }).select("-password -refreshToken");
  }
}

module.exports = new UserService();
