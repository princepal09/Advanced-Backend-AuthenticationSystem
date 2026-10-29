import { IAdminRepository } from "./admin.interface.js";
import { sanitizedAdminResponse } from "./admin.response.js";

export class AdminService {
  constructor(private adminRepo: IAdminRepository) {}

  async getAllUsers() {
    const users = await this.adminRepo.getAllUsers();
    return users.map((user) => sanitizedAdminResponse(user));
  }
}
