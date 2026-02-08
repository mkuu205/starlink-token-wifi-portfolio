const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const firebaseService = require('../services/firebase.service');
const emailService = require('../services/email.service');
const { body, validationResult } = require('express-validator');

// Helper function to sync with Firebase
const syncWithFirebase = async (entityType, action, entityData, user) => {
  try {
    let firebaseId = entityData.firebase_id;
    
    if (action === 'create' || action === 'update') {
      // Prepare data for Firebase
      const firebaseData = {
        ...entityData,
        updatedAt: Date.now(),
        updatedBy: user ? user.email : 'system'
      };
      
      if (action === 'create') {
        firebaseId = await firebaseService.syncToFirestore(entityType, firebaseData);
      } else {
        await firebaseService.syncToFirestore(entityType, { ...firebaseData, firebaseId });
      }
      
      // Broadcast real-time update
      await firebaseService.broadcastUpdate(entityType, action, {
        ...firebaseData,
        firebaseId,
        syncTimestamp: Date.now()
      });
      
      // Update sync status in database
      await firebaseService.updateSyncStatus(
        entityType === 'portfolio_items' ? 'portfolio_items' : entityType,
        entityData.id,
        firebaseId
      );
      
      // Send admin notification
      await emailService.sendAdminUpdateNotification(
        entityType,
        action,
        firebaseData,
        process.env.ADMIN_NOTIFICATION_EMAIL
      );
      
      return firebaseId;
    } else if (action === 'delete') {
      if (firebaseId) {
        await firebaseService.deleteFromFirebase(entityType, firebaseId);
        await firebaseService.broadcastUpdate(entityType, 'delete', { firebaseId });
      }
    }
  } catch (error) {
    console.error(`Firebase sync error for ${entityType}:`, error);
    await firebaseService.updateSyncStatus(
      entityType === 'portfolio_items' ? 'portfolio_items' : entityType,
      entityData.id,
      null,
      'failed',
      error.message
    );
  }
};

// Create portfolio item with Firebase sync
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
    
    const portfolioItem = result.rows[0];
    
    // Sync with Firebase in background
    syncWithFirebase('portfolio_items', 'create', portfolioItem, req.user);
    
    res.status(201).json(portfolioItem);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update portfolio item with Firebase sync
router.put('/:id', async (req, res) => {
  try {
    const { title, description, image_url, category, display_order, is_active } = req.body;
    
    // First get current data
    const currentResult = await pool.query(
      'SELECT * FROM portfolio_items WHERE id = $1',
      [req.params.id]
    );
    
    if (currentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Portfolio item not found' });
    }
    
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
    
    const updatedItem = result.rows[0];
    
    // Sync with Firebase in background
    syncWithFirebase('portfolio_items', 'update', updatedItem, req.user);
    
    res.json(updatedItem);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete portfolio item with Firebase sync
router.delete('/:id', async (req, res) => {
  try {
    // First get the item to be deleted
    const itemResult = await pool.query(
      'SELECT * FROM portfolio_items WHERE id = $1',
      [req.params.id]
    );
    
    if (itemResult.rows.length === 0) {
      return res.status(404).json({ error: 'Portfolio item not found' });
    }
    
    const item = itemResult.rows[0];
    
    // Delete from database
    const result = await pool.query(
      'DELETE FROM portfolio_items WHERE id = $1 RETURNING *',
      [req.params.id]
    );
    
    // Sync with Firebase in background
    syncWithFirebase('portfolio_items', 'delete', item, req.user);
    
    res.json({ message: 'Portfolio item deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});
