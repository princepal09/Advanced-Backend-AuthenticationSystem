import { User } from "../../../generated/prisma-client/client.js";
import { prisma } from "../../lib/prisma.js";
import { IAdminRepository } from "./admin.interface.js";

export class AdminRepository implements IAdminRepository {
  async getAllUsers(): Promise<User[]> {
    const users = await prisma.user.findMany();
    return users;
  }
}
