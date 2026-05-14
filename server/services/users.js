const supabase = require('../lib/supabase');
const { adminPermissions, normalizePermissions } = require('../config/permissions');

const USERS_TABLE = 'app_users';

const toPublicUser = (row) => {
  if (!row) return null;
  const permissions = row.role === 'admin'
    ? adminPermissions
    : normalizePermissions(row.permissions);

  return {
    _id: row.id,
    id: row.id,
    name: row.name,
    username: row.username,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone,
    profilePicUrl: row.profile_pic_url,
    role: row.role,
    permissions,
    isVerified: row.is_verified,
    twoFactorEnabled: row.two_factor_enabled,
    googleLinked: row.google_linked,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

const getConfiguredRole = (email) => {
  const normalized = email.toLowerCase();
  const adminEmails = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
  const staffEmails = (process.env.STAFF_EMAILS || '')
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);

  if (adminEmails.includes(normalized)) return 'admin';
  if (staffEmails.includes(normalized)) return 'staff';
  return 'user';
};

const findUserByEmail = async (email) => {
  const { data, error } = await supabase
    .from(USERS_TABLE)
    .select('*')
    .eq('email', email.toLowerCase())
    .maybeSingle();

  if (error) throw error;
  return data;
};

const findUserById = async (id) => {
  const { data, error } = await supabase
    .from(USERS_TABLE)
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data;
};

const createUser = async ({ name, email, passwordHash, otp, otpExpiry }) => {
  const { data, error } = await supabase
    .from(USERS_TABLE)
    .insert({
      name,
      full_name: name,
      email: email.toLowerCase(),
      password_hash: passwordHash,
      role: getConfiguredRole(email),
      permissions: {},
      otp,
      otp_expiry: otpExpiry.toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

const updatePendingUser = async (id, { name, passwordHash, otp, otpExpiry }) => {
  const { data, error } = await supabase
    .from(USERS_TABLE)
    .update({
      name,
      password_hash: passwordHash,
      otp,
      otp_expiry: otpExpiry.toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

const verifyUser = async (id) => {
  const { data, error } = await supabase
    .from(USERS_TABLE)
    .update({
      is_verified: true,
      otp: null,
      otp_expiry: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

const updateOtp = async (id, { otp, otpExpiry }) => {
  const { data, error } = await supabase
    .from(USERS_TABLE)
    .update({
      otp,
      otp_expiry: otpExpiry.toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

const updateLoginOtp = async (id, { otp, otpExpiry }) => {
  const { data, error } = await supabase
    .from(USERS_TABLE)
    .update({
      login_otp: otp,
      login_otp_expiry: otpExpiry.toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

const clearLoginOtp = async (id) => {
  const { data, error } = await supabase
    .from(USERS_TABLE)
    .update({
      login_otp: null,
      login_otp_expiry: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

const updateResetOtp = async (id, { otp, otpExpiry }) => {
  const { data, error } = await supabase
    .from(USERS_TABLE)
    .update({
      reset_otp: otp,
      reset_otp_expiry: otpExpiry.toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

const resetPasswordHash = async (id, passwordHash) => {
  const { data, error } = await supabase
    .from(USERS_TABLE)
    .update({
      password_hash: passwordHash,
      reset_otp: null,
      reset_otp_expiry: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

const upsertOAuthUser = async ({ name, email }) => {
  const normalizedEmail = email.toLowerCase();
  const existing = await findUserByEmail(normalizedEmail);

  if (existing) {
    const { data, error } = await supabase
      .from(USERS_TABLE)
      .update({
        name: existing.name || name,
        full_name: existing.full_name || name,
        is_verified: true,
        google_linked: true,
        otp: null,
        otp_expiry: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  const role = getConfiguredRole(normalizedEmail);
  const { data, error } = await supabase
    .from(USERS_TABLE)
    .insert({
      name,
      full_name: name,
      email: normalizedEmail,
      role,
      permissions: role === 'admin' ? adminPermissions : {},
      is_verified: true,
      google_linked: true,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

const listUsers = async () => {
  const { data, error } = await supabase
    .from(USERS_TABLE)
    .select('id,name,email,role,permissions,is_verified,created_at,updated_at')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data.map(toPublicUser);
};

const listRecentUsers = async (limit = 5) => {
  const { data, error } = await supabase
    .from(USERS_TABLE)
    .select('id,name,email,role,permissions,is_verified,created_at,updated_at')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data.map(toPublicUser);
};

const countUsers = async (role) => {
  let query = supabase.from(USERS_TABLE).select('id', { count: 'exact', head: true });
  if (role) query = query.eq('role', role);

  const { count, error } = await query;
  if (error) throw error;
  return count || 0;
};

const updateUserRole = async (id, role) => {
  const { data, error } = await supabase
    .from(USERS_TABLE)
    .update({ role, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('id,name,email,role,permissions,is_verified,created_at,updated_at')
    .maybeSingle();

  if (error) throw error;
  return toPublicUser(data);
};

const deleteUser = async (id) => {
  const existing = await findUserById(id);
  if (!existing) return null;

  const { error } = await supabase.from(USERS_TABLE).delete().eq('id', id);
  if (error) throw error;

  return existing;
};

const listStaff = async () => {
  const { data, error } = await supabase
    .from(USERS_TABLE)
    .select('id,name,email,role,permissions,is_verified,created_at,updated_at')
    .eq('role', 'staff')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data.map(toPublicUser);
};

const createStaff = async ({ name, email, passwordHash, permissions }) => {
  const { data, error } = await supabase
    .from(USERS_TABLE)
    .insert({
      name,
      email: email.toLowerCase(),
      password_hash: passwordHash,
      role: 'staff',
      permissions: normalizePermissions(permissions),
      is_verified: true,
    })
    .select('id,name,email,role,permissions,is_verified,created_at,updated_at')
    .single();

  if (error) throw error;
  return toPublicUser(data);
};

const createManagedUser = async ({ name, email, passwordHash, role = 'user' }) => {
  const { data, error } = await supabase
    .from(USERS_TABLE)
    .insert({
      name,
      email: email.toLowerCase(),
      password_hash: passwordHash,
      role,
      permissions: {},
      is_verified: true,
    })
    .select('id,name,email,role,permissions,is_verified,created_at,updated_at')
    .single();

  if (error) throw error;
  return toPublicUser(data);
};

const updateStaff = async (id, { name, email, permissions }) => {
  const update = {
    permissions: normalizePermissions(permissions),
    updated_at: new Date().toISOString(),
  };

  if (name) update.name = name;
  if (email) update.email = email.toLowerCase();

  const { data, error } = await supabase
    .from(USERS_TABLE)
    .update(update)
    .eq('id', id)
    .eq('role', 'staff')
    .select('id,name,email,role,permissions,is_verified,created_at,updated_at')
    .maybeSingle();

  if (error) throw error;
  return toPublicUser(data);
};

const updateProfile = async (id, { name, username, fullName, email, phone, profilePicUrl }) => {
  const update = { updated_at: new Date().toISOString() };

  if (name !== undefined) update.name = name;
  if (username !== undefined) update.username = username || null;
  if (fullName !== undefined) update.full_name = fullName || null;
  if (email !== undefined) update.email = email.toLowerCase();
  if (phone !== undefined) update.phone = phone || null;
  if (profilePicUrl !== undefined) update.profile_pic_url = profilePicUrl || null;

  const { data, error } = await supabase
    .from(USERS_TABLE)
    .update(update)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

const updatePasswordHash = async (id, passwordHash) => {
  const { data, error } = await supabase
    .from(USERS_TABLE)
    .update({
      password_hash: passwordHash,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

const setTwoFactorEnabled = async (id, enabled) => {
  const { data, error } = await supabase
    .from(USERS_TABLE)
    .update({
      two_factor_enabled: enabled,
      login_otp: null,
      login_otp_expiry: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

const markGoogleLinked = async (id) => {
  const { data, error } = await supabase
    .from(USERS_TABLE)
    .update({
      google_linked: true,
      is_verified: true,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

module.exports = {
  toPublicUser,
  findUserByEmail,
  findUserById,
  createUser,
  updatePendingUser,
  verifyUser,
  updateOtp,
  updateLoginOtp,
  clearLoginOtp,
  updateResetOtp,
  resetPasswordHash,
  upsertOAuthUser,
  listUsers,
  listRecentUsers,
  countUsers,
  updateUserRole,
  deleteUser,
  listStaff,
  createStaff,
  updateStaff,
  createManagedUser,
  updateProfile,
  updatePasswordHash,
  setTwoFactorEnabled,
  markGoogleLinked,
};
