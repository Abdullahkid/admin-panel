'use client';

import { useState } from 'react';
import { CheckCircle, XCircle, Clock, AlertCircle, Ban, CheckCheck } from 'lucide-react';
import {
  useSuspendStore,
  useUpdateGstVerification,
  useUpdateRouteProduct,
} from '@/lib/hooks/useStore';
import type { StoreDetail } from '@/lib/api/storeApi';

interface StoreVerificationPanelProps {
  store: StoreDetail;
}

export function StoreVerificationPanel({ store }: StoreVerificationPanelProps) {
  const suspendStore = useSuspendStore();
  const updateGstVerification = useUpdateGstVerification();
  const updateRouteProduct = useUpdateRouteProduct();

  const [showSuspendConfirm, setShowSuspendConfirm] = useState(false);

  const handleSuspendToggle = async () => {
    await suspendStore.mutateAsync({
      storeId: store.id,
      suspend: !store.isActive,
    });
    setShowSuspendConfirm(false);
  };

  const handleGstVerification = async (verified: boolean) => {
    await updateGstVerification.mutateAsync({
      storeId: store.id,
      verified,
    });
  };

  const handleRouteProductUpdate = async (status: 'activated' | 'under_review' | 'rejected') => {
    await updateRouteProduct.mutateAsync({
      storeId: store.id,
      status,
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'activated':
      case 'active':
        return (
          <span className="flex items-center space-x-1 text-green-600">
            <CheckCircle className="h-4 w-4" />
            <span className="font-medium">Activated</span>
          </span>
        );
      case 'under_review':
      case 'pending':
        return (
          <span className="flex items-center space-x-1 text-yellow-600">
            <Clock className="h-4 w-4" />
            <span className="font-medium">Under Review</span>
          </span>
        );
      case 'rejected':
        return (
          <span className="flex items-center space-x-1 text-red-600">
            <XCircle className="h-4 w-4" />
            <span className="font-medium">Rejected</span>
          </span>
        );
      case 'not_requested':
      default:
        return (
          <span className="flex items-center space-x-1 text-gray-600">
            <AlertCircle className="h-4 w-4" />
            <span className="font-medium">Not Requested</span>
          </span>
        );
    }
  };

  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <h2 className="mb-6 text-lg font-semibold">Store Actions & Verification</h2>

      <div className="space-y-6">
        {/* Store Status */}
        <div className="border-b pb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Store Status</h3>
              <p className="text-sm text-gray-500">Suspend or activate this store</p>
            </div>
            <div className="flex items-center space-x-3">
              {store.isActive ? (
                <>
                  <span className="flex items-center space-x-1 text-green-600">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">Active</span>
                  </span>
                  {!showSuspendConfirm ? (
                    <button
                      onClick={() => setShowSuspendConfirm(true)}
                      className="flex items-center space-x-2 rounded-lg bg-red-100 px-4 py-2 text-red-700 hover:bg-red-200 transition-colors"
                    >
                      <Ban className="h-4 w-4" />
                      <span>Suspend Store</span>
                    </button>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Confirm suspension?</span>
                      <button
                        onClick={handleSuspendToggle}
                        disabled={suspendStore.isPending}
                        className="rounded-lg bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700 disabled:opacity-50"
                      >
                        {suspendStore.isPending ? 'Suspending...' : 'Yes, Suspend'}
                      </button>
                      <button
                        onClick={() => setShowSuspendConfirm(false)}
                        className="rounded-lg bg-gray-200 px-3 py-1 text-sm text-gray-700 hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <span className="flex items-center space-x-1 text-red-600">
                    <Ban className="h-5 w-5" />
                    <span className="font-medium">Suspended</span>
                  </span>
                  <button
                    onClick={handleSuspendToggle}
                    disabled={suspendStore.isPending}
                    className="flex items-center space-x-2 rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50 transition-colors"
                  >
                    <CheckCheck className="h-4 w-4" />
                    <span>{suspendStore.isPending ? 'Activating...' : 'Activate Store'}</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Razorpay Route Product */}
        <div className="border-b pb-6">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h3 className="font-medium">Razorpay Route Product</h3>
              <p className="text-sm text-gray-500">Payment routing status</p>
            </div>
            {getStatusBadge(store.routeProductStatus || 'not_requested')}
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => handleRouteProductUpdate('activated')}
              disabled={updateRouteProduct.isPending || store.routeProductStatus === 'activated'}
              className="flex-1 rounded-lg bg-green-100 px-4 py-2 text-green-700 hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Activate
            </button>
            <button
              onClick={() => handleRouteProductUpdate('under_review')}
              disabled={updateRouteProduct.isPending || store.routeProductStatus === 'under_review'}
              className="flex-1 rounded-lg bg-yellow-100 px-4 py-2 text-yellow-700 hover:bg-yellow-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Mark Under Review
            </button>
            <button
              onClick={() => handleRouteProductUpdate('rejected')}
              disabled={updateRouteProduct.isPending || store.routeProductStatus === 'rejected'}
              className="flex-1 rounded-lg bg-red-100 px-4 py-2 text-red-700 hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Reject
            </button>
          </div>
        </div>

        {/* Account Details */}
        <div>
          <h3 className="mb-3 font-medium">Account Details</h3>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-lg bg-gray-50 p-3">
              <p className="text-sm text-gray-500">Linked Account Status</p>
              <p className="font-medium">{store.linkedAccountStatus || 'N/A'}</p>
            </div>
            <div className="rounded-lg bg-gray-50 p-3">
              <p className="text-sm text-gray-500">Completion Stage</p>
              <p className="font-medium">{store.completionStage.replace(/_/g, ' ')}</p>
            </div>
            <div className="rounded-lg bg-gray-50 p-3">
              <p className="text-sm text-gray-500">Created At</p>
              <p className="font-medium">{new Date(store.createdAt).toLocaleDateString()}</p>
            </div>
            <div className="rounded-lg bg-gray-50 p-3">
              <p className="text-sm text-gray-500">Last Updated</p>
              <p className="font-medium">{new Date(store.lastUpdatedAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
