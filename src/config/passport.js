const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/user.model");

// Lưu thông tin user vào session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Lấy thông tin user từ session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Cấu hình chiến lược xác thực Google
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.SERVER_URL}/api/users/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Kiểm tra user đã tồn tại chưa
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          // Tạo user mới nếu chưa tồn tại
          user = await User.create({
            googleId: profile.id,
            email: profile.emails[0].value,
            username: profile.emails[0].value.split("@")[0],
            fullName: profile.displayName,
            avatar: profile.photos[0].value,
            isVerified: true, // Tài khoản Google đã được xác thực
          });
        }

        // Cập nhật thời gian hoạt động cuối cùng
        user.lastActive = new Date();
        await user.save();

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

module.exports = passport;
