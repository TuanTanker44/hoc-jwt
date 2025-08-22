import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  chatId: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true }, // ID phòng chat hoặc cặp user
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  }, // Ai gửi
  message: { type: String, required: true }, // Nội dung
  type: { type: String, enum: ["text", "image", "file"], default: "text" }, // Loại tin nhắn
  createdAt: { type: Date, default: Date.now }, // Thời gian gửi
  readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Ai đã đọc
});

const Message = mongoose.model("Message", messageSchema);

export default Message;
