const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { body, validationResult } = require('express-validator');

// Get all portfolio items
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM portfolio_items WHERE is_active = true ORDER BY display_order, created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single portfolio item
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM portfolio_items WHERE id = $1 AND is_active = true',
      [req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Portfolio item not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create portfolio item (admin only)
router.post('/', [
  body('title').notEmpty().trim(),
  body('description').notEmpty().trim(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  try {
    const { title, description, image_url, category, display_order } = req.body;
    
    const result = await pool.query(
      `INSERT INTO portfolio_items 
       (title, description, image_url, category, display_order) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [title, description, image_url || null, category || null, display_order || 0]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update portfolio item (admin only)
router.put('/:id', async (req, res) => {
  try {
    const { title, description, image_url, category, display_order, is_active } = req.body;
    
    const result = await pool.query(
      `UPDATE portfolio_items 
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           image_url = COALESCE($3, image_url),
           category = COALESCE($4, category),
           display_order = COALESCE($5, display_order),
           is_active = COALESCE($6, is_active),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $7 
       RETURNING *`,
      [title, description, image_url, category, display_order, is_active, req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Portfolio item not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete portfolio item (admin only)
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM portfolio_items WHERE id = $1 RETURNING *',
      [req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Portfolio item not found' });
    }
    
    res.json({ message: 'Portfolio item deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
