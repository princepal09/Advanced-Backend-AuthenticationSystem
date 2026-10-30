import type { Session, User } from "../../../generated/prisma-client/client.js";
import {
  createSessionType,
  createUserType,
  findUserByIdType,
  updateSessionType,
  UserPermissionsType,
} from "./auth.types.js";

export interface IAuthRepository {
  findUserByEmail(email: string): Promise<User | null>;
  createUser(data: createUserType): Promise<User>;
  findUserById(userId: string): Promise<findUserByIdType | null>;
  createSession(data: createSessionType): Promise<Session>;
  findSessionById(sessionId: string): Promise<Session | null>;
  revokeAllSessions(userId: string): Promise<void>;
  updateSession(sessionId: string, data: updateSessionType): Promise<Session>;
  findSessionByUserIdAndSessionId(
    userId: string,
    sessionId: string,
  ): Promise<Session | null>;
  deleteSession(sessionId: string): Promise<void>;
  deleteUserAllSessions(userId:string) : Promise<void>;
  getUserPermissions(userId:string):Promise<UserPermissionsType | null>
} 
