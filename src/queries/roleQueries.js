export const FIND_ALL_ROLES = `
  SELECT * FROM roles
`;

export const FIND_ROLE_BY_NAME = `
  SELECT * FROM roles WHERE name = ?
`;

export const FIND_ROLE_BY_ID = `
  SELECT * FROM roles WHERE id = ?
`;

export const FIND_ALL_PERMISSIONS = `
  SELECT * FROM permissions
`;

export const FIND_CRITICAL_PERMISSIONS = `
  SELECT id, code FROM permissions WHERE code IN ('users:read', 'roles:assign')
`;

export const GET_ROLE_PERMISSIONS = `
  SELECT p.id, p.code, p.description 
  FROM permissions p
  JOIN role_permissions rp ON rp.permission_id = p.id
  WHERE rp.role_id = ?
`;

export const CLEAR_ROLE_PERMISSIONS = `
  DELETE FROM role_permissions WHERE role_id = ?
`;

export const ASSIGN_ROLE_PERMISSION = `
  INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)
`;
