import Room from "../models/Room.js";
import Message from "../models/Message.js";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import dotenv from "dotenv";

dotenv.config();

const userController = {
  getAllUser: async (req, res) => {
    try {
      const users = await User.find();
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json(error);
    }
  },
  getUserById: async (req, res) => {
    try {
      const userId = req.params.id;
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json("User not found!");
      }

      res.status(200).json(user);
    } catch (error) {
      res.status(500).json("Error fetching user!");
    }
  },

  getUserByUsername: async (req, res) => {
    try {
      const username = req.params.username;
      const user = await User.findOne({ username: username });
      if (!user) {
        return res.status(404).json("User not found!");
      }
      res.status(200).json(user);
    } catch (error) {
      res.status(500).json("Error fetching user!");
    }
  },

  deleteUser: async (req, res) => {
    try {
      //  /:id
      const user = await User.findById(req.params.id);
      res.status(200).json("Delete successfully!");
    } catch (error) {
      res.status(500).json(error);
    }
  },
  getMe: (req, res) => {
    try {
      // Lấy token từ header Authorization
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json("You are not authenticated!");
      }

      const token = authHeader.split(" ")[1];

      // Giải mã token để lấy userId
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_KEY);
      const userId = decoded.id; // sub chứa userId

      // Truy vấn DB lấy thông tin user
      User.findById(userId)
        .then((user) => {
          if (!user) {
            return res.status(404).json("User not found!");
          }
          const { password, accessToken, ...others } = user._doc;
          res.status(200).json(others);
        })
        .catch((err) => {
          console.error("Error in checkMe:", err);
          res.status(500).json("Internal server error");
        });
    } catch (err) {
      return res.status(403).json("Token is invalid or expired");
    }
  },

  getChatItems: async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json("You are not authenticated!");
      }
      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_KEY);
      const userId = decoded.id;

      User.findById(userId)
        .then((user) => {
          if (!user) {
            return res.status(404).json("User not found!");
          }
          const { chatItems } = user._doc;
          res.status(200).json(chatItems);
        })
        .catch((err) => {
          console.error("Error in checkMe:", err);
          res.status(500).json("Internal server error");
        });
    } catch (error) {
      return res.status(403).json("Token is invalid or expired");
    }
  },
  sendMessage: async (req, res) => {
    try {
      // Tìm room theo id
      const room = await Room.findById(req.params.roomId);
      if (!room) return res.status(404).json({ message: "Room not found" });

      // Tạo object message
      const newMessage = new Message({
        room: req.params.roomId,
        sender: req.body.senderId,
        text: req.body.text,
        createdAt: new Date(),
      });

      // Lưu vào collection messages
      await newMessage.save();
      res.status(200).json(newMessage);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  alterLastMessageWithChatId: async (req, res) => {
    try {
      const { chatId, lastMessage } = req.body;

      // Cập nhật lastMessage cho tất cả user có chatItem.chatId === roomId
      await User.updateMany(
        { "chatItems.chatId": chatId },
        { $set: { "chatItems.$[elem].lastMessage": lastMessage } },
        { arrayFilters: [{ "elem.chatId": chatId }] }
      );

      res.status(200).json("Update lastMessage successfully!");
    } catch (error) {
      console.error("Error in alterLastMessageWithChatId:", error);
      res.status(500).json("Internal server error");
    }
  },
  createNewChatItem: async (req, res) => {
    try {
      const { userIds, roomId } = req.body;

      // Cập nhật vào chatItems các user với roomId mới
      await User.updateMany(
        { _id: { $in: userIds } },
        {
          $push: {
            chatItems: {
              chatId: roomId,
              lastMessage: null,
              timestamp: new Date(),
            },
          },
        }
      );

      res.status(201).json("Updated to: " + userIds);
    } catch (error) {
      res.status(500).json("Internal server error");
    }
  },
};

export default userController;
