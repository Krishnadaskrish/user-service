import { Router } from "express";
import { getRoles, assignRole, updateRolePermissions } from "../controllers/roleController.js";
import { authenticateJWT, requirePermission } from "../middlewares/auth.js";

const router = Router();

router.get("/", authenticateJWT, requirePermission("roles:read"), getRoles);
router.post("/assign", authenticateJWT, requirePermission("roles:assign"), assignRole);
router.post("/permissions", authenticateJWT, requirePermission("roles:assign"), updateRolePermissions);

export default router;
