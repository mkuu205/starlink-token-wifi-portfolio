'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  BarChart3, 
  Users, 
  Package, 
  MessageSquare, 
  Image as ImageIcon,
  Settings,
  LogOut,
  Plus,
  Eye,
  Edit,
  Trash2,
  RefreshCw
} from 'react-icons/fi';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    checkAuth();
    fetchStats();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/admin/login');
      return;
    }

    try {
      const response = await api.get('/auth/me');
      setUser(response.data);
    } catch (error) {
      localStorage.removeItem('token');
      router.push('/admin/login');
    }
  };

  const fetchStats = async () => {
    try {
      const [portfolioRes, galleryRes, bundlesRes, messagesRes] = await Promise.all([
        api.get('/portfolio'),
        api.get('/gallery'),
        api.get('/bundles'),
        api.get('/contact')
      ]);

      setStats({
        portfolio: portfolioRes.data.length,
        gallery: galleryRes.data.length,
        bundles: bundlesRes.data.length,
        messages: messagesRes.data.length,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
    router.push('/admin/login');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: <BarChart3 /> },
    { id: 'portfolio', label: 'Portfolio', icon: <Package /> },
    { id: 'gallery', label: 'Gallery', icon: <ImageIcon /> },
    { id: 'bundles', label: 'Bundles', icon: <Package /> },
    { id: 'messages', label: 'Messages', icon: <MessageSquare /> },
    { id: 'settings', label: 'Settings', icon: <Settings /> },
  ];

  const statCards = [
    {
      title: 'Portfolio Items',
      value: stats?.portfolio || 0,
      icon: <Package className="w-6 h-6" />,
      color: 'bg-blue-500',
      href: '#portfolio'
    },
    {
      title: 'Gallery Images',
      value: stats?.gallery || 0,
      icon: <ImageIcon className="w-6 h-6" />,
      color: 'bg-green-500',
      href: '#gallery'
    },
    {
      title: 'Bundles',
      value: stats?.bundles || 0,
      icon: <Package className="w-6 h-6" />,
      color: 'bg-purple-500',
      href: '#bundles'
    },
    {
      title: 'Messages',
      value: stats?.messages || 0,
      icon: <MessageSquare className="w-6 h-6" />,
      color: 'bg-orange-500',
      href: '#messages'
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">ST</span>
            </div>
            <div>
              <h2 className="font-bold text-gray-900">Starlink Admin</h2>
              <p className="text-sm text-gray-600">{user.email}</p>
            </div>
          </div>

          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-50 text-blue-600 font-semibold'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="mr-3">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>

          <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="mr-2" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your Starlink Token WiFi website</p>
        </div>

        {/* Stats Grid */}
        {activeTab === 'dashboard' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {statCards.map((stat, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl p-6 shadow border border-gray-100"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-lg ${stat.color} text-white`}>
                      {stat.icon}
                    </div>
                    <button
                      onClick={() => setActiveTab(stat.href.replace('#', ''))}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <Eye />
                    </button>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                  <p className="text-gray-600">{stat.title}</p>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow p-6 mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => setActiveTab('portfolio')}
                  className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                >
                  <Plus className="mr-2" />
                  Add Portfolio Item
                </button>
                <button
                  onClick={() => setActiveTab('gallery')}
                  className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
                >
                  <Plus className="mr-2" />
                  Upload Image
                </button>
                <button
                  onClick={() => setActiveTab('bundles')}
                  className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors"
                >
                  <Plus className="mr-2" />
                  Add New Bundle
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
                <button
                  onClick={fetchStats}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <RefreshCw />
                </button>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Website launched</p>
                    <p className="text-sm text-gray-600">Just now</p>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    Success
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Admin login</p>
                    <p className="text-sm text-gray-600">5 minutes ago</p>
                  </div>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    Info
                  </span>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Portfolio Manager */}
        {activeTab === 'portfolio' && (
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Portfolio Management</h2>
            <p>Portfolio manager will be implemented here...</p>
          </div>
        )}

        {/* Settings */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Settings</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Site Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Site Name
                    </label>
                    <input
                      type="text"
                      value="STARLINK TOKEN WIFI"
                      readOnly
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Logo URL
                    </label>
                    <input
                      type="text"
                      value={process.env.NEXT_PUBLIC_SITE_LOGO}
                      readOnly
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Admin Account</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={user.email}
                      readOnly
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      value={user.name}
                      readOnly
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
