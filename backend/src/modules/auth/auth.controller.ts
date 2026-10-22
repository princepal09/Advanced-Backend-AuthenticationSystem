import { Request, Response } from "express";
import { catchAsync } from "../../utils/common/helpers/CatchAsync.js";
import { AuthService } from "./auth.service.js";
import { sendResponse } from "../../utils/response/AppResponse.js";
import { setCookies } from "../../utils/auth/auth.helper.js";

export class AuthController {
  constructor(private authService: AuthService) {}

  registerUserController = catchAsync(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const ipAddress = req.ip || ("unknown" as string);
    const userAgent = req.headers["user-agent"] || ("unknown" as string);

    const result = await this.authService.registerUser({
      email,
      password,
      userAgent,
      ipAddress,
    });

    setCookies(res, result.refreshToken);

    sendResponse(res, 201, {
      success: true,
      message: "User registered successfully",
      data: {
        user: result.user,
        accessToken: result.accessToken,
      },
    });
  });

  loginUserController = catchAsync(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const ipAddress = req.ip || ("unknown" as string);
    const userAgent = req.headers["user-agent"] || ("unknown" as string);

    const result = await this.authService.loginUser({
      email,
      password,
      userAgent,
      ipAddress,
    });

    setCookies(res, result.refreshToken);

    sendResponse(res, 200, {
      success: true,
      message: "User logged in successfully",
      data: {
        user: result.user,
        accessToken: result.accessToken,
      },
    });
  });
}
