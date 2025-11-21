'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Store,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  Settings,
  LogOut,
} from 'lucide-react';
import { useAdminAuth } from '@/lib/auth/AdminAuthContext';

interface SidebarProps {
  className?: string;
}

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Stores',
    href: '/dashboard/stores',
    icon: Store,
  },
  {
    name: 'Products',
    href: '/dashboard/products',
    icon: Package,
  },
  {
    name: 'Orders',
    href: '/dashboard/orders',
    icon: ShoppingCart,
    badge: 'Soon',
  },
  {
    name: 'Customers',
    href: '/dashboard/customers',
    icon: Users,
    badge: 'Soon',
  },
  {
    name: 'Analytics',
    href: '/dashboard/analytics',
    icon: BarChart3,
    badge: 'Soon',
  },
  {
    name: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
    badge: 'Soon',
  },
];

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const { admin, logout } = useAdminAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className={cn('flex h-screen w-64 flex-col bg-gray-900 text-white', className)}>
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-gray-800 px-6">
        <h1 className="text-xl font-bold">DownXtown Admin</h1>
      </div>

      {/* Admin Info */}
      {admin && (
        <div className="border-b border-gray-800 px-6 py-4">
          <div className="text-sm font-medium">{admin.email}</div>
          <div className="mt-1 text-xs text-gray-400">{admin.role}</div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              )}
            >
              <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
              <span className="flex-1">{item.name}</span>
              {item.badge && (
                <span className="ml-auto rounded-full bg-gray-700 px-2 py-0.5 text-xs text-gray-300">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="border-t border-gray-800 p-4">
        <button
          onClick={handleLogout}
          className="group flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-gray-800 hover:text-white"
        >
          <LogOut className="mr-3 h-5 w-5 flex-shrink-0" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
