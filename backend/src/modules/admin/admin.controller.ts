import { catchAsync } from "../../utils/common/helpers/CatchAsync.js";
import { sendResponse } from "../../utils/response/AppResponse.js";
import { Request, Response } from "express";
import { AdminService } from "./admin.service.js";

export class AdminController {
  constructor(private adminService: AdminService) {}
  getUserController = catchAsync(async (_req: Request, res: Response) => {
    const result = await this.adminService.getAllUsers();

    sendResponse(res, 201, {
      success: true,
      message: "User fetched successfully",
      data: result,
    });
  });

  getAllRolesController = catchAsync(async (_req: Request, res: Response) => {
    const result = await this.adminService.getAllRoles();

    sendResponse(res, 200, {
      success: true,
      message: "All roles fetched successfully",
      data: result,
    });
  });

  getRoleByIdController = catchAsync(async (req: Request, res: Response) => {
    const roleId = req.params.roleId as string;
    const result = await this.adminService.getRoleById(roleId);

    sendResponse(res, 200, {
      success: true,
      message: "Role fetched successfully",
      data: result,
    });
  });
}
