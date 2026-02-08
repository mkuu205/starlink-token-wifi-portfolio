const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const upload = require('../middleware/upload');

// Get all gallery images
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM gallery_images WHERE is_active = true ORDER BY display_order, uploaded_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Upload gallery image (admin only)
router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const { caption } = req.body;
    const imageUrl = `/uploads/${req.file.filename}`;
    
    const result = await pool.query(
      `INSERT INTO gallery_images 
       (filename, original_name, path, url, caption) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [
        req.file.filename,
        req.file.originalname,
        req.file.path,
        imageUrl,
        caption || null
      ]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete gallery image (admin only)
router.delete('/:id', async (req, res) => {
  try {
    // First get the image details
    const imageResult = await pool.query(
      'SELECT * FROM gallery_images WHERE id = $1',
      [req.params.id]
    );
    
    if (imageResult.rows.length === 0) {
      return res.status(404).json({ error: 'Image not found' });
    }
    
    // Delete from database
    await pool.query('DELETE FROM gallery_images WHERE id = $1', [req.params.id]);
    
    // Delete file from filesystem
    const fs = require('fs');
    const imagePath = imageResult.rows[0].path;
    
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }
    
    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
