const express = require('express');
const bcrypt = require('bcryptjs');
const protect = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');
const can = require('../middleware/permissionMiddleware');
const {
  listUsers,
  listRecentUsers,
  countUsers,
  updateUserRole,
  deleteUser,
  listStaff,
  createStaff,
  updateStaff,
  createManagedUser,
} = require('../services/users');
const {
  listOrders,
  updateOrderStatus,
} = require('../services/orders');

const router = express.Router();

// GET /api/admin/dashboard-stats
router.get('/dashboard-stats', protect, role('admin', 'staff'), can('dashboard.show'), async (req, res) => {
  try {
    const [totalUsers, staffCount, adminCount, recentUsers] = await Promise.all([
      countUsers(),
      countUsers('staff'),
      countUsers('admin'),
      listRecentUsers(5),
    ]);

    res.json({ totalUsers, activeUsers: totalUsers, staffCount, adminCount, recentUsers });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/admin/users
router.get('/users', protect, role('admin', 'staff'), can('users.show'), async (req, res) => {
  try {
    res.json(await listUsers());
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/admin/users
router.post('/users', protect, role('admin', 'staff'), can('users.create'), async (req, res) => {
  const { name, email, password, role: newRole = 'user' } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required' });
  }

  if (!['admin', 'staff', 'user'].includes(newRole)) {
    return res.status(400).json({ message: 'Invalid role' });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' });
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await createManagedUser({ name, email, passwordHash, role: newRole });
    res.status(201).json(user);
  } catch (err) {
    console.error(err);
    const status = err.code === '23505' ? 400 : 500;
    const message = err.code === '23505' ? 'Email already in use' : 'Server error';
    res.status(status).json({ message });
  }
});

// PATCH /api/admin/users/:id/role
router.patch('/users/:id/role', protect, role('admin', 'staff'), can('users.edit'), async (req, res) => {
  if (req.user.id === req.params.id)
    return res.status(403).json({ message: 'You cannot change your own role' });
  const { role: newRole } = req.body;
  if (!['admin', 'staff', 'user'].includes(newRole))
    return res.status(400).json({ message: 'Invalid role' });
  try {
    const user = await updateUserRole(req.params.id, newRole);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/admin/users/:id
router.delete('/users/:id', protect, role('admin', 'staff'), can('users.edit'), async (req, res) => {
  try {
    const user = await deleteUser(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/admin/staff
router.get('/staff', protect, role('admin', 'staff'), can('staff.show'), async (req, res) => {
  try {
    res.json(await listStaff());
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/admin/staff
router.post('/staff', protect, role('admin', 'staff'), can('staff.create'), async (req, res) => {
  const { name, email, password, permissions } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required' });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' });
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const staff = await createStaff({ name, email, passwordHash, permissions });
    res.status(201).json(staff);
  } catch (err) {
    console.error(err);
    const status = err.code === '23505' ? 400 : 500;
    const message = err.code === '23505' ? 'Email already in use' : 'Server error';
    res.status(status).json({ message });
  }
});

// PATCH /api/admin/staff/:id
router.patch('/staff/:id', protect, role('admin', 'staff'), can('staff.edit'), async (req, res) => {
  const { name, email, permissions } = req.body;

  try {
    const staff = await updateStaff(req.params.id, { name, email, permissions });
    if (!staff) return res.status(404).json({ message: 'Staff user not found' });
    res.json(staff);
  } catch (err) {
    console.error(err);
    const status = err.code === '23505' ? 400 : 500;
    const message = err.code === '23505' ? 'Email already in use' : 'Server error';
    res.status(status).json({ message });
  }
});

// GET /api/admin/orders
router.get('/orders', protect, role('admin', 'staff'), async (req, res) => {
  try {
    const orders = await listOrders();
    res.json(orders);
  } catch (err) {
    console.error(err);
    const status = err.statusCode || 500;
    res.status(status).json({ message: err.message || 'Server error' });
  }
});

// PATCH /api/admin/orders/:id
router.patch('/orders/:id', protect, role('admin', 'staff'), async (req, res) => {
  const { status, remarks } = req.body;
  const allowedStatuses = ['Pending', 'In Review', 'Processing', 'Approved', 'Rejected', 'Completed'];
  if (!status || !allowedStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid or missing status' });
  }
  try {
    const order = await updateOrderStatus(req.params.id, status, remarks);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    console.error(err);
    const statusVal = err.statusCode || 500;
    res.status(statusVal).json({ message: err.message || 'Server error' });
  }
});

module.exports = router;