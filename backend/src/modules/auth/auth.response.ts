import type { User } from "../../../generated/prisma-client/client.js";

export const sanitizedUserResponse = (user: User) => {
  return {
    id: user.id,
    email: user.email,
    isEmailVerified: user.isEmailVerified,
    createdAt: user.createdAt,
    provider:user.provider,
    updatedAt: user.updatedAt,
  };
};
