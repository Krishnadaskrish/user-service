import express from "express";
import cors from "cors";
import { initDb } from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import roleRoutes from "./routes/roleRoutes.js";
import permissionRoutes from "./routes/permissionRoutes.js";

const app = express();
const PORT = process.env.PORT || 5002;

app.use(express.json());
app.use(cors());

// Diagnostic route
app.get("/health", (req, res) => {
  res.json({ service: "user-service", status: "up" });
});

// Mount modular routing endpoints
app.use("/users", userRoutes);
app.use("/roles", roleRoutes);
app.use("/permissions", permissionRoutes);

// Start server after database init
initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`[USER-SVC] User/RBAC Service running on port ${PORT}`);
  });
}).catch((err) => {
  console.error("[USER-SVC] Failed to initialize DB:", err.message);
  process.exit(1);
});
