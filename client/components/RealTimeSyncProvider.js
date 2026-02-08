'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { firebaseRealtimeService } from '@/lib/firebase';
import toast from 'react-hot-toast';

const RealTimeSyncContext = createContext();

export const useRealTimeSync = () => useContext(RealTimeSyncContext);

export function RealTimeSyncProvider({ children }) {
  const [updates, setUpdates] = useState([]);
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    // Subscribe to all entity updates
    const unsubscribePortfolio = firebaseRealtimeService.subscribeToUpdates(
      'portfolio_items',
      (update) => {
        handleUpdate('portfolio_items', update);
      }
    );

    const unsubscribeGallery = firebaseRealtimeService.subscribeToUpdates(
      'gallery_images',
      (update) => {
        handleUpdate('gallery_images', update);
      }
    );

    const unsubscribeBundles = firebaseRealtimeService.subscribeToUpdates(
      'bundles',
      (update) => {
        handleUpdate('bundles', update);
      }
    );

    // Cleanup on unmount
    return () => {
      unsubscribePortfolio();
      unsubscribeGallery();
      unsubscribeBundles();
      firebaseRealtimeService.cleanup();
    };
  }, []);

  const handleUpdate = (entityType, update) => {
    const { action, data } = update;
    
    // Add to updates history
    setUpdates(prev => [
      { ...update, timestamp: new Date().toISOString() },
      ...prev.slice(0, 9) // Keep last 10 updates
    ]);

    // Show toast notification
    const entityName = getEntityDisplayName(entityType);
    const messages = {
      create: `New ${entityName} added: ${data.title || data.name}`,
      update: `${entityName} updated: ${data.title || data.name}`,
      delete: `${entityName} deleted`
    };

    if (messages[action]) {
      toast.success(messages[action], {
        duration: 4000,
        position: 'top-right',
      });
    }

    // Dispatch custom event for components to react
    window.dispatchEvent(new CustomEvent('realtime-update', {
      detail: { entityType, action, data }
    }));
  };

  const getEntityDisplayName = (entityType) => {
    const names = {
      'portfolio_items': 'Portfolio Item',
      'gallery_images': 'Gallery Image',
      'bundles': 'Bundle',
      'contact_messages': 'Message'
    };
    return names[entityType] || entityType;
  };

  return (
    <RealTimeSyncContext.Provider value={{
      updates,
      isConnected,
      clearUpdates: () => setUpdates([])
    }}>
      {children}
    </RealTimeSyncContext.Provider>
  );
}
