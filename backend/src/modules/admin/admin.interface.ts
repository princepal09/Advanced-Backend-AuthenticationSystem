import { Role, User } from "../../../generated/prisma-client/client.js";
import { UpdateRoleInputDTO } from "./admin.schema.js";
import { AllRolesType, GetRoleByIdType, GetUserPermissions } from "./admin.types.js";

export interface IAdminRepository{
    getAllUsers() : Promise<User[] | null>

    getAllRoles() : Promise<AllRolesType | null>

    getRoleById(roleId:string) : Promise<GetRoleByIdType | null>

    createRoleWithPermissions(name:string, permissions:string[]):Promise<unknown>;

    updateRole(roleId:string, data:UpdateRoleInputDTO):Promise<unknown>

    deleteRole(roleId:string):Promise<void>
    getRolesById(roleIds:string[]):Promise<Role[]>

    assignRoleToUser(userId:string, roleId:string[]):Promise<void>

    removeUserRole(userId:string, roleId:string):Promise<void>
    
    getAllUserByRoleId(roleId:string): Promise<unknown[]>;

    getAllUsersByRoleId(roleId:string): Promise<unknown[]>

    getUserPermissions(userId:string): Promise<GetUserPermissions>



}
