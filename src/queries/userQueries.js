export const FIND_ALL = `
  SELECT u.id, u.first_name, u.last_name, u.email, u.is_active, u.created_at, r.name as role
  FROM users u
  LEFT JOIN user_roles ur ON ur.user_id = u.id
  LEFT JOIN roles r ON r.id = ur.role_id
  ORDER BY u.id DESC
`;

export const FIND_PAGINATED = `
  SELECT u.id, u.first_name, u.last_name, u.email, u.is_active, u.created_at, r.name as role
  FROM users u
  LEFT JOIN user_roles ur ON ur.user_id = u.id
  LEFT JOIN roles r ON r.id = ur.role_id
  ORDER BY u.id DESC
  LIMIT ? OFFSET ?
`;

export const COUNT_ALL = `
  SELECT COUNT(*) as count FROM users
`;

export const FIND_BY_ID = `
  SELECT * FROM users WHERE id = ?
`;

export const FIND_BY_EMAIL = `
  SELECT * FROM users WHERE email = ? AND is_active = 1
`;

export const FIND_BY_EMAIL_ANY = `
  SELECT * FROM users WHERE email = ?
`;

export const CREATE_USER = `
  INSERT INTO users (first_name, last_name, email) VALUES (?, ?, ?)
`;

export const DELETE_USER = `
  DELETE FROM users WHERE id = ?
`;

export const ASSIGN_ROLE = `
  INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)
`;

export const CLEAR_ROLES = `
  DELETE FROM user_roles WHERE user_id = ?
`;

export const FIND_USER_ROLE = `
  SELECT r.name, r.id FROM roles r 
  JOIN user_roles ur ON ur.role_id = r.id 
  WHERE ur.user_id = ?
`;

export const RESOLVE_PERMISSIONS = `
  SELECT DISTINCT p.code FROM permissions p
  JOIN role_permissions rp ON rp.permission_id = p.id
  WHERE rp.role_id = ?
`;
