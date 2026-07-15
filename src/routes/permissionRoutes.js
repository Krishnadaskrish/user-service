import { Router } from "express";
import { getPermissions } from "../controllers/roleController.js";
import { authenticateJWT, requirePermission } from "../middlewares/auth.js";

const router = Router();

router.get("/", authenticateJWT, requirePermission("roles:read"), getPermissions);

export default router;
