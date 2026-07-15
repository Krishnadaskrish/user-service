import jwt from "jsonwebtoken";
import { UserRepository } from "../repositories/userRepository.js";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-super-secret-key-999";

export const authenticateJWT = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await UserRepository.findByEmail(decoded.email);

    if (!user) {
      return res.status(403).json({ error: "Access forbidden. User profile not active or not found." });
    }

    // Fetch user's assigned role from Repository
    const roleRow = await UserRepository.findUserRole(user.id);
    const role = roleRow ? roleRow.name : "None";
    const roleId = roleRow ? roleRow.id : null;

    // Fetch user's resolved permissions from Repository
    let permissions = [];
    if (roleId) {
      permissions = await UserRepository.resolveUserPermissions(roleId);
    }

    // Attach profile, role, and permissions details to the request object
    req.user = {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role,
      roleId,
      permissions,
    };

    next();
  } catch (error) {
    console.error("[AUTH MIDDLEWARE] Token validation error:", error.message);
    return res.status(403).json({ error: "Invalid or expired token." });
  }
};

export const requirePermission = (permissionCode) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!req.user.permissions.includes(permissionCode)) {
      return res.status(403).json({
        error: "Forbidden",
        message: `Insufficient permissions. Required: ${permissionCode}`,
      });
    }

    next();
  };
};
