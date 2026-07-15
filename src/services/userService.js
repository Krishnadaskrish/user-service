import axios from "axios";
import { UserRepository } from "../repositories/userRepository.js";
import { RoleRepository } from "../repositories/roleRepository.js";

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || "http://localhost:5001";

export class UserService {
  static async getUsers(page, limit) {
    if (page && limit) {
      const offset = (page - 1) * limit;
      const [users, total] = await Promise.all([
        UserRepository.findPaginated(limit, offset),
        UserRepository.countAll(),
      ]);
      return {
        response: users,
        pagination: {
          page,
          limit,
          recordsTotal: total,
        },
      };
    }
    return UserRepository.findAll();
  }

  static async createUser(firstName, lastName, email, password, role) {
    const existing = await UserRepository.findByEmailAny(email);
    if (existing) throw { status: 400, message: "User already exists" };

    const roleRow = await RoleRepository.findRoleByName(role);
    if (!roleRow) throw { status: 400, message: `Invalid role specified: ${role}` };

    const userResult = await UserRepository.create(firstName, lastName, email);
    const userId = userResult.id;

    await UserRepository.assignRole(userId, roleRow.id);

    try {
      await axios.post(`${AUTH_SERVICE_URL}/auth/register`, {
        email,
        password,
      });
      return { id: userId, first_name: firstName, last_name: lastName, email, role };
    } catch (authError) {
      console.error("[USER SERVICE] Auth service registration failed, rolling back user profile.");
      await UserRepository.clearUserRoles(userId);
      await UserRepository.delete(userId);

      const status = authError.response?.status || 500;
      const errorMsg = authError.response?.data?.error || "Auth Service failed to register credentials";
      throw { status, message: errorMsg };
    }
  }

  static async deleteUser(id) {
    const user = await UserRepository.findById(id);
    if (!user) throw { status: 404, message: "User not found" };

    if (user.email === "admin@gamil.com.com") {
      throw { status: 403, message: "Forbidden: Default Admin account cannot be deleted." };
    }

    await UserRepository.delete(id);
    await UserRepository.clearUserRoles(id);

    try {
      await axios.delete(`${AUTH_SERVICE_URL}/auth/credentials/${user.email}`);
    } catch (authError) {
      console.warn(
        `[USER SERVICE] Failed to delete credentials for ${user.email} in Auth Service:`,
        authError.message
      );
      return {
        message: "User profile deleted, but auth credentials clean up delayed",
        warning: authError.message,
      };
    }

    return { message: "User and credentials deleted successfully" };
  }
}
