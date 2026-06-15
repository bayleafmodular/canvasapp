const PERMISSIONS = [
  'dashboard.show',
  'dashboard.create',
  'dashboard.edit',
  'staff.show',
  'staff.create',
  'staff.edit',
  'users.show',
  'users.create',
  'users.edit',
  'pricing.edit',
];

const adminPermissions = PERMISSIONS.reduce((acc, permission) => {
  acc[permission] = true;
  return acc;
}, {});

const normalizePermissions = (permissions = {}) =>
  PERMISSIONS.reduce((acc, permission) => {
    acc[permission] = Boolean(permissions[permission]);
    return acc;
  }, {});

module.exports = {
  PERMISSIONS,
  adminPermissions,
  normalizePermissions,
};
