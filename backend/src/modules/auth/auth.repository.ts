import type { Session, User } from "../../../generated/prisma-client/client.js";
import { prisma } from "../../lib/prisma.js";
import { IAuthRepository } from "./auth.interface.js";
import {
  createSessionType,
  createUserType,
  findUserByIdType,
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

  async getUserPermissions(userId: string): Promise<UserPermissionsType | null> {
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
}
