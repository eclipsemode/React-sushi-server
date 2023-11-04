import Router from "express";
const router = Router();
import userController from "../controllers/UserController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import registrationSchema from "../validation/registration-schema.js";

router.post("/auth", registrationSchema, userController.auth);
router.post("/confirm", userController.confirm);
router.get("/refresh", userController.refresh);
router.get("/logout", userController.logout);
router.get("/info", authMiddleware, userController.getUserData);
router.patch("/patch", authMiddleware, userController.patchUserData);

export default router;