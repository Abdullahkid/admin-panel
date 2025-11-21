import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../react-query/queryClient';
import * as storeApi from '../api/storeApi';
import toast from 'react-hot-toast';

/**
 * Custom hooks for store management
 * Using React Query for data fetching and caching
 */

// ==================== QUERIES ====================

/**
 * Fetch store details
 */
export function useStoreDetails(storeId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.stores.detail(storeId || ''),
    queryFn: () => storeApi.getStoreDetails(storeId!),
    enabled: !!storeId,
  });
}

/**
 * Fetch store analytics
 */
export function useStoreAnalytics(storeId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.stores.analytics(storeId || ''),
    queryFn: () => storeApi.getStoreAnalytics(storeId!),
    enabled: !!storeId,
  });
}

// ==================== MUTATIONS ====================

/**
 * Update store details
 */
export function useUpdateStore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ storeId, data }: { storeId: string; data: storeApi.UpdateStoreRequest }) =>
      storeApi.updateStore(storeId, data),
    onSuccess: (_, variables) => {
      // Invalidate store details to refetch
      queryClient.invalidateQueries({
        queryKey: queryKeys.stores.detail(variables.storeId),
      });
      // Invalidate store list
      queryClient.invalidateQueries({
        queryKey: queryKeys.stores.lists(),
      });
      toast.success('Store updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update store');
    },
  });
}

/**
 * Suspend or activate store
 */
export function useSuspendStore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ storeId, suspend }: { storeId: string; suspend: boolean }) =>
      storeApi.suspendStore(storeId, suspend),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.stores.detail(variables.storeId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.stores.lists(),
      });
      toast.success(
        variables.suspend ? 'Store suspended successfully' : 'Store activated successfully'
      );
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update store status');
    },
  });
}

/**
 * Update GST verification
 */
export function useUpdateGstVerification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ storeId, verified }: { storeId: string; verified: boolean }) =>
      storeApi.updateGstVerification(storeId, verified),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.stores.detail(variables.storeId),
      });
      toast.success('GST verification status updated');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update GST verification');
    },
  });
}

/**
 * Update Route product status
 */
export function useUpdateRouteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      storeId,
      status,
    }: {
      storeId: string;
      status: 'activated' | 'under_review' | 'rejected';
    }) => storeApi.updateRouteProductStatus(storeId, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.stores.detail(variables.storeId),
      });
      toast.success('Route product status updated');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update route product status');
    },
  });
}
