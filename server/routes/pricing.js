const express = require('express');
const protect = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');
const can = require('../middleware/permissionMiddleware');
const {
  getPricingSettings,
  updatePricingSettings,
} = require('../services/pricing');

const router = express.Router();

router.get('/', protect, async (req, res) => {
  try {
    res.json(await getPricingSettings());
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to load pricing settings' });
  }
});

router.patch('/', protect, role('admin', 'staff'), can('pricing.edit'), async (req, res) => {
  try {
    res.json(await updatePricingSettings(req.body));
  } catch (err) {
    console.error(err);
    res.status(err.statusCode || 500).json({ message: err.statusCode ? err.message : 'Failed to update pricing settings' });
  }
});

module.exports = router;
