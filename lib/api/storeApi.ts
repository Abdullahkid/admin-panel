import { apiClient } from './client';

/**
 * Store Management API
 * All endpoints for admin store operations
 */

// ==================== TYPES ====================

export interface StoreDetail {
  id: string;
  dxtin: string;
  email: string;
  phoneNumber: string;
  whatsappNumber?: string;
  ownerName: string;
  businessName: string;
  businessType: string;
  storeName: string;
  storeUsername: string;
  storeLogo?: string;
  storeDescription: string;
  productCategory: string;
  storeType: string;
  storeRating: number;
  productsCount: number;
  followersCount: number;
  subdomain?: string;
  websiteUrl?: string;
  isActive: boolean;
  createdAt: number;
  lastUpdatedAt: number;
  linkedAccountStatus: string;
  routeProductStatus?: string;
  completionStage: string;
}

export interface StoreAnalytics {
  storeId: string;
  storeName: string;
  totalProducts: number;
  publishedProducts: number;
  draftProducts: number;
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  storeRating: number;
  totalReviews: number;
}

export interface UpdateStoreRequest {
  storeName?: string;
  storeDescription?: string;
  storeLogo?: string;
  ownerName?: string;
  businessName?: string;
  phoneNumber?: string;
  whatsappNumber?: string;
  email?: string;
  websiteUrl?: string;
}

export interface StoreActionResponse {
  success: boolean;
  message: string;
  storeId?: string;
}

// ==================== API FUNCTIONS ====================

/**
 * Get store details
 */
export async function getStoreDetails(storeId: string): Promise<StoreDetail> {
  const response = await apiClient.get(`/admin/stores/${storeId}`);
  return response.data;
}

/**
 * Get store analytics
 */
export async function getStoreAnalytics(storeId: string): Promise<StoreAnalytics> {
  const response = await apiClient.get(`/admin/stores/${storeId}/analytics`);
  return response.data;
}

/**
 * Update store details
 */
export async function updateStore(
  storeId: string,
  data: UpdateStoreRequest
): Promise<StoreActionResponse> {
  const response = await apiClient.put(`/admin/stores/${storeId}`, data);
  return response.data;
}

/**
 * Suspend or activate store
 */
export async function suspendStore(
  storeId: string,
  suspend: boolean
): Promise<StoreActionResponse> {
  const response = await apiClient.patch(`/admin/stores/${storeId}/suspend`, {
    suspend,
  });
  return response.data;
}

/**
 * Update GST verification status
 */
export async function updateGstVerification(
  storeId: string,
  verified: boolean
): Promise<StoreActionResponse> {
  const response = await apiClient.patch(`/admin/stores/${storeId}/verify-gst`, {
    verified,
  });
  return response.data;
}

/**
 * Update Route product status
 */
export async function updateRouteProductStatus(
  storeId: string,
  status: 'activated' | 'under_review' | 'rejected'
): Promise<StoreActionResponse> {
  const response = await apiClient.patch(`/admin/stores/${storeId}/route-product`, {
    status,
  });
  return response.data;
}
