import { string, z } from "zod";
import { PermissionValues } from "../../constants/permissions.js";

export const getRoleByIdSchema = z.object({
  roleId: z.uuid(),
});

export const createRoleSchema = z.object({
  name: z.string().trim().min(2).max(50),
  permissions: z.array(z.enum(PermissionValues)),
});

export const updateRoleSchema = z.object({

    name:string().trim().min(2).max(50).optional(),

    permissions:z.array(z.enum(PermissionValues)).min(1).optional()
});

export type CreateRoleInputDTO = z.infer<typeof createRoleSchema>;
export type UpdateRoleInputDTO = z.infer<typeof updateRoleSchema>;
