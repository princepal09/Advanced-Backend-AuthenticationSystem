import { randomBytes } from "node:crypto";
import type { CookieOptions, Response } from "express";
import { env } from "../../config/env.config.js";

export const OAUTH_STATE_COOKIE_NAME = "oauth_state";

const cookieOptions: CookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/api/v1/oauth/google/callback",
};

export const generateOAuthState = () => randomBytes(32).toString("hex");

export const setOAuthStateCookie = (
  res: Response,
  state: string,
  codeVerifier: string,
) => {
  res.cookie(OAUTH_STATE_COOKIE_NAME, { state, codeVerifier }, {
    ...cookieOptions,
    signed: true,
    maxAge: 10 * 60 * 1000,
  });
};

export const clearOAuthStateCookie = (res: Response) => {
  res.clearCookie(OAUTH_STATE_COOKIE_NAME, cookieOptions);
};
