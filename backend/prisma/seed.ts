import { prisma } from "../src/lib/prisma.js";
import { Permissions } from "../src/constants/permissions";

async function main() {
  const permissions = [
    Permissions.MANAGE_USERS,
    Permissions.DELETE_POSTS,
    Permissions.VIEW_ANALYTICS,
    Permissions.MANAGE_ROLES,
  ];

  for (const permission of permissions) {
    await prisma.permission.upsert({
      where: {
        name: permission,
      },
      update: {},

      create: {
        name: permission,
      },
    });
  }

  // Admin Role

  const adminRole = await prisma.role.upsert({
    where: {
      name: "ADMIN",
    },
    update: {},
    create: {
      name: "ADMIN",
    },
  });

  // fetch permissions

  const dbPermissions = await prisma.permission.findMany();

  // Assign permissions to ADMIN

  for (const permission of dbPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: adminRole.id,
          permissionId: permission.id,
        },
      },

      update: {},

      create: {
        roleId: adminRole.id,
        permissionId: permission.id,
      },
    });
  }

  console.log("Seed completed successfully...");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
