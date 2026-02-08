const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const firebaseService = require('../services/firebase.service');
const { authenticate } = require('../middleware/auth');

// Force sync all entities
router.post('/all', authenticate, async (req, res) => {
  try {
    // Sync portfolio items
    const portfolioItems = await pool.query(
      'SELECT * FROM portfolio_items WHERE is_active = true'
    );
    
    for (const item of portfolioItems.rows) {
      await firebaseService.syncToFirestore('portfolio_items', item);
    }
    
    // Sync gallery images
    const galleryImages = await pool.query(
      'SELECT * FROM gallery_images WHERE is_active = true'
    );
    
    for (const image of galleryImages.rows) {
      await firebaseService.syncToFirestore('gallery_images', image);
    }
    
    // Sync bundles
    const bundles = await pool.query(
      'SELECT * FROM bundles WHERE is_active = true'
    );
    
    for (const bundle of bundles.rows) {
      await firebaseService.syncToFirestore('bundles', bundle);
    }
    
    res.json({ 
      message: 'Sync completed successfully',
      synced: {
        portfolio_items: portfolioItems.rows.length,
        gallery_images: galleryImages.rows.length,
        bundles: bundles.rows.length
      }
    });
  } catch (error) {
    console.error('Sync error:', error);
    res.status(500).json({ error: 'Sync failed' });
  }
});

// Sync single entity
router.post('/:entity/:id', authenticate, async (req, res) => {
  try {
    const { entity, id } = req.params;
    
    // Map entity names to table names
    const tableMap = {
      'portfolio_items': 'portfolio_items',
      'gallery_images': 'gallery_images',
      'bundles': 'bundles'
    };
    
    const tableName = tableMap[entity];
    if (!tableName) {
      return res.status(400).json({ error: 'Invalid entity type' });
    }
    
    const result = await pool.query(
      `SELECT * FROM ${tableName} WHERE id = $1`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Entity not found' });
    }
    
    const entityData = result.rows[0];
    const firebaseId = await firebaseService.syncToFirestore(entity, entityData);
    
    // Update Firebase ID in database
    await pool.query(
      `UPDATE ${tableName} SET firebase_id = $1 WHERE id = $2`,
      [firebaseId, id]
    );
    
    res.json({
      message: 'Entity synced successfully',
      firebaseId,
      entity
    });
  } catch (error) {
    console.error('Sync error:', error);
    res.status(500).json({ error: 'Sync failed' });
  }
});

// Get sync status
router.get('/status', authenticate, async (req, res) => {
  try {
    const [portfolioCount, galleryCount, bundleCount] = await Promise.all([
      pool.query('SELECT COUNT(*) as total, COUNT(firebase_id) as synced FROM portfolio_items'),
      pool.query('SELECT COUNT(*) as total, COUNT(firebase_id) as synced FROM gallery_images'),
      pool.query('SELECT COUNT(*) as total, COUNT(firebase_id) as synced FROM bundles')
    ]);
    
    const syncLogs = await pool.query(
      `SELECT * FROM sync_logs 
       ORDER BY created_at DESC 
       LIMIT 10`
    );
    
    res.json({
      status: 'ok',
      syncStatus: {
        portfolio_items: {
          total: parseInt(portfolioCount.rows[0].total),
          synced: parseInt(portfolioCount.rows[0].synced),
          percentage: Math.round((parseInt(portfolioCount.rows[0].synced) / parseInt(portfolioCount.rows[0].total)) * 100)
        },
        gallery_images: {
          total: parseInt(galleryCount.rows[0].total),
          synced: parseInt(galleryCount.rows[0].synced),
          percentage: Math.round((parseInt(galleryCount.rows[0].synced) / parseInt(galleryCount.rows[0].total)) * 100)
        },
        bundles: {
          total: parseInt(bundleCount.rows[0].total),
          synced: parseInt(bundleCount.rows[0].synced),
          percentage: Math.round((parseInt(bundleCount.rows[0].synced) / parseInt(bundleCount.rows[0].total)) * 100)
        }
      },
      recentSyncs: syncLogs.rows
    });
  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({ error: 'Failed to get sync status' });
  }
});

module.exports = router;
