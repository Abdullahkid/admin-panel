'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api/client';

interface CreateStoreFormData {
  storeName: string;
  email: string;
  phoneNumber: string;
  whatsappNumber: string;
  ownerName: string;
  businessName: string;
  businessType: string;
  storeDescription: string;
  storeLogoUrl: string;
  productCategory: string;
  websiteUrl: string;
  subdomain: string;
}

const PRODUCT_CATEGORIES = [
  'FASHION',
  'FOOTWEAR',
  'ELECTRONICS',
  'COSMETICS',
  'ACCESSORIES'
];

export default function CreateStorePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<any>(null);

  const [formData, setFormData] = useState<CreateStoreFormData>({
    storeName: '',
    email: '',
    phoneNumber: '',
    whatsappNumber: '',
    ownerName: '',
    businessName: '',
    businessType: 'Retail',
    storeDescription: '',
    storeLogoUrl: '',
    productCategory: 'FASHION',
    websiteUrl: '',
    subdomain: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await apiClient.post('/admin/stores/create', {
        storeName: formData.storeName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        whatsappNumber: formData.whatsappNumber || formData.phoneNumber,
        ownerName: formData.ownerName,
        businessName: formData.businessName || formData.storeName,
        businessType: formData.businessType || 'Retail',
        storeDescription: formData.storeDescription || undefined,
        storeLogoUrl: formData.storeLogoUrl || undefined,
        productCategory: formData.productCategory,
        websiteUrl: formData.websiteUrl || undefined,
        subdomain: formData.subdomain || undefined
      });

      if (response.data.success) {
        setSuccess(response.data);
      } else {
        setError(response.data.message || 'Failed to create store');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create store');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Store Created Successfully!</h2>
              <p className="text-gray-600 mt-2">{success.message}</p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-blue-900 mb-4">Store Credentials</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-blue-800">DXTIN:</label>
                  <p className="font-mono text-blue-900 font-bold">{success.dxtin}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-blue-800">Store Username:</label>
                  <p className="font-mono text-blue-900">{success.storeUsername}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-blue-800">Temporary Password:</label>
                  <p className="font-mono text-blue-900 font-bold">{success.tempPassword}</p>
                </div>
              </div>
              <p className="text-sm text-blue-700 mt-4">
                ⚠️ Save these credentials securely. Share them with the store owner when onboarding.
              </p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => router.push('/dashboard/products/import')}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700"
              >
                Import Products for This Store
              </button>
              <button
                onClick={() => {
                  setSuccess(null);
                  setFormData({
                    storeName: '',
                    email: '',
                    phoneNumber: '',
                    whatsappNumber: '',
                    ownerName: '',
                    businessName: '',
                    businessType: 'Retail',
                    storeDescription: '',
                    storeLogoUrl: '',
                    productCategory: 'FASHION',
                    websiteUrl: '',
                    subdomain: ''
                  });
                }}
                className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-300"
              >
                Create Another Store
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mt-4">Create New Store</h1>
          <p className="text-gray-600 mt-2">Create a store profile on behalf of a retailer</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Store Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="storeName"
                    value={formData.storeName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Fashion Hub"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Owner Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="ownerName"
                    value={formData.ownerName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Name
                  </label>
                  <input
                    type="text"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Fashion Hub Pvt Ltd (optional)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Type
                  </label>
                  <input
                    type="text"
                    name="businessType"
                    value={formData.businessType}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Retail, Wholesale"
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="store@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="+919876543210"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    WhatsApp Number
                  </label>
                  <input
                    type="tel"
                    name="whatsappNumber"
                    value={formData.whatsappNumber}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Optional (defaults to phone number)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Website URL
                  </label>
                  <input
                    type="url"
                    name="websiteUrl"
                    value={formData.websiteUrl}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://store-website.com"
                  />
                </div>
              </div>
            </div>

            {/* Store Details */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Store Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="productCategory"
                    value={formData.productCategory}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {PRODUCT_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>
                        {cat.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Custom Subdomain
                  </label>
                  <input
                    type="text"
                    name="subdomain"
                    value={formData.subdomain}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., fashionhub"
                  />
                  <p className="text-sm text-gray-500 mt-1">Will be: subdomain.downxtown.com</p>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Store Logo URL
                  </label>
                  <input
                    type="url"
                    name="storeLogoUrl"
                    value={formData.storeLogoUrl}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://store-website.com/logo.jpg"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Direct URL to store logo image (will be displayed as-is)
                  </p>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Store Description
                  </label>
                  <textarea
                    name="storeDescription"
                    value={formData.storeDescription}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Brief description of the store..."
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-6 border-t">
              <button
                type="button"
                onClick={() => router.push('/dashboard')}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating Store...' : 'Create Store'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
