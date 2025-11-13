'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/lib/auth/AdminAuthContext';

export default function HomePage() {
  const router = useRouter();
  const { admin, isLoading } = useAdminAuth();

  useEffect(() => {
    if (!isLoading) {
      if (admin) {
        // Redirect authenticated admins to dashboard
        router.replace('/dashboard');
      } else {
        // Redirect unauthenticated users to login
        router.replace('/login');
      }
    }
  }, [admin, isLoading, router]);

  // Show loading spinner while checking auth state
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>
  );
}
