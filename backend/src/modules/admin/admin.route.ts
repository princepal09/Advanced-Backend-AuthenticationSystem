import express from "express";
import { authMiddleware } from "../../middlewares/authentication.middleware.js";
import { authorizePermissions } from "../../middlewares/authorization.middleware.js";
import { Permissions } from "../../constants/permissions.js";
import { adminController } from "./admin.container.js";
import { getRoleByIdSchema } from "./admin.schema.js";
import { validate } from "../../middlewares/validate.middleware.js";

const router = express.Router();

router.get(
  "/all-users",
  authMiddleware,
  authorizePermissions(Permissions.MANAGE_USERS),
  adminController.getUserController,
);

router.get(
  "/roles",
  authMiddleware,
  authorizePermissions(Permissions.MANAGE_ROLES),
  adminController.getAllRolesController,
);

router.get(
  "/roles/:roleId",
  authMiddleware,
  authorizePermissions(Permissions.MANAGE_ROLES),
  validate(getRoleByIdSchema, "params"),
  adminController.getRoleByIdController,
);

export default router;
