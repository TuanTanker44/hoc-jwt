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

export default router;
