'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, Wifi, ShoppingBag, ImageIcon, Mail, Briefcase, Home } from 'react-icons/fi';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { name: 'Home', href: '/', icon: <Home /> },
    { name: 'Portfolio', href: '/portfolio', icon: <Briefcase /> },
    { name: 'Gallery', href: '/gallery', icon: <ImageIcon /> },
    { name: 'Services', href: '/services', icon: <ShoppingBag /> },
    { name: 'Contact', href: '/contact', icon: <Mail /> },
  ];

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="relative w-12 h-12">
              <Image
                src={process.env.NEXT_PUBLIC_SITE_LOGO || ''}
                alt="Starlink Token WiFi Logo"
                fill
                className="object-contain rounded-lg"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {process.env.NEXT_PUBLIC_SITE_NAME}
              </h1>
              <p className="text-xs text-blue-600 font-semibold">
                <Wifi className="inline mr-1" />
                High-Speed Internet Solutions
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 font-medium transition-colors"
              >
                <span>{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            ))}
            <Link
              href="/admin"
              className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Admin Panel
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-gray-700 hover:text-blue-600"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-gray-100">
            <div className="flex flex-col space-y-3 pt-4">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                >
                  <span>{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              ))}
              <div className="pt-2 border-t border-gray-100">
                <Link
                  href="/admin"
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-3 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Admin Panel
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
