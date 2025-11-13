"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/lib/auth/AdminAuthContext";
import { apiClient } from "@/lib/api/client";
import Link from "next/link";

interface Analytics {
  totalStores: number;
  totalProducts: number;
  totalOrders: number;
  imagesProcessed: number;
}

export default function DashboardPage() {
  const { isAuthenticated, isLoading, admin, logout } = useAdminAuth();
  const router = useRouter();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchAnalytics();
    }
  }, [isAuthenticated]);

  const fetchAnalytics = async () => {
    try {
      const response = await apiClient.get('/admin/analytics/overview');
      setAnalytics(response.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Downxtown Admin Panel</h1>
          <button
            onClick={logout}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm font-medium"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-2">Welcome, {admin?.email}!</h2>
          <p className="text-gray-600">Role: <span className="font-medium text-blue-600">{admin?.role}</span></p>
          <p className="text-gray-500 text-sm mt-1">
            Permissions: {admin?.permissions.join(", ")}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Total Stores</h3>
                {loadingAnalytics ? (
                  <div className="animate-pulse bg-gray-200 h-10 w-20 rounded mt-2"></div>
                ) : (
                  <p className="text-3xl font-bold text-blue-600 mt-2">{analytics?.totalStores || 0}</p>
                )}
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Total Products</h3>
                {loadingAnalytics ? (
                  <div className="animate-pulse bg-gray-200 h-10 w-20 rounded mt-2"></div>
                ) : (
                  <p className="text-3xl font-bold text-green-600 mt-2">{analytics?.totalProducts || 0}</p>
                )}
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Images Processed</h3>
                {loadingAnalytics ? (
                  <div className="animate-pulse bg-gray-200 h-10 w-20 rounded mt-2"></div>
                ) : (
                  <p className="text-3xl font-bold text-purple-600 mt-2">{analytics?.imagesProcessed || 0}</p>
                )}
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/dashboard/stores/create"
              className="flex items-center p-4 border-2 border-blue-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all group"
            >
              <div className="bg-blue-600 p-3 rounded-lg group-hover:bg-blue-700 transition-colors">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="font-semibold text-gray-900">Create New Store</h3>
                <p className="text-sm text-gray-600">Onboard a new retailer</p>
              </div>
            </Link>

            <Link
              href="/dashboard/products/import-csv"
              className="flex items-center p-4 border-2 border-green-200 rounded-lg hover:border-green-400 hover:bg-green-50 transition-all group"
            >
              <div className="bg-green-600 p-3 rounded-lg group-hover:bg-green-700 transition-colors">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="font-semibold text-gray-900">Import Products from CSV</h3>
                <p className="text-sm text-gray-600">Bulk upload with scraped product data</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Status */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow p-6 text-white">
          <h2 className="text-xl font-semibold mb-4">System Status</h2>
          <div className="space-y-2">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Backend API connected</span>
            </div>
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Authentication working</span>
            </div>
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Ready to onboard stores!</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
