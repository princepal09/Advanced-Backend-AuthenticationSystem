import { AppError } from "../../utils/common/error/AppError.js";
import { toResponseDTO } from "./admin.dto.js";
import { IAdminRepository } from "./admin.interface.js";
import { sanitizedAdminResponse } from "./admin.response.js";

export class AdminService {
  constructor(private adminRepo: IAdminRepository) {}

  async getAllUsers() {
    const users = await this.adminRepo.getAllUsers();
    if(!users){
      throw new AppError("No users found", 404)
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

  async getRoleById(roleId:string){
    const role = await this.adminRepo.getRoleById(roleId);

    if(!role){
      throw new AppError("Role not found", 404)
    }

    const responseDTO = toResponseDTO(role);

    return responseDTO;

  }
}
