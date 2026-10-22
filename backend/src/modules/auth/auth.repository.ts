import type { Session, User } from "../../../generated/prisma-client/client.js";
import { prisma } from "../../lib/prisma.js";
import { IAuthRepository } from "./auth.interface.js";
import { createSessionType, createUserType, findUserByIdType } from "./auth.types.js";

export class AuthRepository implements IAuthRepository {
  async findUserByEmail(email: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });
    return user;
  }

  async findUserById(id: string): Promise<findUserByIdType | null> {
    const user = await prisma.user.findUnique({
      where: {
        id,
      },
      select : {
        id:true,
        email:true,
        createdAt:true
      }
    });

    return user;
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
}
