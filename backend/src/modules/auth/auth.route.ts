import express from "express";

import { validate } from "../../middlewares/validate.middleware.js";
import { loginUserSchema, registerUserSchema } from "./auth.schema.js";
import { authController } from "./auth.container.js";
import { authMiddleware } from "../../middlewares/authentication.middleware.js";

const router = express.Router();

router.post(
  "/register",
  validate(registerUserSchema),
  authController.registerUserController,
);
router.post(
  "/login",
  validate(loginUserSchema),
  authController.loginUserController,
);

router.get("/me", authMiddleware, authController.loggedInUserController);

router.post("/refresh-token", authController.refreshTokenController);

router.post("/logout", authMiddleware, authController.logoutController);

router.post("/logout-all", authMiddleware, authController.logoutUserFromAllSessions);

export default router;
