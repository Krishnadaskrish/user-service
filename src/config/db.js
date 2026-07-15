import sqlite3 from "sqlite3";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbDir = path.resolve(__dirname, "../../data");

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, "user_rbac.db");
const db = new sqlite3.Database(dbPath);

export const dbRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
};

export const dbGet = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

export const dbAll = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

export const initDb = async () => {
  try {
    await dbRun(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        first_name TEXT NOT NULL,
        last_name TEXT,
        email TEXT UNIQUE NOT NULL,
        is_active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await dbRun(`
      CREATE TABLE IF NOT EXISTS roles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        description TEXT
      )
    `);

    await dbRun(`
      CREATE TABLE IF NOT EXISTS permissions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        code TEXT UNIQUE NOT NULL,
        description TEXT
      )
    `);

    await dbRun(`
      CREATE TABLE IF NOT EXISTS user_roles (
        user_id INTEGER NOT NULL,
        role_id INTEGER NOT NULL,
        PRIMARY KEY (user_id, role_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
      )
    `);

    await dbRun(`
      CREATE TABLE IF NOT EXISTS role_permissions (
        role_id INTEGER NOT NULL,
        permission_id INTEGER NOT NULL,
        PRIMARY KEY (role_id, permission_id),
        FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
        FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
      )
    `);

    console.log("[USER-DB] Database tables verified/created.");

    // 2. Seed permissions
    const permissionsSeed = [
      { code: "users:create", desc: "Create new user profiles" },
      { code: "users:read", desc: "Read and list user profiles" },
      { code: "users:delete", desc: "Delete user profiles" },
      { code: "roles:assign", desc: "Assign roles to users and permissions to roles" },
      { code: "roles:read", desc: "Read roles and permissions details" },
    ];

    for (const p of permissionsSeed) {
      const exists = await dbGet("SELECT id FROM permissions WHERE code = ?", [p.code]);
      if (!exists) {
        await dbRun("INSERT INTO permissions (code, description) VALUES (?, ?)", [p.code, p.desc]);
      }
    }
    console.log("[USER-DB] Permissions seeded.");

    // 3. Seed roles
    const rolesSeed = [
      { name: "Admin", desc: "Full administrative access to users and RBAC setup" },
      { name: "User", desc: "Standard employee user with read-only access to profiles" },
    ];

    for (const r of rolesSeed) {
      const exists = await dbGet("SELECT id FROM roles WHERE name = ?", [r.name]);
      if (!exists) {
        await dbRun("INSERT INTO roles (name, description) VALUES (?, ?)", [r.name, r.desc]);
      }
    }
    console.log("[USER-DB] Roles seeded.");

    // 4. Map permissions to roles
    const adminRole = await dbGet("SELECT id FROM roles WHERE name = 'Admin'");
    const userRole = await dbGet("SELECT id FROM roles WHERE name = 'User'");

    const allPermissions = await dbAll("SELECT id FROM permissions");
    const readPermission = await dbGet("SELECT id FROM permissions WHERE code = 'users:read'");

    // Admin maps to all permissions
    for (const p of allPermissions) {
      const exists = await dbGet(
        "SELECT role_id FROM role_permissions WHERE role_id = ? AND permission_id = ?",
        [adminRole.id, p.id]
      );
      if (!exists) {
        await dbRun("INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)", [
          adminRole.id,
          p.id,
        ]);
      }
    }

    // User maps to users:read permission
    if (readPermission) {
      const exists = await dbGet(
        "SELECT role_id FROM role_permissions WHERE role_id = ? AND permission_id = ?",
        [userRole.id, readPermission.id]
      );
      if (!exists) {
        await dbRun("INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)", [
          userRole.id,
          readPermission.id,
        ]);
      }
    }
    console.log("[USER-DB] Role-Permission maps verified.");

    // 5. Seed default Admin user profile
    const defaultAdminEmail = "admin@gmail.com";
    const existingUser = await dbGet("SELECT id FROM users WHERE email = ?", [defaultAdminEmail]);
    if (!existingUser) {
      const userRes = await dbRun(
        "INSERT INTO users (first_name, last_name, email) VALUES (?, ?, ?)",
        ["Admin", "User", defaultAdminEmail]
      );
      const userId = userRes.id;

      // Assign Admin role to default admin user
      await dbRun("INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)", [userId, adminRole.id]);
      console.log(`[USER-DB] Default admin user profile created for ${defaultAdminEmail}.`);
    } else {
      console.log("[USER-DB] User profiles already seeded.");
    }
  } catch (error) {
    console.error("[USER-DB] Initialization failed:", error.message);
  }
};

export default db;
