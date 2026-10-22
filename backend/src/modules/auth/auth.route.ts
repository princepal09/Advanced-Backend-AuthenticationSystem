import express from "express";

import { validate } from "../../middlewares/validate.middleware.js";
import { loginUserSchema, registerUserSchema } from "./auth.schema.js";
import { authController } from "./auth.container.js";

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

export default router;
