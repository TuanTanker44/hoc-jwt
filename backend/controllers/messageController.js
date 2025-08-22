import Message from "../models/Message.js";
import mongoose from "mongoose";

// Lấy tất cả message theo chatId (roomId)
const messageController = {
  getMessagesByChatId: async (req, res) => {
    const { ObjectId } = mongoose.Types;
    try {
      const chatId = req.params.chatId;
      const messages = await Message.find({ chatId: new ObjectId(chatId) });
      const texts = messages.map((Message) => Message.message);
      res.status(200).json(texts);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  getMessageById: async (req, res) => {
    const { ObjectId } = mongoose.Types;
    try {
      const messageId = req.params.messageId;
      const message = await Message.findById(new ObjectId(messageId));
      if (!message) {
        return res.status(404).json({ message: "Message not found" });
      }
      res.status(200).json(message);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
};

export default messageController;
