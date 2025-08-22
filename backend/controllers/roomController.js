import Room from "../models/Room.js";
import mongoose from "mongoose";

// Lấy tất cả message theo chatId (roomId)
const roomController = {
  getRoomById: async (req, res) => {
    const { ObjectId } = mongoose.Types;
    try {
      const roomId = req.params.chatId;
      const room = await Room.findById(new ObjectId(roomId)).populate(
        "participants",
        "username name email"
      );
      if (!room) {
        return res.status(404).json({ message: "Room not found" });
      }
      res.status(200).json(room);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
};

export default roomController;
