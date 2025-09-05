import { User } from "../models/User.js";
import { RefreshToken } from "../models/RefreshToken.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { v4 } from "uuid";

dotenv.config();

const authController = {
  registerUser: async (req, res) => {
    try {
      //Hash password
      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash(req.body.password, salt);

      //Create new user
      const newUser = new User({
        username: req.body.username,
        email: req.body.email,
        password: hashed,
      });

      //Save to DB
      const user = await newUser.save();
      res.status(200).json(user);
    } catch (error) {
      res.status(500).json(error);
    }
  },

  generateAccessToken: (user) => {
    console.log(
      "Generate access token for user:",
      user.username,
      "at",
      new Date().toISOString()
    );
    return jwt.sign(
      { id: user.id, admin: user.admin, uuid: v4() },
      process.env.JWT_ACCESS_KEY,
      { expiresIn: "4h" }
    );
  },
  generateRefreshToken: async (user) => {
    console.log(
      "Generate refresh token for user:",
      user.username,
      "at",
      new Date().toISOString()
    );

    try {
      const existingTokenDoc = await RefreshToken.findOne({ userId: user.id });

      // Nếu chưa có RT → tạo mới và lưu
      if (!existingTokenDoc) {
        const refreshToken = jwt.sign(
          { id: user.id, admin: user.admin, uuid: v4() },
          process.env.JWT_REFRESH_KEY,
          { expiresIn: "7d" }
        );

        const newToken = new RefreshToken({
          userId: user.id,
          refreshToken: refreshToken,
        });

        await newToken.save();
        return refreshToken;
      }

      // Nếu đã có RT → kiểm tra hạn
      try {
        const newRefreshToken = jwt.sign(
          { id: user.id, admin: user.admin, uuid: v4() },
          process.env.JWT_REFRESH_KEY,
          { expiresIn: "7d" }
        );

        existingTokenDoc.refreshToken = newRefreshToken;
        await existingTokenDoc.save();
        return newRefreshToken;
      } catch (err) {
        console.error("Error generating new refresh token:", err);
        throw new Error("Failed to generate new refresh token");
      }
    } catch (error) {
      console.error("Error in generateRefreshToken:", error);
      throw error;
    }
  },

  //Login
  loginUser: async (req, res) => {
    try {
      const user = await User.findOne({ username: req.body.username });
      if (!user) {
        res.status.json("Non-exist username!");
      }
      const validPassword = await bcrypt.compare(
        req.body.password,
        user.password
      );
      if (!validPassword) {
        res.status(404).json("Wrong password!");
      }
      //Login success
      if (user && validPassword) {
        const accessToken = authController.generateAccessToken(user);
        const refreshToken = await authController.generateRefreshToken(user);
        res.cookie("accessToken", accessToken, {
          httpOnly: true,
          secure: true,
          sameSite: "none",
        });
        res.cookie("refreshToken", refreshToken, {
          httpOnly: true,
          secure: true, //true : cookies chỉ hoạt động qua https
          sameSite: "none", //lax: cookies chỉ gửi qua cùng một trang (domain)
        });
        const { password, ...others } = user._doc;
        res.status(200).json({ ...others, accessToken });
      }
    } catch (error) {
      res.status(500).json(error);
    }
  },

  //REDIS để lưu trữ refresh token
  refreshToken: async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json("You are not authenticated!");
    }
    jwt.verify(refreshToken, process.env.JWT_REFRESH_KEY, (err, user) => {
      if (err) {
        return res.status(403).json("Refresh token is not valid!");
      }
      const newAccessToken = authController.generateAccessToken(user);
      const newRefreshToken = authController.generateRefreshToken(user);
      localStorage.setItem("accessToken", newRefreshToken);
      res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
      });
      res.status(200).json({ newAccessToken });
    });
  },
};

export { authController };
