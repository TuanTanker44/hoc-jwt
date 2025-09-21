import { Router } from "express";
import roomController from "../controllers/roomController.js";
import middlewareController from "../middlewares/middlewareController.js";

const router = Router();

router.get(
  "/:chatId",
  middlewareController.verifyToken,
  roomController.getRoomById
);
router.post(
  "/create",
  middlewareController.verifyToken,
  roomController.createNewRoom
);
router.get(
  "/:chatId/participants",
  middlewareController.verifyToken,
  roomController.getParticipant
);
export default router;
