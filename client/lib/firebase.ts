/**
 * Firebase client SDK
 * Safe for Next.js (SSR + Render)
 */

import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase, ref, onValue, off, Database } from "firebase/database";
import { getFirestore, collection, onSnapshot, Firestore } from "firebase/firestore";

// --- Firebase config (PUBLIC vars only) ---
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// --- Initialize app (singleton) ---
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// --- Only initialize DBs in the browser ---
let database: Database | null = null;
let firestore: Firestore | null = null;

if (typeof window !== "undefined") {
  database = getDatabase(app);
  firestore = getFirestore(app);
}

// ------------------
// Realtime Service
// ------------------
class FirebaseRealtimeService {
  private subscribers = new Map<string, () => void>();

  /**
   * Subscribe to Realtime Database updates
   */
  subscribeToUpdates(entityType: string, callback: (data: any) => void) {
    if (!database) return () => {};

    const updatesRef = ref(database, "updates");

    const handleUpdate = (snapshot: any) => {
      const updates: any[] = [];

      snapshot.forEach((childSnapshot: any) => {
        updates.push(childSnapshot.val());
      });

      updates.sort((a, b) => b.timestamp - a.timestamp);

      const entityUpdates = updates.filter(
        (update) => update.entityType === entityType
      );

      if (entityUpdates.length > 0) {
        callback(entityUpdates[0]);
      }
    };

    onValue(updatesRef, handleUpdate);

    const unsubscribe = () => off(updatesRef, "value", handleUpdate);
    this.subscribers.set(`${entityType}_${Date.now()}`, unsubscribe);

    return unsubscribe;
  }

  /**
   * Subscribe to Firestore collection
   */
  subscribeToFirestoreCollection<T = any>(
    collectionName: string,
    callback: (items: T[]) => void
  ) {
    if (!firestore) return () => {};

    const unsubscribe = onSnapshot(
      collection(firestore, collectionName),
      (snapshot) => {
        const items = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as T)
        }));
        callback(items);
      }
    );

    this.subscribers.set(
      `firestore_${collectionName}_${Date.now()}`,
      unsubscribe
    );

    return unsubscribe;
  }

  /**
   * Cleanup all subscriptions
   */
  cleanup() {
    this.subscribers.forEach((unsubscribe) => unsubscribe());
    this.subscribers.clear();
  }
}

// --- Exports ---
export const firebaseRealtimeService = new FirebaseRealtimeService();
export { app, database, firestore };
