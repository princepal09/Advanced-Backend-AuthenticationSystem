import ms from "ms";
import {
  generateSessionId,
  hashRefreshToken,
} from "../../utils/auth/auth.helper.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../../utils/auth/jwt.js";
import { comparePassword, hashPassword } from "../../utils/auth/password.js";
import { AppError } from "../../utils/common/error/AppError.js";
import { IAuthRepository } from "./auth.interface.js";
import { sanitizedUserResponse } from "./auth.response.js";
import { env } from "../../config/env.config.js";
import { userType } from "./auth.types.js";

export class AuthService {
  constructor(private authRepo: IAuthRepository) {}

  async registerUser(data: {
    email: string;
    password: string;
    userAgent: string;
    ipAddress: string;
  }) {
    const existingUser = await this.authRepo.findUserByEmail(data.email);

    if (existingUser) {
      throw new AppError("User with this email already exists", 400);
    }

    const hashedPassword = await hashPassword(data.password);

    const createdUser = await this.authRepo.createUser({
      email: data.email,
      hashedPassword,
    });

    const result = await this.loginUser({
      email: data.email,
      password: data.password,
      userAgent: data.userAgent,
      ipAddress: data.ipAddress,
    });

    return result;
  }

  async loginUser(data: {
    email: string;
    password: string;
    userAgent: string;
    ipAddress: string;
  }) {
    const existingUser = await this.authRepo.findUserByEmail(data.email);
    if (!existingUser || !existingUser.passwordHash) {
      throw new AppError("Invalid Credentials", 401);
    }
    const isPasswordCorrect = await comparePassword(
      data.password,
      existingUser.passwordHash,
    );

    if (!isPasswordCorrect) {
      throw new AppError("Invalid Credentials", 401);
    }

    const sessionId = generateSessionId();

    const accessToken = signAccessToken({
      sub: existingUser.id,
      sessionId,
    });
    const refreshToken = signRefreshToken({
      sub: existingUser.id,
      sessionId,
    });

    const hashedRefreshToken = hashRefreshToken(refreshToken);

    const expiresAt = new Date(
      Date.now() + ms(env.REFRESH_TOKEN_EXPIRES_IN as ms.StringValue),
    );

    const newSession = await this.authRepo.createSession({
      id: sessionId,
      userId: existingUser.id,
      refreshTokenHash: hashedRefreshToken,
      userAgent: data.userAgent,
      ipAddress: data.ipAddress,
      expiresAt,
    });

    return {
      user: sanitizedUserResponse(existingUser),
      accessToken,
      refreshToken,
    };
  }

  async getLoggedInUser(data: userType) {
    const user = await this.authRepo.findUserById(data.userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    return user;
  }

  async refreshSession(refreshToken: string) {
    const payload = verifyRefreshToken(refreshToken);
    console.log(payload)

    const session = await this.authRepo.findSessionById(payload.sessionId);

    if (!session) {
      throw new AppError("Session not found", 401);
    }

    if (session?.isRevoked) {
      throw new AppError("Session has been revoked", 401);
    }

    if (session?.expiresAt < new Date()) {
      throw new AppError("Session has expired", 401);
    }

    const incomingRefreshTokenHash = hashRefreshToken(refreshToken);

    const isIncomingRefreshTokenValid =
      incomingRefreshTokenHash === session.refreshTokenHash;

    if (!isIncomingRefreshTokenValid) {
      await this.authRepo.revokeAllSessions(session.userId);
      throw new AppError("Refresh Token reuse detected", 401);
    }

    const newAccessToken = signAccessToken({
      sub: session.userId,
      sessionId: session.id,
    });

    const newRefreshToken = signRefreshToken({
      sub: session.userId,
      sessionId: session.id,
    });

    const hashedNewRefreshToken = hashRefreshToken(newRefreshToken);

    const newRefreshTokenExpiresIn = ms(
      env.REFRESH_TOKEN_EXPIRES_IN as ms.StringValue,
    );

    if (typeof newRefreshTokenExpiresIn !== "number") {
      throw new Error("Invalid Refresh token expiry configuration");
    }

    const newRefreshTokenExpiresAt = new Date(
      Date.now() + newRefreshTokenExpiresIn,
    );

    const updatedSession = await this.authRepo.updateSession(session.id, {
      hashedNewRefreshToken,
      newRefreshTokenExpiresAt,
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }
}
