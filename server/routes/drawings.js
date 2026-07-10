const express = require('express');
const protect = require('../middleware/authMiddleware');
const {
  listDrawingsForUser,
  createDrawingForUser,
  getDrawingForUser,
  updateDrawingForUser,
  deleteDrawingForUser,
} = require('../services/drawings');

const router = express.Router();

router.get('/', protect, async (req, res) => {
  try {
    res.json(await listDrawingsForUser(req.user.id));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', protect, async (req, res) => {
  const { name, data } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ message: 'Drawing name is required' });
  }

  if (!data || !Array.isArray(data.objects)) {
    return res.status(400).json({ message: 'Drawing data is invalid' });
  }

  try {
    const drawing = await createDrawingForUser(req.user.id, {
      name: name.trim(),
      data,
    });
    res.status(201).json(drawing);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const drawing = await getDrawingForUser(req.user.id, req.params.id);
    if (!drawing) return res.status(404).json({ message: 'Drawing not found' });
    res.json(drawing);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    const drawing = await deleteDrawingForUser(req.user.id, req.params.id);
    if (!drawing) return res.status(404).json({ message: 'Drawing not found' });
    res.json({ message: 'Drawing deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.patch('/:id', protect, async (req, res) => {
  const { name, data } = req.body;

  if (name !== undefined && (!name || !name.trim())) {
    return res.status(400).json({ message: 'Drawing name cannot be empty' });
  }

  if (data !== undefined && (!data || !Array.isArray(data.objects))) {
    return res.status(400).json({ message: 'Drawing data is invalid' });
  }

  try {
    const drawing = await updateDrawingForUser(req.user.id, req.params.id, {
      name: name ? name.trim() : undefined,
      data,
    });
    if (!drawing) return res.status(404).json({ message: 'Drawing not found' });
    res.json(drawing);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
