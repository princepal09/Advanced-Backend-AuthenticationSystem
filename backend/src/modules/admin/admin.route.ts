import express from "express";
import { authMiddleware } from "../../middlewares/authentication.middleware.js";
import { authorizePermissions } from "../../middlewares/authorization.middleware.js";
import { Permissions } from "../../constants/permissions.js";

const router = express.Router();

router.get(
  "all-users",
  authMiddleware,
  authorizePermissions(Permissions.MANAGE_USERS),
  
);

export default router;
