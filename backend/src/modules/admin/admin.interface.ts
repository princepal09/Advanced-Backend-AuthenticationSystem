import { User } from "../../../generated/prisma-client/client.js";

export interface IAdminRepository{
    getAllUsers() : Promise<User[]>

}