import { RoleService } from "../services/roleService.js";

// Fetch list of roless
export const getRoles = async (req, res) => {
  try {
    const roles = await RoleService.getRoles();
    res.json(roles);
  } catch (error) {
    console.error("[ROLE CONTROLLER] getRoles error:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Fetch list of all permissions in system
export const getPermissions = async (req, res) => {
  try {
    const permissions = await RoleService.getPermissions();
    res.json(permissions);
  } catch (error) {
    console.error("[ROLE CONTROLLER] getPermissions error:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Assign a new role to a user profile
export const assignRole = async (req, res) => {
  const { userId, roleName } = req.body;

  if (!userId || !roleName) {
    return res.status(400).json({ error: "Missing userId or roleName" });
  }

  try {
    const result = await RoleService.assignRole(userId, roleName);
    res.json(result);
  } catch (error) {
    console.error("[ROLE CONTROLLER] assignRole error:", error.message || error);
    const status = error.status || 500;
    const message = error.message || "Internal server error";
    res.status(status).json({ error: message });
  }
};

// Update permission mapping for a specific role
export const updateRolePermissions = async (req, res) => {
  const { roleId, permissionIds } = req.body;

  if (!roleId || !Array.isArray(permissionIds)) {
    return res.status(400).json({ error: "Invalid roleId or permissionIds array" });
  }

  try {
    const result = await RoleService.updateRolePermissions(roleId, permissionIds);
    res.json(result);
  } catch (error) {
    console.error("[ROLE CONTROLLER] updateRolePermissions error:", error.message || error);
    const status = error.status || 500;
    const message = error.message || "Internal server error";
    res.status(status).json({ error: message });
  }
};
