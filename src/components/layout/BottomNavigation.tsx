'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Home, Calendar, Sparkles, User } from 'lucide-react';

export const BottomNavigation = () => {
  const pathname = usePathname();
  
  const isActive = (path: string) => {
    return pathname === path;
  };

  const navItems = [
    {
      icon: Home,
      label: 'Home',
      path: '/',
    },
    {
      icon: Calendar,
      label: 'Bookings',
      path: '/bookings',
    },
    {
      icon: Sparkles,
      label: 'Services',
      path: '/services',
    },
    {
      icon: User,
      label: 'Profile',
      path: '/profile',
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 sm:hidden z-10">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className="flex flex-col items-center justify-center w-full h-full"
          >
            <item.icon
              size={24}
              className={isActive(item.path) ? 'text-primary' : 'text-gray-500'}
            />
            <span
              className={`text-xs mt-1 ${
                isActive(item.path) ? 'text-primary' : 'text-gray-500'
              }`}
            >
              {item.label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default BottomNavigation;