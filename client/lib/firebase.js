import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, off } from 'firebase/database';
import { getFirestore, collection, onSnapshot } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const firestore = getFirestore(app);

class FirebaseRealtimeService {
  constructor() {
    this.subscribers = new Map();
  }

  /**
   * Subscribe to real-time updates
   */
  subscribeToUpdates(entityType, callback) {
    const updatesRef = ref(database, 'updates');
    
    const handleUpdate = (snapshot) => {
      const updates = [];
      snapshot.forEach((childSnapshot) => {
        updates.push(childSnapshot.val());
      });
      // Sort by timestamp (newest first)
      updates.sort((a, b) => b.timestamp - a.timestamp);
      
      // Filter for this entity type
      const entityUpdates = updates.filter(update => 
        update.entityType === entityType
      );
      
      if (entityUpdates.length > 0) {
        callback(entityUpdates[0]); // Send latest update
      }
    };
    
    onValue(updatesRef, handleUpdate);
    
    // Store unsubscribe function
    const unsubscribe = () => off(updatesRef, 'value', handleUpdate);
    this.subscribers.set(`${entityType}_${Date.now()}`, unsubscribe);
    
    return unsubscribe;
  }

  /**
   * Subscribe to Firestore collection
   */
  subscribeToFirestoreCollection(collectionName, callback) {
    const unsubscribe = onSnapshot(
      collection(firestore, collectionName),
      (snapshot) => {
        const items = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        callback(items);
      }
    );
    
    this.subscribers.set(`firestore_${collectionName}_${Date.now()}`, unsubscribe);
    return unsubscribe;
  }

  /**
   * Cleanup all subscriptions
   */
  cleanup() {
    this.subscribers.forEach(unsubscribe => unsubscribe());
    this.subscribers.clear();
  }
}

export const firebaseRealtimeService = new FirebaseRealtimeService();
export { database, firestore };
