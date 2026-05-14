const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const protect = require('../middleware/authMiddleware');
const supabase = require('../lib/supabase');
const sendOtpEmail = require('../utils/sendOtpEmail');
const {
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
  updateProfile,
  updatePasswordHash,
  setTwoFactorEnabled,
  markGoogleLinked,
} = require('../services/users');

const router = express.Router();

const generateToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '7d' });

const generateOtp = () =>
  crypto.randomInt(100000, 999999).toString();

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password)
    return res.status(400).json({ message: 'All fields are required' });

  if (password.length < 6)
    return res.status(400).json({ message: 'Password must be at least 6 characters' });

  try {
    const existing = await findUserByEmail(email);
    if (existing && existing.is_verified)
      return res.status(400).json({ message: 'Email already in use' });

    const hashed = await bcrypt.hash(password, 10);
    const otp = generateOtp();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    if (existing && !existing.is_verified) {
      await updatePendingUser(existing.id, {
        name,
        passwordHash: hashed,
        otp,
        otpExpiry,
      });
    } else {
      await createUser({
        name,
        email,
        passwordHash: hashed,
        otp,
        otpExpiry,
      });
    }

    await sendOtpEmail(email, name, otp);

    res.status(201).json({ message: 'OTP sent to your email', email });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/auth/verify-otp
router.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp)
    return res.status(400).json({ message: 'Email and OTP are required' });

  try {
    const user = await findUserByEmail(email);
    if (!user)
      return res.status(400).json({ message: 'User not found' });

    if (user.is_verified)
      return res.status(400).json({ message: 'Account already verified' });

    if (user.otp !== otp)
      return res.status(400).json({ message: 'Invalid OTP' });

    if (new Date(user.otp_expiry) < new Date())
      return res.status(400).json({ message: 'OTP has expired' });

    const verifiedUser = await verifyUser(user.id);
    const token = generateToken(verifiedUser.id, verifiedUser.role);
    res.json({
      message: 'Email verified successfully',
      token,
      user: toPublicUser(verifiedUser),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/auth/resend-otp
router.post('/resend-otp', async (req, res) => {
  const { email } = req.body;

  if (!email)
    return res.status(400).json({ message: 'Email is required' });

  try {
    const user = await findUserByEmail(email);
    if (!user)
      return res.status(400).json({ message: 'User not found' });

    if (user.is_verified)
      return res.status(400).json({ message: 'Account already verified' });

    const otp = generateOtp();
    await updateOtp(user.id, {
      otp,
      otpExpiry: new Date(Date.now() + 10 * 60 * 1000),
    });

    await sendOtpEmail(email, user.name, otp);
    res.json({ message: 'OTP resent successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: 'All fields are required' });

  try {
    const user = await findUserByEmail(email);
    if (!user)
      return res.status(400).json({ message: 'Invalid credentials' });

    if (!user.password_hash)
      return res.status(400).json({ message: 'Please continue with Google login' });

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch)
      return res.status(400).json({ message: 'Invalid credentials' });

    if (!user.is_verified)
      return res.status(403).json({ message: 'Please verify your email first', email });

    if (user.two_factor_enabled) {
      const otp = generateOtp();
      await updateLoginOtp(user.id, {
        otp,
        otpExpiry: new Date(Date.now() + 10 * 60 * 1000),
      });
      await sendOtpEmail(user.email, user.name, otp);
      return res.json({ requiresTwoFactor: true, email: user.email });
    }

    const token = generateToken(user.id, user.role);
    res.json({ token, user: toPublicUser(user) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/auth/verify-login-2fa
router.post('/verify-login-2fa', async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp)
    return res.status(400).json({ message: 'Email and OTP are required' });

  try {
    const user = await findUserByEmail(email);
    if (!user || !user.two_factor_enabled)
      return res.status(400).json({ message: 'Invalid 2FA request' });

    if (user.login_otp !== otp)
      return res.status(400).json({ message: 'Invalid OTP' });

    if (!user.login_otp_expiry || new Date(user.login_otp_expiry) < new Date())
      return res.status(400).json({ message: 'OTP has expired' });

    const verifiedUser = await clearLoginOtp(user.id);
    const token = generateToken(verifiedUser.id, verifiedUser.role);
    res.json({ token, user: toPublicUser(verifiedUser) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  if (!email)
    return res.status(400).json({ message: 'Email is required' });

  try {
    const user = await findUserByEmail(email);

    if (user) {
      const otp = generateOtp();
      await updateResetOtp(user.id, {
        otp,
        otpExpiry: new Date(Date.now() + 10 * 60 * 1000),
      });
      await sendOtpEmail(user.email, user.name, otp);
    }

    res.json({ message: 'If an account exists, a password reset OTP has been sent.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword)
    return res.status(400).json({ message: 'Email, OTP, and new password are required' });

  if (newPassword.length < 6)
    return res.status(400).json({ message: 'New password must be at least 6 characters' });

  try {
    const user = await findUserByEmail(email);
    if (!user)
      return res.status(400).json({ message: 'Invalid reset request' });

    if (user.reset_otp !== otp)
      return res.status(400).json({ message: 'Invalid OTP' });

    if (!user.reset_otp_expiry || new Date(user.reset_otp_expiry) < new Date())
      return res.status(400).json({ message: 'OTP has expired' });

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await resetPasswordHash(user.id, passwordHash);

    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/auth/oauth-login
router.post('/oauth-login', async (req, res) => {
  const { accessToken } = req.body;

  if (!accessToken)
    return res.status(400).json({ message: 'OAuth access token is required' });

  try {
    const { data, error } = await supabase.auth.getUser(accessToken);
    if (error || !data?.user?.email) {
      return res.status(401).json({ message: 'Invalid Google session' });
    }

    const oauthUser = data.user;
    const name =
      oauthUser.user_metadata?.full_name ||
      oauthUser.user_metadata?.name ||
      oauthUser.email.split('@')[0];

    const user = await upsertOAuthUser({ name, email: oauthUser.email });
    const token = generateToken(user.id, user.role);

    res.json({ token, user: toPublicUser(user) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PATCH /api/auth/profile
router.patch('/profile', protect, async (req, res) => {
  const { name, username, fullName, email, phone, profilePicUrl } = req.body;

  if (!name || !email)
    return res.status(400).json({ message: 'Name and email are required' });

  try {
    const user = await updateProfile(req.user.id, {
      name,
      username,
      fullName,
      email,
      phone,
      profilePicUrl,
    });
    res.json(toPublicUser(user));
  } catch (err) {
    console.error(err);
    const duplicate = err.code === '23505';
    res.status(duplicate ? 400 : 500).json({
      message: duplicate ? 'Email or username already in use' : 'Server error',
    });
  }
});

// PATCH /api/auth/password
router.patch('/password', protect, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!newPassword || newPassword.length < 6)
    return res.status(400).json({ message: 'New password must be at least 6 characters' });

  try {
    const user = await findUserById(req.user.id);

    if (user.password_hash) {
      if (!currentPassword)
        return res.status(400).json({ message: 'Current password is required' });

      const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
      if (!isMatch)
        return res.status(400).json({ message: 'Current password is incorrect' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    const updatedUser = await updatePasswordHash(req.user.id, passwordHash);
    res.json({ message: 'Password updated successfully', user: toPublicUser(updatedUser) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PATCH /api/auth/2fa
router.patch('/2fa', protect, async (req, res) => {
  const { enabled } = req.body;

  try {
    const user = await setTwoFactorEnabled(req.user.id, Boolean(enabled));
    res.json(toPublicUser(user));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/auth/link-google
router.post('/link-google', protect, async (req, res) => {
  const { accessToken } = req.body;

  if (!accessToken)
    return res.status(400).json({ message: 'OAuth access token is required' });

  try {
    const { data, error } = await supabase.auth.getUser(accessToken);
    if (error || !data?.user?.email) {
      return res.status(401).json({ message: 'Invalid Google session' });
    }

    if (data.user.email.toLowerCase() !== req.user.email.toLowerCase()) {
      return res.status(400).json({ message: 'Google account email must match your account email' });
    }

    const user = await markGoogleLinked(req.user.id);
    res.json(toPublicUser(user));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/auth/me  (protected)
router.get('/me', protect, async (req, res) => {
  try {
    res.json(req.user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
