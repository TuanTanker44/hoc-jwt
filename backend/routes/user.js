import { Router } from "express";
import userController from "../controllers/userController.js";
import middlewareController from "../middlewares/middlewareController.js";

const router = Router();

router.get("/", middlewareController.verifyToken, userController.getAllUser);
router.delete(
  "/:id",
  middlewareController.verifyTokenAndAuthorization,
  userController.deleteUser
);
router.get("/me", middlewareController.verifyToken, userController.getMe);
router.get(
  "/me/chatItems",
  middlewareController.verifyToken,
  userController.getChatItems
);
router.post(
  "/:roomId",
  middlewareController.verifyToken,
  userController.sendMessage
);
router.patch(
  "/alterLastMessageWithChatId/:chatId",
  middlewareController.verifyToken,
  userController.alterLastMessageWithChatId
);

export default router;
