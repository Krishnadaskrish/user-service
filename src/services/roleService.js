import { RoleRepository } from "../repositories/roleRepository.js";
import { UserRepository } from "../repositories/userRepository.js";

export class RoleService {
  static async getRoles() {
    const roles = await RoleRepository.findAllRoles();
    const rolesWithPermissions = [];

    for (const role of roles) {
      const perms = await RoleRepository.getRolePermissions(role.id);
      rolesWithPermissions.push({
        ...role,
        permissions: perms,
      });
    }

    return rolesWithPermissions;
  }

  static async getPermissions() {
    return RoleRepository.findAllPermissions();
  }

  static async assignRole(userId, roleName) {
    const user = await UserRepository.findById(userId);
    if (!user) throw { status: 404, message: "User profile not found" };

    if (user.email === "admin@gamil.com" && roleName !== "Admin") {
      throw { status: 403, message: "Forbidden: Default Admin account must keep the Admin role." };
    }

    const role = await RoleRepository.findRoleByName(roleName);
    if (!role) throw { status: 404, message: `Role ${roleName} not found` };

    await UserRepository.clearUserRoles(userId);
    await UserRepository.assignRole(userId, role.id);

    return { message: `Role ${roleName} assigned successfully to user ${user.email}` };
  }

  static async updateRolePermissions(roleId, permissionIds) {
    const role = await RoleRepository.findRoleById(roleId);
    if (!role) throw { status: 404, message: "Role not found" };

    if (role.name === "Admin") {
      const criticalPerms = await RoleRepository.findCriticalPermissions();
      const criticalIds = criticalPerms.map((p) => p.id);
      
      const missingCritical = criticalIds.filter((id) => !permissionIds.includes(id));
      if (missingCritical.length > 0) {
        throw {
          status: 403,
          message: "Forbidden: Admin role must retain users:read and roles:assign permissions to prevent lockouts.",
        };
      }
    }

    await RoleRepository.updateRolePermissions(roleId, permissionIds);
    return { message: "Role permission mapping updated successfully" };
  }
}
