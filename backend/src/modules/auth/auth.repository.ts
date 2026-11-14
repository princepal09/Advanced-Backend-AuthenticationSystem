import type {
  AuthProvider,
  Session,
  User,
} from "../../../generated/prisma-client/client.js";
import { Prisma } from "../../../generated/prisma-client/client.js";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/common/error/AppError.js";
import { IAuthRepository } from "./auth.interface.js";
import {
  createSessionType,
  createUserType,
  findUserByIdType,
  AuthAccountWithUser,
  updateSessionType,
  UserPermissionsType,
} from "./auth.types.js";

export class AuthRepository implements IAuthRepository {
  async findUserByEmail(email: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });
    return user;
  }

  async findUserById(userId: string): Promise<findUserByIdType | null> {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        email: true,
        createdAt: true,
      },
    });

    return user;
  }

  async findSessionById(sessionId: string): Promise<Session | null> {
    const session = await prisma.session.findUnique({
      where: {
        id: sessionId,
      },
    });

    return session;
  }

  async createUser(data: createUserType): Promise<User> {
    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash: data.hashedPassword,
      },
    });
    return user;
  }

  async createSession(data: createSessionType): Promise<Session> {
    const session = await prisma.session.create({
      data,
    });
    return session;
  }

  async revokeAllSessions(userId: string): Promise<void> {
    await prisma.session.updateMany({
      where: {
        userId,
      },
      data: {
        isRevoked: true,
      },
    });
  }

  async updateSession(
    sessionId: string,
    data: updateSessionType,
  ): Promise<Session> {
    const updatedSession = await prisma.session.update({
      where: {
        id: sessionId,
      },
      data: {
        refreshTokenHash: data.hashedNewRefreshToken,
        expiresAt: data.newRefreshTokenExpiresAt,
      },
    });

    return updatedSession;
  }

  async findSessionByUserIdAndSessionId(
    userId: string,
    sessionId: string,
  ): Promise<Session | null> {
    const session = await prisma.session.findFirst({
      where: {
        id: sessionId,
        userId,
      },
    });

    return session;
  }

  async deleteSession(sessionId: string): Promise<void> {
    await prisma.session.update({
      where: {
        id: sessionId,
      },
      data: {
        isDeleted: true,
      },
    });
  }

  async deleteUserAllSessions(userId: string): Promise<void> {
    await prisma.session.updateMany({
      where: {
        userId,
      },
      data: {
        isDeleted: true,
      },
    });
  }

  async getUserPermissions(
    userId: string,
  ): Promise<UserPermissionsType | null> {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        email: true,
        userRoles: {
          select: {
            role: {
              select: {
                id: true,
                name: true,

                rolePermissions: {
                  select: {
                    permission: {
                      select: {
                        id: true,
                        name: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    return user;
  }

  async findAuthAccount(
    provider: AuthProvider,
    providerAccountId: string,
  ): Promise<AuthAccountWithUser | null> {
    return prisma.authAccount.findUnique({
      where: {
        provider_providerAccountId: {
          provider,
          providerAccountId,
        },
      },
      include: {
        user: true,
      },
    });
  }

  async createGoogleUser(
    email: string,
    providerAccountId: string,
  ): Promise<User> {
    try {
      return await prisma.user.create({
        data: {
          email,
          provider: "GOOGLE",
          isEmailVerified: true,
          authAccounts: { create: { provider: "GOOGLE", providerAccountId } },
        },
      });
    } catch (error) {
      if (
        !(error instanceof Prisma.PrismaClientKnownRequestError) ||
        error.code !== "P2002"
      ) {
        throw error;
      }

      const account = await this.findAuthAccount("GOOGLE", providerAccountId);
      if (account) {
        return account.user;
      }

      throw new AppError(
        "An account already exists for this email. Use its original sign-in method.",
        409,
      );
    }
  }
}
