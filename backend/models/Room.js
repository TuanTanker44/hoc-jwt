import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
  name: { type: String },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Thành viên
  isGroup: { type: Boolean, default: false }, // Phân biệt nhóm hay 1-1
  createdAt: { type: Date, default: Date.now },
});

const Room = mongoose.model("Room", roomSchema);

export default Room;
