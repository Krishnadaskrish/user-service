import { Router } from "express";
import { getUsers, createUser, deleteUser, getMePermissions } from "../controllers/userController.js";
import { authenticateJWT, requirePermission } from "../middlewares/auth.js";

const router = Router();

// Authenticated session state check
router.get("/me/permissions", authenticateJWT, getMePermissions);

// User Profile routes
router.get("/", authenticateJWT, requirePermission("users:read"), getUsers);
router.post("/", authenticateJWT, requirePermission("users:create"), createUser);
router.delete("/:id", authenticateJWT, requirePermission("users:delete"), deleteUser);

export default router;
