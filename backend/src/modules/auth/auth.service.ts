import { hashPassword } from "../../utils/auth/password.js";
import { AppError } from "../../utils/common/error/AppError.js";
import { IAuthRepository } from "./auth.interface.js";
import { sanitizedUserResponse } from "./auth.response.js";

export class AuthService {
  constructor(private authRepo: IAuthRepository) {}

  async registerUser(data: { email: string; password: string }) {
    const existingUser = await this.authRepo.findUserByEmail(data.email);

    if (existingUser) {
      throw new AppError("User with this email already exists", 400);
    }

    const hashedPassword = await hashPassword(data.password);

    const createdUser = await this.authRepo.createUser({
      email: data.email,
      hashedPassword,
    });

    return sanitizedUserResponse(createdUser) ;
  }

  async loginUser(data: { email: string; password: string }) {
    const existingUser = await this.authRepo.findUserByEmail(data.email);
    if (!existingUser || existingUser.passwordHash) {
      throw new AppError("Invalid Credentials", 401);
    }
  }
}
