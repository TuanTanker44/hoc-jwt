import mongoose from "mongoose";

const RefreshTokenSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    refreshToken: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, expires: "7d" },
  },
  { collection: "refreshTokens" }
);

const RefreshToken = mongoose.model(
  "RefreshToken",
  RefreshTokenSchema,
  "refreshTokens"
);

export { RefreshToken };
