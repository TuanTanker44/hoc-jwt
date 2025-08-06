import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import authRoute from "./routes/auth.js";
import userRoute from "./routes/user.js";

dotenv.config();

const app = express();
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());

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

connectDB();

app.listen(5000, () => {
  console.log("Server is running on http://localhost:5000");
});
