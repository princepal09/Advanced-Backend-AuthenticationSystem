import { IMMUTABLE_ROLES } from "../../constants/system-role.js";
import { AppError } from "../../utils/common/error/AppError.js";
import { toResponseDTO } from "./admin.dto.js";
import { IAdminRepository } from "./admin.interface.js";
import { sanitizedAdminResponse } from "./admin.response.js";
import {
  AssignRoleInputDTO,
  CreateRoleInputDTO,
  UpdateRoleInputDTO,
} from "./admin.schema.js";

export class AdminService {
  constructor(private adminRepo: IAdminRepository) {}

  async getAllUsers() {
    const users = await this.adminRepo.getAllUsers();
    if (!users) {
      throw new AppError("No users found", 404);
    }
    return users.map((user) => sanitizedAdminResponse(user));
  }

  async getAllRoles() {
    const roles = await this.adminRepo.getAllRoles();

    const data = roles?.map((role) => ({
      id: role.id,
      name: role.name,
      createdAt: role.createdAt,
      userCount: role.userRoles.length,
      permissions: role.rolePermissions.map(
        (rolePermission) => rolePermission.permission.name,
      ),
    }));

    return data;
  }

  async getRoleById(roleId: string) {
    const role = await this.adminRepo.getRoleById(roleId);

    if (!role) {
      throw new AppError("Role not found", 404);
    }

    const responseDTO = toResponseDTO(role);

    return responseDTO;
  }

  async createRole(data: CreateRoleInputDTO) {
    try {
      return await this.adminRepo.createRoleWithPermissions(
        data.name,
        data.permissions,
      );
    } catch (error) {
      if (error instanceof AppError) {
        if (error.message === "Role already exists") {
          throw new AppError("Role already exists", 409);
        }

        if (error.message === "Invalid Permissions") {
          throw new AppError("Invalid Permissions", 400);
        }
      }
      throw error;
    }
  }

  async updateRole(roleId: string, data: UpdateRoleInputDTO) {
    const updatedRole = await this.adminRepo.updateRole(roleId, data);
    return updatedRole;
  }

  async deleteRole(roleId: string) {
    const role = await this.adminRepo.getRoleById(roleId);

    if (!role) {
      throw new AppError("Role not found", 404);
    }

    if (IMMUTABLE_ROLES.includes(role.name as any)) {
      throw new AppError("System roles cannot be deleted", 403);
    }

    await this.adminRepo.deleteRole(roleId);
  }

  async assignRoleToUser(userId: string, data: AssignRoleInputDTO) {
    const roles = await this.adminRepo.getRolesById(data.roleIds);

    if (roles.some((role) => IMMUTABLE_ROLES.some((name) => name === role.name))) {
      throw new AppError("Immutable roles cannot be assigned", 403);
    }

    await this.adminRepo.assignRoleToUser(userId, data.roleIds);
  }

  async removeRoleFromUser(userId:string, roleId:string){
    await this.adminRepo.removeUserRole(userId, roleId);

  }

  async getAllUsersByRoleId(roleId:string){
    const data = await this.adminRepo.getAllUserByRoleId(roleId);
    return data;
  }

  async getUserPermissions(userId:string){
    const user = await this.adminRepo.getUserPermissions(userId);

    const permissions = user.userRoles.flatMap((userRole) => userRole.role.rolePermissions.map((rolePermission) => rolePermission.permission.name) )

    const uniquePermissions = [...new Set(permissions)];

    return uniquePermissions;
  }
}
