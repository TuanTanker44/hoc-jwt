import { Router } from "express";
import messageController from "../controllers/messageController.js";
import middlewareController from "../middlewares/middlewareController.js";

const router = Router();

router.get(
  "/chat/:chatId",
  middlewareController.verifyToken,
  messageController.getMessagesByChatId
);

router.get(
  "/:messageId",
  middlewareController.verifyToken,
  messageController.getMessageById
);

export default router;
