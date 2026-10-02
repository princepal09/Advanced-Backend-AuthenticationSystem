import bcrypt from "bcrypt";
import { env } from "../../config/env.config";
const saltRounds = Number(env.SALT_ROUNDS);
export const hashPassword = async (password) => {
    return await bcrypt.hash(password, saltRounds);
};
export const comparePassword = async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
};
