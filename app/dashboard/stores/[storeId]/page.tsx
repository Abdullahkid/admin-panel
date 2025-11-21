'use client';

import { use } from 'react';
import { useStoreDetails, useStoreAnalytics } from '@/lib/hooks/useStore';
import { ArrowLeft, Edit, Ban, CheckCircle, Store as StoreIcon, Mail, Phone, Globe, MapPin } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { StoreEditModal } from '@/components/StoreEditModal';
import { StoreVerificationPanel } from '@/components/StoreVerificationPanel';

interface StoreDetailPageProps {
  params: Promise<{ storeId: string }>;
}

export default function StoreDetailPage({ params }: StoreDetailPageProps) {
  const resolvedParams = use(params);
  const { data: store, isLoading: storeLoading, error: storeError } = useStoreDetails(resolvedParams.storeId);
  const { data: analytics, isLoading: analyticsLoading } = useStoreAnalytics(resolvedParams.storeId);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  if (storeLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (storeError || !store) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-red-800">
        <p>Error loading store details. Store may not exist.</p>
        <Link href="/dashboard/stores" className="mt-2 inline-block text-blue-600 hover:underline">
          ← Back to Stores
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/dashboard/stores"
            className="rounded-lg p-2 hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{store.storeName}</h1>
            <p className="text-sm text-gray-500">DXTIN: {store.dxtin}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="flex items-center space-x-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition-colors"
          >
            <Edit className="h-4 w-4" />
            <span>Edit Store</span>
          </button>

          {store.isActive ? (
            <div className="flex items-center space-x-2 rounded-lg bg-green-100 px-4 py-2 text-green-700">
              <CheckCircle className="h-4 w-4" />
              <span className="font-medium">Active</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2 rounded-lg bg-red-100 px-4 py-2 text-red-700">
              <Ban className="h-4 w-4" />
              <span className="font-medium">Suspended</span>
            </div>
          )}
        </div>
      </div>

      {/* Store Info Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Store Details Card */}
        <div className="rounded-lg bg-white p-6 shadow">
          <div className="flex items-center space-x-3 mb-4">
            <StoreIcon className="h-6 w-6 text-blue-600" />
            <h2 className="text-lg font-semibold">Store Details</h2>
          </div>

          <div className="space-y-3">
            {store.storeLogo && (
              <img src={store.storeLogo} alt="Store Logo" className="h-20 w-20 rounded-lg object-cover" />
            )}

            <div>
              <p className="text-sm text-gray-500">Store Username</p>
              <p className="font-medium">@{store.storeUsername}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Category</p>
              <p className="font-medium">{store.productCategory}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Store Type</p>
              <p className="font-medium">{store.storeType.replace(/_/g, ' ')}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Description</p>
              <p className="text-sm">{store.storeDescription || 'No description'}</p>
            </div>
          </div>
        </div>

        {/* Contact Info Card */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-lg font-semibold">Contact Information</h2>

          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Owner Name</p>
              <p className="font-medium">{store.ownerName}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Business Name</p>
              <p className="font-medium">{store.businessName}</p>
            </div>

            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4 text-gray-400" />
              <div className="flex-1">
                <p className="text-sm text-gray-500">Email</p>
                <p className="text-sm font-medium">{store.email}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Phone className="h-4 w-4 text-gray-400" />
              <div className="flex-1">
                <p className="text-sm text-gray-500">Phone</p>
                <p className="text-sm font-medium">{store.phoneNumber}</p>
              </div>
            </div>

            {store.whatsappNumber && (
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-gray-400" />
                <div className="flex-1">
                  <p className="text-sm text-gray-500">WhatsApp</p>
                  <p className="text-sm font-medium">{store.whatsappNumber}</p>
                </div>
              </div>
            )}

            {store.websiteUrl && (
              <div className="flex items-center space-x-2">
                <Globe className="h-4 w-4 text-gray-400" />
                <div className="flex-1">
                  <p className="text-sm text-gray-500">Website</p>
                  <a
                    href={store.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-blue-600 hover:underline"
                  >
                    {store.websiteUrl}
                  </a>
                </div>
              </div>
            )}

            {store.subdomain && (
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-gray-400" />
                <div className="flex-1">
                  <p className="text-sm text-gray-500">Subdomain</p>
                  <a
                    href={`https://${store.subdomain}.downxtown.com`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-blue-600 hover:underline"
                  >
                    {store.subdomain}.downxtown.com
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Analytics Card */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-lg font-semibold">Analytics</h2>

          {analyticsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
            </div>
          ) : analytics ? (
            <div className="space-y-4">
              <div className="rounded-lg bg-blue-50 p-4">
                <p className="text-sm text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-blue-600">{analytics.totalProducts}</p>
                <p className="text-xs text-gray-500">
                  {analytics.publishedProducts} published, {analytics.draftProducts} draft
                </p>
              </div>

              <div className="rounded-lg bg-green-50 p-4">
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-green-600">{analytics.totalOrders}</p>
                <p className="text-xs text-gray-500">Coming soon</p>
              </div>

              <div className="rounded-lg bg-purple-50 p-4">
                <p className="text-sm text-gray-600">Store Rating</p>
                <p className="text-2xl font-bold text-purple-600">{store.storeRating.toFixed(1)}</p>
                <p className="text-xs text-gray-500">{store.followersCount} followers</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500">Analytics not available</p>
          )}
        </div>
      </div>

      {/* Verification Panel */}
      <StoreVerificationPanel store={store} />

      {/* Edit Modal */}
      {isEditModalOpen && (
        <StoreEditModal
          store={store}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
        />
      )}
    </div>
  );
}
