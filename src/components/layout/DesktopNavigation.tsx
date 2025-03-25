// src/components/layout/DesktopNavigation.tsx
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Calendar, Sparkles, User, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function DesktopNavigation() {
  const pathname = usePathname();
  const { logout } = useAuth();
  
  const isActive = (path: string) => {
    return pathname === path;
  };
  
  return (
    <div className="hidden lg:flex items-center space-x-8 text-gray-700">
      <Link 
        href="/" 
        className={`flex items-center space-x-1 px-3 py-2 rounded-md transition-colors 
          ${isActive('/') ? 'text-blue-500 font-medium' : 'hover:text-blue-500'}`}
      >
        <Home size={20} className="mr-24" />
        <span>Home</span>
      </Link>
      
      <Link 
        href="/bookings" 
        className={`flex items-center space-x-1 px-3 py-2 rounded-md transition-colors 
          ${isActive('/bookings') ? 'text-blue-500 font-medium' : 'hover:text-blue-500'}`}
      >
        <Calendar size={20} className="mr-1" />
        <span>Bookings</span>
      </Link>
      
      <Link 
        href="/services" 
        className={`flex items-center space-x-1 px-3 py-2 rounded-md transition-colors 
          ${isActive('/services') ? 'text-blue-500 font-medium' : 'hover:text-blue-500'}`}
      >
        <Sparkles size={20} className="mr-1" />
        <span>Services</span>
      </Link>
      
      <Link 
        href="/profile" 
        className={`flex items-center space-x-1 px-3 py-2 rounded-md transition-colors 
          ${isActive('/profile') ? 'text-blue-500 font-medium' : 'hover:text-blue-500'}`}
      >
        <User size={20} className="mr-1" />
        <span>Profile</span>
      </Link>
      
      {/* <button 
        onClick={logout}
        className="flex items-center space-x-1 px-3 py-2 text-red-500 rounded-md hover:bg-red-50 transition-colors"
      >
        <LogOut size={20} className="mr-1" />
        <span>Logout</span>
      </button> */}
    </div>
  );
}