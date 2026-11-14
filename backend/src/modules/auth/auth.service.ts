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
import type { User } from "../../../generated/prisma-client/client.js";
import jwt from "jsonwebtoken";

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

    const user = await this.authRepo.createUser({
      email: data.email,
      hashedPassword,
    });

    return this.createUserSession(user, data);
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

    return this.createUserSession(existingUser, data);
  }

  async createUserSession(
    user: User,
    { userAgent, ipAddress }: { userAgent: string; ipAddress: string },
  ) {
    const sessionId = generateSessionId();

    const accessToken = signAccessToken({
      sub: user.id,
      sessionId,
    });
    const refreshToken = signRefreshToken({
      sub: user.id,
      sessionId,
    });

    const hashedRefreshToken = hashRefreshToken(refreshToken);

    const expiresAt = new Date(
      Date.now() + ms(env.REFRESH_TOKEN_EXPIRES_IN as ms.StringValue),
    );

    await this.authRepo.createSession({
      id: sessionId,
      userId: user.id,
      refreshTokenHash: hashedRefreshToken,
      userAgent,
      ipAddress,
      expiresAt,
    });

    return {
      user: sanitizedUserResponse(user),
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
    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new AppError("Invalid or expired refresh token", 401);
      }
      throw error;
    }

    const session = await this.authRepo.findSessionById(payload.sessionId);

    if (!session || session.userId !== payload.sub || session.isDeleted) {
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

    await this.authRepo.updateSession(session.id, {
      hashedNewRefreshToken,
      newRefreshTokenExpiresAt,
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(userId: string, sessionId: string) {
    const session = await this.authRepo.findSessionByUserIdAndSessionId(
      userId,
      sessionId,
    );

    if (!session) {
      throw new AppError(
        "Session not found or you are not authorized to perform this action",
        401,
      );
    }

    await this.authRepo.deleteSession(session.id);
  }

  async logoutUserFromAllSession(userId: string) {
    await this.authRepo.deleteUserAllSessions(userId);
  }

  async getUserPermissions(userId: string) {
    const user = await this.authRepo.getUserPermissions(userId);

    if (!user) {
      throw new AppError("User not found", 404);
    }
    const roles = user.userRoles.map((userRole) => userRole.role.name);
    const permissions = user.userRoles.flatMap((userRole) =>
      userRole.role.rolePermissions.map(
        (rolePermission) => rolePermission.permission.name,
      ),
    );

    const uniquePermissions = [...new Set(permissions)];

    return {
      user: {
        id: user.id,
        email: user.email,
      },

      roles,
      permissions: uniquePermissions,
    };
  }
}
