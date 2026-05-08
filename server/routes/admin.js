const express = require('express');
const User = require('../models/User');
const protect = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');

const router = express.Router();

// GET /api/admin/dashboard-stats
router.get('/dashboard-stats', protect, role('admin'), async (req, res) => {
  try {
    const [totalUsers, staffCount, adminCount, recentUsers] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'staff' }),
      User.countDocuments({ role: 'admin' }),
      User.find().sort({ createdAt: -1 }).limit(5).select('name email role createdAt'),
    ]);

    res.json({ totalUsers, activeUsers: totalUsers, staffCount, adminCount, recentUsers });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/admin/users
router.get('/users', protect, role('admin'), async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 }).select('-password -otp -otpExpiry');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PATCH /api/admin/users/:id/role
router.patch('/users/:id/role', protect, role('admin'), async (req, res) => {
  if (req.user.id === req.params.id)
    return res.status(403).json({ message: 'You cannot change your own role' });
  const { role: newRole } = req.body;
  if (!['admin', 'staff', 'user'].includes(newRole))
    return res.status(400).json({ message: 'Invalid role' });
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { role: newRole }, { new: true }).select('-password -otp -otpExpiry');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/admin/users/:id
router.delete('/users/:id', protect, role('admin'), async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
