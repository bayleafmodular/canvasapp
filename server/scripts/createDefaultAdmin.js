require('dotenv').config();
const bcrypt = require('bcryptjs');
const supabase = require('../lib/supabase');
const { adminPermissions } = require('../config/permissions');

const email = process.env.DEFAULT_ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.DEFAULT_ADMIN_PASSWORD;
const name = process.env.DEFAULT_ADMIN_NAME?.trim() || 'Default Admin';

const createDefaultAdmin = async () => {
  if (!email || !password) {
    throw new Error('Set DEFAULT_ADMIN_EMAIL and DEFAULT_ADMIN_PASSWORD in server/.env first');
  }

  if (password.length < 6) {
    throw new Error('DEFAULT_ADMIN_PASSWORD must be at least 6 characters');
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const { data, error } = await supabase
    .from('app_users')
    .upsert(
      {
        name,
        email,
        password_hash: passwordHash,
        role: 'admin',
        permissions: adminPermissions,
        is_verified: true,
        otp: null,
        otp_expiry: null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'email' }
    )
    .select('id,email,role,is_verified')
    .single();

  if (error) throw error;

  console.log(`Default admin ready: ${data.email} (${data.role})`);
};

createDefaultAdmin().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
