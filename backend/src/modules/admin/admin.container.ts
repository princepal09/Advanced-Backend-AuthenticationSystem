import { AdminController } from "./admin.controller.js";
import { AdminRepository } from "./admin.repository.js"
import { AdminService } from "./admin.service.js"

const adminRepository = new AdminRepository();
const adminService = new AdminService(adminRepository);
const adminController =  new AdminController(adminService);

export { adminController };