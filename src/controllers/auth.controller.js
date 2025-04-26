require("dotenv").config();
const userService = require("../services/user.service");
const { generateToken } = require("../utils/jwt.utils");
const passport = require("../config/passport");

class AuthController {
  // Đăng ký tài khoản mới
  async register(req, res) {
    try {
      const { email, password, fullName } = req.body;

      // Kiểm tra email đã tồn tại chưa
      const existingUser = await userService.findUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "Email đã được đăng ký" });
      }

      // Tạo user mới
      const user = await userService.createUser({ email, password, fullName });

      // Gửi email xác thực
      await userService.sendVerificationEmail(user);

      // Tạo tokens
      const accessToken = generateToken(user._id);
      const refreshToken = generateToken(user._id, true);

      // Cập nhật refresh token cho user
      await userService.updateUser(user._id, { refreshToken });

      // Lưu tokens vào cookie
      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 1000, // 1 giờ
      });

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
      });

      res.status(201).json({
        message: "Đăng ký thành công. Vui lòng kiểm tra email để xác thực tài khoản.",
        user: {
          id: user._id,
          email: user.email,
          username: user.username,
          fullName: user.fullName,
          isVerified: user.isVerified,
        },
      });
    } catch (error) {
      res.status(500).json({ message: "Có lỗi xảy ra: " + error.message });
    }
  }

  // Xác thực email
  async verifyEmail(req, res) {
    try {
      const { code } = req.body;
      const user = await userService.findUserById(req.user.id);

      if (!user) {
        return res.status(404).json({ message: "Không tìm thấy người dùng" });
      }

      const isVerified = user.verifyCode(code);
      if (!isVerified) {
        return res.status(400).json({ message: "Mã xác thực không hợp lệ hoặc đã hết hạn" });
      }

      await user.save();
      res.json({ message: "Xác thực email thành công" });
    } catch (error) {
      res.status(500).json({ message: "Có lỗi xảy ra: " + error.message });
    }
  }

  // Đăng nhập
  async login(req, res) {
    try {
      const { email, password } = req.body;
      const user = await userService.findUserByEmail(email);

      if (!user) {
        return res.status(404).json({ message: "Email không tồn tại" });
      }

      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Mật khẩu không chính xác" });
      }

      const accessToken = generateToken(user._id);
      const refreshToken = generateToken(user._id, true);

      await userService.updateUser(user._id, {
        refreshToken,
        lastActive: new Date(),
      });

      // Lưu tokens vào cookie
      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 1000, // 1 giờ
      });

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
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
      res.status(500).json({ message: "Có lỗi xảy ra: " + error.message });
    }
  }

  // Đăng xuất
  async logout(req, res) {
    try {
      // Xóa cookies
      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");

      // Xóa refresh token trong database
      await userService.updateUser(req.user.id, { refreshToken: null });

      res.json({ message: "Đăng xuất thành công" });
    } catch (error) {
      res.status(500).json({ message: "Có lỗi xảy ra: " + error.message });
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
        return res.redirect(`${process.env.CLIENT_URL}/login?error=Xác thực thất bại`);
      }

      try {
        // Tạo tokens
        const accessToken = generateToken(user._id);
        const refreshToken = generateToken(user._id, true);

        // Cập nhật refresh token
        await userService.updateUser(user._id, { refreshToken });

        // Lưu tokens vào cookie
        res.cookie("accessToken", accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 60 * 60 * 1000, // 1 giờ
        });

        res.cookie("refreshToken", refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
        });

        // Chuyển hướng về client
        res.redirect(`${process.env.CLIENT_URL}/login?success=true`);
      } catch (error) {
        res.redirect(`${process.env.CLIENT_URL}/login?error=${encodeURIComponent(error.message)}`);
      }
    })(req, res, next);
  }
}

module.exports = new AuthController();
