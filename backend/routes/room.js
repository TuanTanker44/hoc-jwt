import { Router } from "express";
import roomController from "../controllers/roomController.js";
import middlewareController from "../middlewares/middlewareController.js";

const router = Router();

router.get(
  "/:chatId",
  middlewareController.verifyToken,
  roomController.getRoomById
);

export default router;
