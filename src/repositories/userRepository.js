import { dbGet, dbRun, dbAll } from "../config/db.js";
import * as queries from "../queries/userQueries.js";

export class UserRepository {
  static async findAll() {
    return dbAll(queries.FIND_ALL);
  }

  static async findPaginated(limit, offset) {
    return dbAll(queries.FIND_PAGINATED, [limit, offset]);
  }

  static async countAll() {
    const row = await dbGet(queries.COUNT_ALL);
    return row ? row.count : 0;
  }

  static async findById(id) {
    return dbGet(queries.FIND_BY_ID, [id]);
  }

  static async findByEmail(email) {
    return dbGet(queries.FIND_BY_EMAIL, [email]);
  }

  static async findByEmailAny(email) {
    return dbGet(queries.FIND_BY_EMAIL_ANY, [email]);
  }

  static async create(firstName, lastName, email) {
    return dbRun(queries.CREATE_USER, [firstName, lastName, email]);
  }

  static async delete(id) {
    return dbRun(queries.DELETE_USER, [id]);
  }

  static async assignRole(userId, roleId) {
    return dbRun(queries.ASSIGN_ROLE, [userId, roleId]);
  }

  static async clearUserRoles(userId) {
    return dbRun(queries.CLEAR_ROLES, [userId]);
  }

  static async findUserRole(userId) {
    return dbGet(queries.FIND_USER_ROLE, [userId]);
  }

  static async resolveUserPermissions(roleId) {
    const rows = await dbAll(queries.RESOLVE_PERMISSIONS, [roleId]);
    return rows.map((r) => r.code);
  }
}
