"use client";

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import BottomNavigation from './BottomNavigation';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Home, Calendar, Sparkles, User, LogOut, Menu, X } from 'lucide-react';

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Do not show the logout button on auth pages
  const isAuthPage = pathname?.includes('/login') || pathname?.includes('/register');
  
  const handleLogout = () => {
    logout();
    router.push('/login');
  };
  
  // Function to check if a path is active
  const isActive = (path: string) => {
    return pathname === path;
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      {isAuthenticated && !isAuthPage && (
        <header className="py-4 px-6 border-b border-gray-200">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            {/* Logo */}
            <div className="flex-shrink-0">
              <img 
                src="/HouseCleanz-Logo.png" 
                alt="HCleanz Logo" 
                className="h-16" 
              />
            </div>
            
            {/* Desktop Navigation - Hidden on mobile */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link 
                href="/" 
                className={`flex items-center space-x-1 px-3 py-2 rounded-md transition-colors 
                  ${isActive('/') ? 'text-blue-500 font-medium' : 'hover:text-blue-500'}`}
              >
                <Home size={18} className="mr-1" />
                <span>Home</span>
              </Link>
              
              <Link 
                href="/bookings" 
                className={`flex items-center space-x-1 px-3 py-2 rounded-md transition-colors 
                  ${isActive('/bookings') ? 'text-blue-500 font-medium' : 'hover:text-blue-500'}`}
              >
                <Calendar size={18} className="mr-1" />
                <span>Bookings</span>
              </Link>
              
              <Link 
                href="/services" 
                className={`flex items-center space-x-1 px-3 py-2 rounded-md transition-colors 
                  ${isActive('/services') ? 'text-blue-500 font-medium' : 'hover:text-blue-500'}`}
              >
                <Sparkles size={18} className="mr-1" />
                <span>Services</span>
              </Link>
              
              <Link 
                href="/profile" 
                className={`flex items-center space-x-1 px-3 py-2 rounded-md transition-colors 
                  ${isActive('/profile') ? 'text-blue-500 font-medium' : 'hover:text-blue-500'}`}
              >
                <User size={18} className="mr-1" />
                <span>Profile</span>
              </Link>
            </nav>
            
            {/* Mobile menu button */}
            <div className="md:hidden">
              <button 
                onClick={toggleMenu}
                className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 cursor-pointer focus:outline-none"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
          
          {/* Mobile menu, show/hide based on menu state */}
          {isMenuOpen && (
            <div className="md:hidden pt-2 pb-3 px-2 space-y-1 border-t border-gray-100 mt-2">
              <Link 
                href="/" 
                className={`block px-3 py-2 rounded-md ${
                  isActive('/') ? 'bg-blue-50 text-blue-500 font-medium' : 'text-gray-700 hover:bg-gray-50 hover:text-blue-500'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="flex items-center">
                  <Home size={18} className="mr-2" />
                  <span>Home</span>
                </div>
              </Link>
              
              <Link 
                href="/bookings" 
                className={`block px-3 py-2 rounded-md ${
                  isActive('/bookings') ? 'bg-blue-50 text-blue-500 font-medium' : 'text-gray-700 hover:bg-gray-50 hover:text-blue-500'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="flex items-center">
                  <Calendar size={18} className="mr-2" />
                  <span>Bookings</span>
                </div>
              </Link>
              
              <Link 
                href="/services" 
                className={`block px-3 py-2 rounded-md ${
                  isActive('/services') ? 'bg-blue-50 text-blue-500 font-medium' : 'text-gray-700 hover:bg-gray-50 hover:text-blue-500'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="flex items-center">
                  <Sparkles size={18} className="mr-2" />
                  <span>Services</span>
                </div>
              </Link>
              
              <Link 
                href="/profile" 
                className={`block px-3 py-2 rounded-md ${
                  isActive('/profile') ? 'bg-blue-50 text-blue-500 font-medium' : 'text-gray-700 hover:bg-gray-50 hover:text-blue-500'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="flex items-center">
                  <User size={18} className="mr-2" />
                  <span>Profile</span>
                </div>
              </Link>
            </div>
          )}
        </header>
      )}
      
      <main className={`flex-grow ${isAuthenticated && !isAuthPage ? 'pt-4' : ''}`}>
        {children}
      </main>
      
      {/* Bottom Navigation - Only shown on mobile */}
      {isAuthenticated && !isAuthPage && <div className="md:hidden"><BottomNavigation /></div>}
    </div>
  );
};

export default MainLayout;