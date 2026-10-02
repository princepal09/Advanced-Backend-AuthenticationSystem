import crypto from "crypto";
import { env } from "../../config/env.config.js";
import ms from "ms";
export const hashRefreshToken = (refreshToken) => {
    return crypto.createHash("sha256").update(refreshToken).digest("hex");
};
export const generateSessionId = () => {
    return crypto.randomUUID();
};
export const setCookies = (res, refreshToken) => {
    const refreshTokenMaxAge = ms(env.REFRESH_TOKEN_EXPIRES_IN);
    if (typeof refreshTokenMaxAge !== "number") {
        throw new Error("Invalid refresh token expiry configuration");
    }
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true, // blocks document.cookie from accessing cookie
        secure: env.NODE_ENV === "production", // if true it is only used for HTTPs
        sameSite: "lax",
        maxAge: refreshTokenMaxAge,
        // path: "/api/v1/auth/refresh-token", // pass the refresh token path here
    });
};
export const clearCookies = (res) => {
    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: "lax",
        // path: "/api/v1/auth/refresh-token",
    });
};
