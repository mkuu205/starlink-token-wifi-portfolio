'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  Wifi, 
  Shield, 
  Zap, 
  Globe, 
  Users,
  CheckCircle
} from 'react-icons/fi';
import api from '@/lib/api';

export default function Home() {
  const [bundles, setBundles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBundles();
  }, []);

  const fetchBundles = async () => {
    try {
      const response = await api.get('/bundles');
      setBundles(response.data.slice(0, 4));
    } catch (error) {
      console.error('Error fetching bundles:', error);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: <Wifi className="w-8 h-8" />,
      title: 'High-Speed Internet',
      description: 'Lightning-fast internet connections for all your needs'
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Secure & Reliable',
      description: 'Bank-grade security with 99.9% uptime guarantee'
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: 'Instant Activation',
      description: 'Get connected immediately after payment'
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: 'Nationwide Coverage',
      description: 'Available across the entire country'
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: '24/7 Support',
      description: 'Round-the-clock customer support'
    },
    {
      icon: <CheckCircle className="w-8 h-8" />,
      title: 'No Contracts',
      description: 'Flexible plans, cancel anytime'
    }
  ];

  return (
    <div className="space-y-20">
      {/* Hero Section */}
      <section className="py-12 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10" />
        <div className="container mx-auto px-4 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                Experience The{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                  Future of Internet
                </span>{' '}
                with Starlink Token WiFi
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Get lightning-fast, reliable, and affordable internet services. 
                Perfect for streaming, gaming, working, and connecting with loved ones.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/services"
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
                >
                  View Our Bundles
                  <ArrowRight className="ml-2" />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  Contact Us
                </Link>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="relative w-full h-96 lg:h-[500px] rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="/api/placeholder/600/500"
                  alt="Starlink Token WiFi Network"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-6 left-6 text-white">
                  <h3 className="text-2xl font-bold mb-2">Connect. Stream. Enjoy.</h3>
                  <p>Unlimited possibilities with our high-speed internet</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Why Choose Starlink Token WiFi?
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            We provide the best internet experience with cutting-edge technology 
            and exceptional customer service
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all border border-gray-100"
            >
              <div className="inline-flex p-3 bg-blue-100 text-blue-600 rounded-lg mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Bundles Section */}
      <section className="bg-gradient-to-b from-white to-blue-50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Popular Internet Bundles
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Choose the perfect bundle for your internet needs. Affordable, flexible, and reliable.
            </p>
          </div>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Loading bundles...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {bundles.map((bundle: any, index) => (
                <motion.div
                  key={bundle.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all border border-gray-100"
                >
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {bundle.name}
                    </h3>
                    <div className="text-4xl font-bold text-blue-600 mb-1">
                      Ksh {bundle.price}
                    </div>
                    <p className="text-sm text-gray-500">{bundle.validity}</p>
                  </div>
                  <div className="mb-6">
                    <p className="text-gray-600 mb-4">{bundle.description}</p>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        <span>{bundle.data_amount} Data</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        <span>High Speed</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        <span>No Speed Throttling</span>
                      </div>
                    </div>
                  </div>
                  <Link
                    href="/contact"
                    className="block w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
                  >
                    Get This Bundle
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
          
          <div className="text-center mt-12">
            <Link
              href="/services"
              className="inline-flex items-center px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium"
            >
              View All Bundles
              <ArrowRight className="ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 md:p-12 text-center text-white"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Experience High-Speed Internet?
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of satisfied customers enjoying reliable internet connectivity
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/contact"
              className="px-8 py-3 bg-white text-blue-600 rounded-lg hover:bg-gray-100 font-semibold transition-colors"
            >
              Get Started Now
            </Link>
            <Link
              href="tel:+254700000000"
              className="px-8 py-3 border-2 border-white text-white rounded-lg hover:bg-white/10 transition-colors"
            >
              Call Us: +254 700 000 000
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
