import { User } from "../../../generated/prisma-client/client.js";
import { UpdateRoleInputDTO } from "./admin.schema.js";
import { AllRolesType, GetRoleByIdType } from "./admin.types.js";

export interface IAdminRepository{
    getAllUsers() : Promise<User[] | null>

    getAllRoles() : Promise<AllRolesType | null>

    getRoleById(roleId:string) : Promise<GetRoleByIdType | null>

    createRoleWithPermissions(name:string, permissions:string[]):Promise<unknown>;

    updateRole(roleId:string, data:UpdateRoleInputDTO):Promise<unknown>

}