const userService = require("../services/user.service");
const { generateToken } = require("../utils/jwt.utils");
const passport = require("../config/passport");

class UserController {
  async register(req, res) {
    try {
      const { email, password, fullName } = req.body;

      // Check if user already exists
      const existingUser = await userService.findUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }

      // Create new user
      const user = await userService.createUser({ email, password, fullName });

      // Send verification email
      await userService.sendVerificationEmail(user);

      // Generate tokens
      const accessToken = generateToken(user._id);
      const refreshToken = generateToken(user._id, true);

      // Update user with refresh token
      await userService.updateUser(user._id, { refreshToken });

      // Set cookies
      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 1000, // 1 hour
      });

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.status(201).json({
        message: "User registered successfully. Please check your email for verification.",
        user: {
          id: user._id,
          email: user.email,
          username: user.username,
          fullName: user.fullName,
          isVerified: user.isVerified,
        },
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async verifyEmail(req, res) {
    try {
      const { code } = req.body;
      const user = await userService.findUserById(req.user.id);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const isVerified = user.verifyCode(code);
      if (!isVerified) {
        return res.status(400).json({ message: "Invalid or expired verification code" });
      }

      await user.save();
      res.json({ message: "Email verified successfully" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;
      const user = await userService.findUserByEmail(email);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid password" });
      }

      const accessToken = generateToken(user._id);
      const refreshToken = generateToken(user._id, true);

      await userService.updateUser(user._id, {
        refreshToken,
        lastActive: new Date(),
      });

      // Set cookies
      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 1000, // 1 hour
      });

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.json({
        user: {
          id: user._id,
          email: user.email,
          username: user.username,
          fullName: user.fullName,
          avatar: user.avatar,
          isVerified: user.isVerified,
        },
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async logout(req, res) {
    try {
      // Clear cookies
      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");

      // Update user's refresh token
      await userService.updateUser(req.user.id, { refreshToken: null });

      res.json({ message: "Logged out successfully" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getProfile(req, res) {
    try {
      const user = await userService.findUserById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({
        id: user._id,
        email: user.email,
        username: user.username,
        fullName: user.fullName,
        avatar: user.avatar,
        coverPhoto: user.coverPhoto,
        bio: user.bio,
        gender: user.gender,
        dateOfBirth: user.dateOfBirth,
        isVerified: user.isVerified,
        settings: user.settings,
        friends: user.friends,
        friendRequests: user.friendRequests,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async updateProfile(req, res) {
    try {
      const { fullName, bio, gender, dateOfBirth, settings } = req.body;
      const user = await userService.updateUser(req.user.id, {
        fullName,
        bio,
        gender,
        dateOfBirth,
        settings,
      });

      res.json({
        message: "Profile updated successfully",
        user: {
          id: user._id,
          fullName: user.fullName,
          bio: user.bio,
          gender: user.gender,
          dateOfBirth: user.dateOfBirth,
          settings: user.settings,
        },
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async uploadAvatar(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const user = await userService.uploadAvatar(req.user.id, req.file);
      res.json({
        message: "Avatar uploaded successfully",
        avatar: user.avatar,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async uploadCoverPhoto(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const user = await userService.uploadCoverPhoto(req.user.id, req.file);
      res.json({
        message: "Cover photo uploaded successfully",
        coverPhoto: user.coverPhoto,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async searchUsers(req, res) {
    try {
      const { query } = req.query;
      if (!query) {
        return res.status(400).json({ message: "Search query is required" });
      }

      const users = await userService.searchUsers(query);
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async sendFriendRequest(req, res) {
    try {
      const { friendId } = req.params;
      const friend = await userService.sendFriendRequest(req.user.id, friendId);

      res.json({
        message: "Friend request sent successfully",
        friend: {
          id: friend._id,
          username: friend.username,
          fullName: friend.fullName,
          avatar: friend.avatar,
        },
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async acceptFriendRequest(req, res) {
    try {
      const { friendId } = req.params;
      const user = await userService.addFriend(req.user.id, friendId);

      res.json({
        message: "Friend request accepted successfully",
        user: {
          id: user._id,
          friends: user.friends,
        },
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async blockUser(req, res) {
    try {
      const { userId } = req.params;
      const user = await userService.blockUser(req.user.id, userId);

      res.json({
        message: "User blocked successfully",
        user: {
          id: user._id,
          blockedUsers: user.blockedUsers,
        },
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Google OAuth methods
  async googleAuth(req, res, next) {
    passport.authenticate("google", {
      scope: ["profile", "email"],
    })(req, res, next);
  }

  async googleAuthCallback(req, res, next) {
    passport.authenticate("google", async (err, user) => {
      if (err) {
        return res.redirect(
          `${process.env.CLIENT_URL}/login?error=${encodeURIComponent(err.message)}`
        );
      }

      if (!user) {
        return res.redirect(`${process.env.CLIENT_URL}/login?error=Authentication failed`);
      }

      try {
        // Generate tokens
        const accessToken = generateToken(user._id);
        const refreshToken = generateToken(user._id, true);

        // Update user with refresh token
        await userService.updateUser(user._id, { refreshToken });

        // Set cookies
        res.cookie("accessToken", accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 60 * 60 * 1000, // 1 hour
        });

        res.cookie("refreshToken", refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        // Redirect to client with success message
        res.redirect(`${process.env.CLIENT_URL}/login?success=true`);
      } catch (error) {
        res.redirect(`${process.env.CLIENT_URL}/login?error=${encodeURIComponent(error.message)}`);
      }
    })(req, res, next);
  }
}

module.exports = new UserController();
