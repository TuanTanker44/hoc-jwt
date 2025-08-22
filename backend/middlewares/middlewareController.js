import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { authController } from "../controllers/authController.js";
import { RefreshToken } from "../models/RefreshToken.js";
import { User } from "../models/User.js";

dotenv.config();
//điều kiện trước khi thực hiện các request trên server
const middlewareController = {
  verifyToken: (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json("You are not authenticated!");

    const accessToken = authHeader.split(" ")[1];
    jwt.verify(accessToken, process.env.JWT_ACCESS_KEY, (err, user) => {
      if (err) {
        if (err.name === "TokenExpiredError") {
          return res.status(401).json({ message: "Access token expired" });
        }
        return res.status(403).json("Token is not valid!");
      }
      req.user = user;
      next();
    });
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
