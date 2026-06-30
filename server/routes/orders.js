const express = require('express');
const protect = require('../middleware/authMiddleware');
const { createOrder, listUserOrders } = require('../services/orders');

const router = express.Router();

// GET /api/orders
// Placed by logged-in users to list their own orders
router.get('/', protect, async (req, res) => {
  try {
    const orders = await listUserOrders(req.user.id, req.user.email);
    res.json(orders);
  } catch (err) {
    console.error(err);
    const status = err.statusCode || 500;
    res.status(status).json({ message: err.message || 'Server error' });
  }
});

// POST /api/orders
// Placed by logged-in users
router.post('/', protect, async (req, res) => {
  const { customerName, email, phone, address, productName, quantity, totalPrice, blueprintType, drawingData } = req.body;

  if (!customerName || !email || !productName || !totalPrice || !blueprintType) {
    return res.status(400).json({ message: 'customerName, email, productName, totalPrice, and blueprintType are required.' });
  }

  try {
    const order = await createOrder(req.user.id, {
      customerName,
      email,
      phone,
      address,
      productName,
      quantity,
      totalPrice,
      blueprintType,
      drawingData,
    });
    res.status(201).json(order);
  } catch (err) {
    console.error(err);
    const status = err.statusCode || 500;
    res.status(status).json({ message: err.message || 'Server error' });
  }
});

module.exports = router;