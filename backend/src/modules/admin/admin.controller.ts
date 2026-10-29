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
}
