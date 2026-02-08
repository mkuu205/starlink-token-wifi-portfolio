'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import api from '@/utils/api';
import toast from 'react-hot-toast';
import { firebaseRealtimeService } from '@/lib/firebase';
import { useRealTimeSync } from '@/components/RealTimeSyncProvider';
import { 
  Plus, Edit, Trash2, Eye, RefreshCw, 
  Upload, CheckCircle, XCircle 
} from 'react-icons/fi';

const PortfolioManager = () => {
  const { register, handleSubmit, reset, setValue } = useForm();
  const [items, setItems] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [realTimeItems, setRealTimeItems] = useState([]);
  const { updates } = useRealTimeSync();

  useEffect(() => {
    fetchItems();
    subscribeToRealtime();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await api.get('/portfolio/admin'); // Create admin endpoint
      setItems(response.data);
    } catch (error) {
      console.error('Error fetching items:', error);
      toast.error('Failed to load portfolio items');
    }
  };

  const subscribeToRealtime = () => {
    const unsubscribe = firebaseRealtimeService.subscribeToFirestoreCollection(
      'portfolio_items',
      (firebaseItems) => {
        setRealTimeItems(firebaseItems);
      }
    );

    return unsubscribe;
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      if (editingItem) {
        // Update existing item
        const response = await api.put(`/portfolio/${editingItem.id}`, {
          ...data,
          // Firebase sync will be triggered by the backend
          syncToFirebase: true,
          updatedBy: 'admin'
        });
        
        toast.success('Item updated successfully!');
        reset();
        setEditingItem(null);
      } else {
        // Create new item
        const response = await api.post('/portfolio', {
          ...data,
          syncToFirebase: true,
          createdBy: 'admin'
        });
        
        toast.success('Item created successfully!');
        reset();
      }
      
      fetchItems(); // Refresh list
    } catch (error) {
      console.error('Error saving item:', error);
      toast.error(error.response?.data?.error || 'Failed to save item');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setValue('title', item.title);
    setValue('description', item.description);
    setValue('category', item.category);
    setValue('display_order', item.display_order);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    try {
      await api.delete(`/portfolio/${id}`);
      toast.success('Item deleted successfully!');
      fetchItems();
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Failed to delete item');
    }
  };

  const syncToFirebase = async (item) => {
    try {
      await api.post(`/portfolio/${item.id}/sync`, {
        force: true
      });
      toast.success('Sync initiated to Firebase');
    } catch (error) {
      console.error('Sync error:', error);
      toast.error('Sync failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-2xl font-bold mb-6">
          {editingItem ? 'Edit Portfolio Item' : 'Add New Portfolio Item'}
        </h2>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              {...register('title', { required: true })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter item title"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              {...register('description', { required: true })}
              rows="4"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter item description"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <input
                {...register('category')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Web Development, Design"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Display Order
              </label>
              <input
                type="number"
                {...register('display_order')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Image URL
            </label>
            <input
              {...register('image_url')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://example.com/image.jpg"
            />
          </div>
          
          <div className="flex justify-end space-x-4 pt-4">
            {editingItem && (
              <button
                type="button"
                onClick={() => {
                  reset();
                  setEditingItem(null);
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
            >
              {isLoading ? 'Saving...' : editingItem ? 'Update Item' : 'Create Item'}
              {!isLoading && <Plus className="ml-2" />}
            </button>
          </div>
        </form>
      </div>

      {/* Real-time Updates Panel */}
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">Real-time Updates</h3>
          <div className="flex items-center space-x-2">
            <span className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              Live
            </span>
            <button
              onClick={fetchItems}
              className="p-2 hover:bg-gray-100 rounded-lg"
              title="Refresh"
            >
              <RefreshCw />
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Local Database Items */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Database Items ({items.length})</h4>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="border rounded-lg p-4 hover:bg-gray-50"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h5 className="font-medium">{item.title}</h5>
                      <p className="text-sm text-gray-600 truncate">{item.description}</p>
                      <div className="flex items-center mt-2 space-x-4 text-xs">
                        <span className="text-gray-500">
                          Updated: {new Date(item.updated_at).toLocaleDateString()}
                        </span>
                        {item.firebase_id ? (
                          <span className="flex items-center text-green-600">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Synced
                          </span>
                        ) : (
                          <span className="flex items-center text-yellow-600">
                            <XCircle className="w-3 h-3 mr-1" />
                            Not Synced
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="p-1 text-blue-600 hover:text-blue-800"
                        title="Edit"
                      >
                        <Edit />
                      </button>
                      <button
                        onClick={() => syncToFirebase(item)}
                        className="p-1 text-green-600 hover:text-green-800"
                        title="Sync to Firebase"
                      >
                        <Upload />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1 text-red-600 hover:text-red-800"
                        title="Delete"
                      >
                        <Trash2 />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Firebase Items */}
          <div>
            <h4 className="font-semibold text-lg mb-4">
              Firebase Items ({realTimeItems.length})
              <span className="text-sm font-normal text-gray-500 ml-2">
                (Real-time)
              </span>
            </h4>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {realTimeItems.map((item) => (
                <div
                  key={item.firebaseId}
                  className="border rounded-lg p-4 bg-blue-50"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h5 className="font-medium">{item.title}</h5>
                      <p className="text-sm text-gray-600 truncate">{item.description}</p>
                      <div className="flex items-center mt-2 space-x-4 text-xs">
                        <span className="text-gray-500">
                          Live from Firebase
                        </span>
                        <span className="flex items-center text-green-600">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Live
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => window.open(`/portfolio/${item.firebaseId}?source=firebase`, '_blank')}
                      className="p-1 text-blue-600 hover:text-blue-800"
                      title="View Live"
                    >
                      <Eye />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Updates Log */}
      {updates.length > 0 && (
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-xl font-bold mb-4">Recent Updates</h3>
          <div className="space-y-2">
            {updates.slice(0, 5).map((update, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <span className="font-medium">
                    {update.entityType.replace('_', ' ').toUpperCase()}
                  </span>
                  <span className={`ml-2 px-2 py-1 rounded text-xs ${
                    update.action === 'create' ? 'bg-green-100 text-green-800' :
                    update.action === 'update' ? 'bg-blue-100 text-blue-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {update.action.toUpperCase()}
                  </span>
                </div>
                <span className="text-sm text-gray-500">
                  {new Date(update.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PortfolioManager;
