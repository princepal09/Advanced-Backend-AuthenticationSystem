import express from "express";
import { authMiddleware } from "../../middlewares/authentication.middleware.js";
import { authorizePermissions } from "../../middlewares/authorization.middleware.js";
import { Permissions } from "../../constants/permissions.js";
import { adminController } from "./admin.container.js";
import {
  assignRoleParamsSchema,
  assignRoleSchema,
  getAllUserOfRoleSchema,
  getRoleByIdSchema,
  getUserPermissionsSchema,
  removeUserRoleParamsSchema,
  updateRoleSchema,
} from "./admin.schema.js";
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

router.post(
  "/roles",
  authMiddleware,
  authorizePermissions(Permissions.MANAGE_ROLES),
  adminController.createRoleController,
);

router.patch(
  "/roles/:roleId",
  authMiddleware,
  authorizePermissions(Permissions.MANAGE_ROLES),
  validate(updateRoleSchema),
  adminController.updateRoleController,
);

router.post(
  "/roles/users/:userId/roles",
  authMiddleware,
  authorizePermissions(Permissions.MANAGE_ROLES),
  validate(assignRoleParamsSchema, "params"),
  validate(assignRoleSchema, "body"),
  adminController.assignRoleToUserController,
);

router.delete(
  "/users/:userId/roles/:roleId",
  authMiddleware,
  authorizePermissions(Permissions.MANAGE_ROLES),
  validate(removeUserRoleParamsSchema, "params"),
  adminController.removeRoleFromUserController
);

router.get(
  "/users/roles/:roleId",
  authMiddleware,
  authorizePermissions(Permissions.MANAGE_ROLES),
  validate(getAllUserOfRoleSchema, "params"),
  adminController.getAllUserOfRoleController
);

router.get(
  "/users/:userId/permissions",
  authMiddleware,
  authorizePermissions(Permissions.MANAGE_ROLES),
  validate(getUserPermissionsSchema, "params"),
  adminController.getUserPermissionsController
);
export default router;
