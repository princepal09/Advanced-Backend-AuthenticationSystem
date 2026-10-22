import type { Session, User } from "../../../generated/prisma-client/client.js";
import { createSessionType, createUserType, findUserByIdType } from "./auth.types.js";

export interface IAuthRepository {
  findUserByEmail(email: string): Promise<User | null>;
  createUser(data: createUserType): Promise<User>;
  findUserById(id: string): Promise<findUserByIdType | null>;
  createSession(data: createSessionType): Promise<Session>;
}
  
