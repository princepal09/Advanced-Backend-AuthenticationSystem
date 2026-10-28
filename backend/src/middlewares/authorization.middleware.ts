import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/common/error/AppError.js";
import { prisma } from "../lib/prisma.js";

export const authorizePermissions =
  (...requiredPermissions: string[]) =>
  async (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return next(new AppError("Unauthorized", 401));
      }

      const user = await prisma.user.findUnique({
        where: {
          id: req.user.userId,
        },

        include: {
          userRoles: {
            include: {
              role: {
                include: {
                  rolePermissions: {
                    include: {
                      permission: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!user) {
        return next(new AppError("User not found", 404));
      }

      //extract all permissions

      const permissions = user.userRoles.flatMap((userRole) =>
        userRole.role.rolePermissions.map(
          (rolePermission) => rolePermission.permission.name,
        ),
      );

      // remove duplicates

      const uniquePermissions = [...new Set(permissions)];

      //check required permissions

      const hasPermissions = requiredPermissions.every((permission) =>
        uniquePermissions.includes(permission),
      );

      if (!hasPermissions) {
        return next(new AppError("Forbidden", 403));
      }

      next();
    } catch (error) {
      return next(error);
    }
  };
