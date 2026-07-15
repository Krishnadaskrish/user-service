import { UserService } from "../services/userService.js";

// Get list of all users or paginated user profiles
export const getUsers = async (req, res) => {
  try {
    const page = req.query.page ? parseInt(req.query.page) : null;
    const limit = req.query.limit ? parseInt(req.query.limit) : null;

    const data = await UserService.getUsers(page, limit);
    res.json(data);
  } catch (error) {
    console.error("[USER CONTROLLER] getUsers error:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Create new user (calls business logic in Service)
export const createUser = async (req, res) => {
  const { first_name, last_name, email, password, role } = req.body;

  if (!first_name || !email || !password || !role) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const result = await UserService.createUser(first_name, last_name, email, password, role);
    res.status(201).json({
      message: "User created successfully",
      user: result,
    });
  } catch (error) {
    console.error("[USER CONTROLLER] createUser error:", error.message || error);
    const status = error.status || 500;
    const message = error.message || "Internal server error";
    res.status(status).json({ error: message });
  }
};

// Delete user (calls business logic in Service)
export const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await UserService.deleteUser(id);
    res.json(result);
  } catch (error) {
    console.error("[USER CONTROLLER] deleteUser error:", error.message || error);
    const status = error.status || 500;
    const message = error.message || "Internal server error";
    res.status(status).json({ error: message });
  }
};

// Return current user session, roles and resolved permissions
export const getMePermissions = async (req, res) => {
  res.json({
    user: req.user,
  });
};
