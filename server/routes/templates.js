const express = require('express');
const protect = require('../middleware/authMiddleware');
const {
  listTemplates,
  getTemplateById,
  createTemplate,
  updateTemplate,
  deleteTemplate,
} = require('../services/templates');

const router = express.Router();

// GET /api/templates
router.get('/', protect, async (req, res) => {
  try {
    const templates = await listTemplates();
    res.json({ data: templates });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching templates' });
  }
});

// GET /api/templates/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const template = await getTemplateById(req.params.id);
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }
    res.json({ data: template });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching template' });
  }
});

// POST /api/templates
router.post('/', protect, async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'staff') {
    return res.status(403).json({ message: 'Not authorized' });
  }

  const { name, category, description, status, objects, layers } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ message: 'Template name is required' });
  }

  try {
    const template = await createTemplate({
      name: name.trim(),
      category: category ? category.trim() : null,
      description: description ? description.trim() : null,
      status,
      objects,
      layers,
    });
    res.status(201).json({ data: template });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error creating template' });
  }
});

// PATCH /api/templates/:id
router.patch('/:id', protect, async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'staff') {
    return res.status(403).json({ message: 'Not authorized' });
  }

  const { name, category, description, status, objects, layers } = req.body;

  if (name !== undefined && (!name || !name.trim())) {
    return res.status(400).json({ message: 'Template name cannot be empty' });
  }

  try {
    const template = await updateTemplate(req.params.id, {
      name: name ? name.trim() : undefined,
      category: category ? category.trim() : undefined,
      description: description ? description.trim() : undefined,
      status,
      objects,
      layers,
    });
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }
    res.json({ data: template });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error updating template' });
  }
});

// DELETE /api/templates/:id
router.delete('/:id', protect, async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'staff') {
    return res.status(403).json({ message: 'Not authorized' });
  }

  try {
    const template = await deleteTemplate(req.params.id);
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }
    res.json({ message: 'Template deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error deleting template' });
  }
});

module.exports = router;
