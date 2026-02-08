const admin = require('firebase-admin');
const serviceAccount = require('../config/firebase-service-account.json');
const pool = require('../config/database');

class FirebaseService {
  constructor() {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: process.env.FIREBASE_DATABASE_URL
      });
    }
    
    this.db = admin.database();
    this.firestore = admin.firestore();
  }

  /**
   * Sync entity to Firebase Realtime Database
   */
  async syncToRealtimeDB(entityType, entityData) {
    try {
      const ref = this.db.ref(`portfolio/${entityType}`);
      
      if (entityData.firebaseId) {
        // Update existing
        await ref.child(entityData.firebaseId).update(entityData);
        console.log(`Updated ${entityType} in Firebase: ${entityData.firebaseId}`);
      } else {
        // Create new
        const newRef = ref.push();
        const firebaseId = newRef.key;
        await newRef.set({ ...entityData, firebaseId });
        console.log(`Created ${entityType} in Firebase: ${firebaseId}`);
        return firebaseId;
      }
      
      return entityData.firebaseId;
    } catch (error) {
      console.error(`Firebase Realtime DB sync error for ${entityType}:`, error);
      throw error;
    }
  }

  /**
   * Sync entity to Firestore
   */
  async syncToFirestore(entityType, entityData) {
    try {
      const collection = this.firestore.collection(entityType);
      
      if (entityData.firebaseId) {
        // Update existing
        await collection.doc(entityData.firebaseId).update(entityData);
        console.log(`Updated ${entityType} in Firestore: ${entityData.firebaseId}`);
      } else {
        // Create new
        const docRef = collection.doc();
        const firebaseId = docRef.id;
        await docRef.set({ ...entityData, firebaseId, createdAt: admin.firestore.FieldValue.serverTimestamp() });
        console.log(`Created ${entityType} in Firestore: ${firebaseId}`);
        return firebaseId;
      }
      
      return entityData.firebaseId;
    } catch (error) {
      console.error(`Firestore sync error for ${entityType}:`, error);
      throw error;
    }
  }

  /**
   * Delete entity from Firebase
   */
  async deleteFromFirebase(entityType, firebaseId) {
    try {
      // Delete from Realtime DB
      await this.db.ref(`portfolio/${entityType}/${firebaseId}`).remove();
      
      // Delete from Firestore
      await this.firestore.collection(entityType).doc(firebaseId).delete();
      
      console.log(`Deleted ${entityType} from Firebase: ${firebaseId}`);
    } catch (error) {
      console.error(`Firebase delete error for ${entityType}:`, error);
      throw error;
    }
  }

  /**
   * Broadcast update to all connected clients
   */
  async broadcastUpdate(entityType, action, data) {
    try {
      const updateRef = this.db.ref('updates');
      const updateId = Date.now();
      
      await updateRef.child(updateId).set({
        entityType,
        action,
        data,
        timestamp: Date.now(),
        id: updateId
      });
      
      // Remove after 24 hours
      setTimeout(() => {
        updateRef.child(updateId).remove();
      }, 24 * 60 * 60 * 1000);
      
      console.log(`Broadcasted update for ${entityType}: ${action}`);
    } catch (error) {
      console.error('Broadcast update error:', error);
    }
  }

  /**
   * Get real-time updates for clients
   */
  subscribeToUpdates(callback) {
    const updatesRef = this.db.ref('updates');
    
    updatesRef.on('child_added', (snapshot) => {
      const update = snapshot.val();
      callback(update);
    });
  }

  /**
   * Update sync status in database
   */
  async updateSyncStatus(entityType, entityId, firebaseId, status = 'synced', error = null) {
    try {
      await pool.query(
        `UPDATE ${entityType} 
         SET firebase_id = $1, last_synced_at = CURRENT_TIMESTAMP 
         WHERE id = $2`,
        [firebaseId, entityId]
      );
      
      await pool.query(
        `INSERT INTO sync_logs (entity_type, entity_id, action, status, firebase_id, error_message)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [entityType, entityId, 'SYNC', status, firebaseId, error]
      );
      
      console.log(`Updated sync status for ${entityType} ${entityId}: ${status}`);
    } catch (error) {
      console.error('Error updating sync status:', error);
    }
  }
}

module.exports = new FirebaseService();
