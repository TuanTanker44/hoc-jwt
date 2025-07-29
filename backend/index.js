import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();
app.use(cors());
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

app.listen(8000, () => {
  console.log("Server is running on http://localhost:8000");
});

connectDB();
