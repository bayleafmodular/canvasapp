const express = require('express');
const protect = require('../middleware/authMiddleware');
const { createOrder } = require('../services/orders');

const router = express.Router();

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
