import express from "express";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { Server } from "socket.io";
import cookieParser from "cookie-parser";
import authRoute from "./routes/auth.js";
import userRoute from "./routes/user.js";
import messageRoute from "./routes/message.js";
import roomRoute from "./routes/room.js";

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", //cors: { origin: '*' } // Cho phép kết nối từ mọi nguồn (thay đổi cho production)
    credentials: true,
  },
});

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("sendMessage", (data) => {
    io.emit("receiveMessage", data);
  });
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

async function connectDB() {
  try {
    await mongoose.connect(process.env.DB_URL).then(() => {
      console.log("Connected to Database");
    });
  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
}

//Routes
app.use("/v1/auth", authRoute);
app.use("/v1/user", userRoute);
app.use("/v1/message", messageRoute);
app.use("/v1/chat", roomRoute);

connectDB();

app.listen(5000, () => {
  console.log("Server is running on http://localhost:5000");
});
app.get("/", (req, res) => {
  res.send("test server ");
} );
