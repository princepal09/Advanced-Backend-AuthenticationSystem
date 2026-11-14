import type { Request, Response } from "express";
import { setCookies } from "../../../utils/auth/auth.helper.js";
import {
  clearOAuthStateCookie,
  OAUTH_STATE_COOKIE_NAME,
  setOAuthStateCookie,
} from "../../../utils/auth/oauth.helper.js";
import { AppError } from "../../../utils/common/error/AppError.js";
import { catchAsync } from "../../../utils/common/helpers/CatchAsync.js";
import { sendResponse } from "../../../utils/response/AppResponse.js";
import { googleOAuthService } from "./oauth.container.js";

export const redirectToGoogleController = catchAsync(
  async (req: Request, res: Response) => {
    const { url, state, codeVerifier } = await googleOAuthService.generateGoogleAuthUrl();
    res.setHeader("Cache-Control", "no-store");
    setOAuthStateCookie(res, state, codeVerifier);

    if (req.accepts(["json", "html"]) === "html") {
      res.redirect(url);
      return;
    }

    sendResponse(res, 200, {
      success: true,
      message: "Google sign-in URL generated",
      data: { url, state },
    });
  },
);

export const googleCallBackController = catchAsync(
  async (req: Request, res: Response) => {
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("Referrer-Policy", "no-referrer");

    const { state, code, error } = req.query;
    const pending = req.signedCookies[OAUTH_STATE_COOKIE_NAME];
    if (
      typeof state !== "string" ||
      !state ||
      pending?.state !== state ||
      typeof pending.codeVerifier !== "string" ||
      !pending.codeVerifier
    ) {
      throw new AppError("Invalid Google sign-in state", 401);
    }
    clearOAuthStateCookie(res);

    if (error !== undefined) {
      throw new AppError("Google sign-in was declined or could not be completed", 400);
    }
    if (typeof code !== "string" || !code) {
      throw new AppError("Google authorization code is missing or invalid", 400);
    }

    const result = await googleOAuthService.handleGoogleCallback(code, pending.codeVerifier, {
      userAgent: req.get("user-agent") ?? "unknown",
      ipAddress: req.ip ?? "unknown",
    });
    setCookies(res, result.refreshToken);
    sendResponse(res, 200, {
      success: true,
      message: "Signed in with Google",
      data: { user: result.user, accessToken: result.accessToken },
    });
  },
);
