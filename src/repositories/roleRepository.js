import { dbGet, dbRun, dbAll } from "../config/db.js";
import * as queries from "../queries/roleQueries.js";

export class RoleRepository {
  static async findAllRoles() {
    return dbAll(queries.FIND_ALL_ROLES);
  }

  static async findRoleByName(name) {
    return dbGet(queries.FIND_ROLE_BY_NAME, [name]);
  }

  static async findRoleById(id) {
    return dbGet(queries.FIND_ROLE_BY_ID, [id]);
  }

  static async findAllPermissions() {
    return dbAll(queries.FIND_ALL_PERMISSIONS);
  }

  static async findCriticalPermissions() {
    return dbAll(queries.FIND_CRITICAL_PERMISSIONS);
  }

  static async getRolePermissions(roleId) {
    return dbAll(queries.GET_ROLE_PERMISSIONS, [roleId]);
  }

  static async updateRolePermissions(roleId, permissionIds) {
    await dbRun(queries.CLEAR_ROLE_PERMISSIONS, [roleId]);
    for (const permId of permissionIds) {
      await dbRun(queries.ASSIGN_ROLE_PERMISSION, [roleId, permId]);
    }
  }
}
