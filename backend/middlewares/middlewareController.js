import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { authController } from "../controllers/authController.js";
import { RefreshToken } from "../models/RefreshToken.js";
import { User } from "../models/User.js";

dotenv.config();
//điều kiện trước khi thực hiện các request trên server
const middlewareController = {
  verifyToken: (req, res, next) => {
    const token = req.headers.token;
    if (token) {
      const accessToken = token.split(" ")[1];
      const refreshToken = req.cookies.refreshToken;
      if (!accessToken) {
        return res.status(401).json("Access token is missing!");
      }
      jwt.verify(accessToken, process.env.JWT_ACCESS_KEY, async (err, user) => {
        if (!err) {
          req.user = user;
          return next();
        }
        if (err.name === "TokenExpiredError") {
          let newAccessToken;
          try {
            const userWithToken = await RefreshToken.findOne({
              refreshToken: refreshToken,
            });
            const savedToken = userWithToken.refreshToken;
            if (!savedToken) {
              return res.status(403).json("Refresh token is not valid!");
            }
            jwt.verify(
              refreshToken,
              process.env.JWT_REFRESH_KEY,
              async (err, user) => {
                if (err) {
                  return res
                    .status(403)
                    .json("Refresh token expired. Please login again.");
                }
                try {
                  const currentUser = await User.findById(userWithToken.userId);
                  newAccessToken =
                    authController.generateAccessToken(currentUser);
                  const newRefreshToken =
                    authController.generateRefreshToken(currentUser);
                  res.cookie("refreshToken", newRefreshToken, {
                    httpOnly: true,
                    secure: true,
                    sameSite: "strict",
                  });
                } catch (error) {
                  console.error("Error fetching current user:", error);
                  return res.status(500).json("Internal server error");
                }
              }
            );
            res.setHeader("token", "Bearer " + newAccessToken);
            req.user = user;
            return next();
          } catch (error) {
            console.error("Error refreshing token:", error);
            return res.status(500).json("Internal server error");
          }
        } else {
          return res.status(403).json("Token is not valid!");
        }
      });
    } else {
      return res.status(401).json("You are not authenticated!");
    }
  },
  verifyTokenAndAuthorization: (req, res, next) => {
    middlewareController.verifyToken(req, res, () => {
      if (req.user.id === req.params.id || req.user.admin) {
        next();
      } else {
        res.status(403).json("You are not allowed to do that!");
      }
    });
  },
};

export default middlewareController;
