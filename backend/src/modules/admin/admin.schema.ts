import { z } from "zod";
import {PermissionValues } from "../../constants/permissions.js";

export const getRoleByIdSchema = z.object({
    roleId: z.uuid()
});

export const createRoleSchema = z.object({
    name:z.string().trim().min(2).max(50),
    permissions:z.array(z.enum(PermissionValues))

})

export type CreateRoleInputDTO = z.infer<typeof createRoleSchema>