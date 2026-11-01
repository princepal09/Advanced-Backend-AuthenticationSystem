export const Permissions = {
  MANAGE_USERS: "manage_users",
  DELETE_POSTS: "delete_posts",
  VIEW_ANALYTICS: "view_anaytlics",
  MANAGE_ROLES: "manage_roles",
};

export type PermissionType = (typeof Permissions)[keyof typeof Permissions];

export const PermissionValues = Object.values(Permissions);
