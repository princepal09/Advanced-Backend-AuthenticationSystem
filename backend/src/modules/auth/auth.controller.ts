
import { Request, Response } from "express";
import { catchAsync } from "../../utils/common/helpers/CatchAsync.js";
import { AuthService } from "./auth.service.js";
import { sendResponse } from "../../utils/response/AppResponse.js";

export class AuthController {
  constructor(private authService: AuthService) {}

  registerUserController = catchAsync(
    async (req: Request, res: Response) => {
      const { email, password } = req.body;

      const result = await this.authService.registerUser({
        email,
        password,
      });

      sendResponse(res, 201, {
        success: true,
        message: "User registered successfully",
        data: result,
      });
    },
  );

  loginUserController = catchAsync(
    async (req: Request, res: Response) => {
      const { email, password } = req.body;

      const result = await this.authService.loginUser({
        email,
        password,
      });

      sendResponse(res, 200, {
        success: true,
        message: "User logged in successfully",
        data: result,
      });
    },
  );
}

