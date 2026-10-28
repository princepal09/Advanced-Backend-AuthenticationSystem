import { catchAsync } from "../../utils/common/helpers/CatchAsync.js";
import { sendResponse } from "../../utils/response/AppResponse.js";
import { Request, Response } from "express";

export class Admin {
  getUserController = catchAsync(async (req: Request, res: Response) => {
    sendResponse(res, 201, {
      success: true,
      message: "User fetched successfully",
    });
  });
}
