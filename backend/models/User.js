import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      require: true,
      minlength: 6,
      maxlength: 30,
      unique: true,
    },
    email: {
      type: String,
      require: true,
      minlength: 10,
      maxlength: 50,
      unique: true,
    },
    password: {
      type: String,
      require: true,
      minlength: 8,
    },
    admin: {
      type: Boolean,
      default: false,
    },
    name: {
      type: String,
      require: true,
      minlength: 2,
      maxlength: 100,
    },
    chatItems: [
      {
        chatId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Room",
        },
        lastMessage: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Message",
          default: null,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export { User };
