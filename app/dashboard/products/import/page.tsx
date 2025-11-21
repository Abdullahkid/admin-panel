'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api/client';

interface Store {
  id: string;
  storeDetails: {
    storeName: string;
    storeUsername: string;
  };
  email: string;
}

interface ProductVariant {
  id: string;
  attributes: { [key: string]: string };
  sku?: string;
  mrp?: number;
  sellingPrice: number;
  inventory: number;
}

interface ProductFormData {
  storeId: string;
  title: string;
  description: string;
  brandName: string;
  mainCategory: string;
  subCategory: string;
  imageUrls: string;
  imageSharingStrategy: string;
  isReturnable: boolean;
  isCodAllowed: boolean;
  isPublished: boolean;
}

const MAIN_CATEGORIES = [
  'FASHION', 'ELECTRONICS', 'HOME_LIVING', 'BEAUTY_PERSONAL_CARE',
  'SPORTS_FITNESS', 'BOOKS_STATIONERY', 'TOYS_GAMES', 'GROCERIES',
  'HEALTH_WELLNESS', 'AUTOMOTIVE', 'JEWELLERY', 'FOOD_BEVERAGES',
  'PET_SUPPLIES', 'BABY_PRODUCTS', 'OTHER'
];

const SUB_CATEGORIES: { [key: string]: string[] } = {
  FASHION: ['Mens_Clothing', 'Womens_Clothing', 'Kids_Clothing', 'Footwear', 'Accessories'],
  ELECTRONICS: ['Mobile_Phones', 'Laptops', 'Cameras', 'Audio', 'Accessories'],
  HOME_LIVING: ['Furniture', 'Home_Decor', 'Kitchen', 'Bedding', 'Storage'],
  OTHER: ['General', 'Miscellaneous']
};

export default function ProductImportPage() {
  const router = useRouter();
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingStores, setLoadingStores] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<any>(null);
  const [variants, setVariants] = useState<ProductVariant[]>([
    { id: '1', attributes: {}, sellingPrice: 0, inventory: 0 }
  ]);

  const [formData, setFormData] = useState<ProductFormData>({
    storeId: '',
    title: '',
    description: '',
    brandName: '',
    mainCategory: 'FASHION',
    subCategory: 'Mens_Clothing',
    imageUrls: '',
    imageSharingStrategy: 'PRODUCT_WIDE',
    isReturnable: false,
    isCodAllowed: true,
    isPublished: true
  });

  // Fetch stores on mount
  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      const response = await apiClient.get('/admin/stores?limit=100');
      // Response structure: { stores: [...], total, page, limit, hasMore }
      setStores(response.data.stores || []);
    } catch (err) {
      console.error('Failed to fetch stores:', err);
      setStores([]); // Set empty array on error
    } finally {
      setLoadingStores(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const addVariant = () => {
    setVariants([...variants, {
      id: Date.now().toString(),
      attributes: {},
      sellingPrice: 0,
      inventory: 0
    }]);
  };

  const removeVariant = (id: string) => {
    if (variants.length > 1) {
      setVariants(variants.filter(v => v.id !== id));
    }
  };

  const updateVariant = (id: string, field: keyof ProductVariant | string, value: any) => {
    setVariants(variants.map(v => {
      if (v.id === id) {
        if (field.startsWith('attr_')) {
          const attrName = field.replace('attr_', '');
          return { ...v, attributes: { ...v.attributes, [attrName]: value } };
        }
        return { ...v, [field]: value };
      }
      return v;
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Parse image URLs (one per line)
      const imageUrlsArray = formData.imageUrls
        .split('\n')
        .map(url => url.trim())
        .filter(url => url.length > 0);

      if (imageUrlsArray.length === 0) {
        setError('Please provide at least one image URL');
        setLoading(false);
        return;
      }

      // Validate variants
      const invalidVariants = variants.filter(v =>
        !v.sellingPrice || v.sellingPrice <= 0 || !v.inventory || v.inventory < 0
      );

      if (invalidVariants.length > 0) {
        setError('All variants must have valid price and inventory');
        setLoading(false);
        return;
      }

      // Prepare request
      const request = {
        storeId: formData.storeId,
        title: formData.title,
        description: formData.description,
        brandName: formData.brandName || undefined,
        mainCategory: formData.mainCategory,
        subCategory: formData.subCategory,
        imageUrls: imageUrlsArray,
        variants: variants.map(v => ({
          attributes: v.attributes,
          sku: v.sku || undefined,
          mrp: v.mrp || undefined,
          sellingPrice: v.sellingPrice,
          inventory: v.inventory
        })),
        imageSharingStrategy: formData.imageSharingStrategy,
        isReturnable: formData.isReturnable,
        isCodAllowed: formData.isCodAllowed,
        isPublished: formData.isPublished
      };

      const response = await apiClient.post('/admin/products/bulk-create', request);

      if (response.data.success) {
        setSuccess(response.data);
      } else {
        setError(response.data.message || 'Failed to create product');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create product');
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
              <h2 className="text-2xl font-bold text-gray-900">Product Created Successfully!</h2>
              <p className="text-gray-600 mt-2">{success.message}</p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-blue-900 mb-4">Product Details</h3>
              <div className="space-y-2">
                <div>
                  <label className="text-sm font-medium text-blue-800">Product ID:</label>
                  <p className="font-mono text-blue-900">{success.productId}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-blue-800">Images Uploaded:</label>
                  <p className="text-blue-900">{success.imageIds.length} images</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-blue-800">Total Variants:</label>
                  <p className="text-blue-900">{success.totalVariants}</p>
                </div>
                {success.failedImages && success.failedImages.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-orange-800">Failed Images:</label>
                    <p className="text-orange-900">{success.failedImages.length} images failed</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => {
                  setSuccess(null);
                  setFormData({
                    ...formData,
                    title: '',
                    description: '',
                    brandName: '',
                    imageUrls: ''
                  });
                  setVariants([{ id: '1', attributes: {}, sellingPrice: 0, inventory: 0 }]);
                }}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700"
              >
                Import Another Product
              </button>
              <button
                onClick={() => router.push('/dashboard')}
                className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-300"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
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
          <h1 className="text-3xl font-bold text-gray-900 mt-4">Bulk Product Import</h1>
          <p className="text-gray-600 mt-2">Import products with image URLs (THE KEY FEATURE!)</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Store Selection */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Store</h2>
              <select
                name="storeId"
                value={formData.storeId}
                onChange={handleChange}
                required
                disabled={loadingStores}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">
                  {loadingStores ? 'Loading stores...' : 'Select a store'}
                </option>
                {stores.map(store => (
                  <option key={store.id} value={store.id}>
                    {store.storeDetails?.storeName || store.email} (@{store.storeDetails?.storeUsername})
                  </option>
                ))}
              </select>
            </div>

            {/* Product Details */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Product Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Red Floral Summer Dress"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Brand Name
                  </label>
                  <input
                    type="text"
                    name="brandName"
                    value={formData.brandName}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Nike, Adidas"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Main Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="mainCategory"
                    value={formData.mainCategory}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {MAIN_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>
                        {cat.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sub Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="subCategory"
                    value={formData.subCategory}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {(SUB_CATEGORIES[formData.mainCategory] || []).map(sub => (
                      <option key={sub} value={sub}>
                        {sub.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image Sharing Strategy
                  </label>
                  <select
                    name="imageSharingStrategy"
                    value={formData.imageSharingStrategy}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="PRODUCT_WIDE">Product Wide (All variants share images)</option>
                    <option value="COLOR_BASED">Color Based (Group by color)</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Detailed product description..."
                  />
                </div>
              </div>
            </div>

            {/* Image URLs - THE KEY FEATURE */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Product Image URLs ⭐ KEY FEATURE
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Paste image URLs from the retailer's website (one URL per line). Images will be downloaded and stored on our servers.
              </p>
              <textarea
                name="imageUrls"
                value={formData.imageUrls}
                onChange={handleChange}
                required
                rows={8}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                placeholder="https://retailer.com/products/image1.jpg&#10;https://retailer.com/products/image2.jpg&#10;https://retailer.com/products/image3.jpg&#10;https://retailer.com/products/image4.jpg"
              />
              <p className="text-sm text-gray-500 mt-2">
                {formData.imageUrls.split('\n').filter(url => url.trim()).length} image URL(s) provided
              </p>
            </div>

            {/* Product Variants */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Product Variants</h2>
                <button
                  type="button"
                  onClick={addVariant}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                >
                  + Add Variant
                </button>
              </div>

              <div className="space-y-4">
                {variants.map((variant, index) => (
                  <div key={variant.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium text-gray-900">Variant #{index + 1}</h3>
                      {variants.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeVariant(variant.id)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Size/Attribute
                        </label>
                        <input
                          type="text"
                          value={variant.attributes.Size || ''}
                          onChange={(e) => updateVariant(variant.id, 'attr_Size', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="e.g., M, L, XL"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Color (optional)
                        </label>
                        <input
                          type="text"
                          value={variant.attributes.Color || ''}
                          onChange={(e) => updateVariant(variant.id, 'attr_Color', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="e.g., Red, Blue"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Selling Price (₹) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          value={variant.sellingPrice || ''}
                          onChange={(e) => updateVariant(variant.id, 'sellingPrice', parseFloat(e.target.value))}
                          required
                          min="0"
                          step="0.01"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="1299"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Inventory <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          value={variant.inventory || ''}
                          onChange={(e) => updateVariant(variant.id, 'inventory', parseInt(e.target.value))}
                          required
                          min="0"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="10"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          MRP (₹)
                        </label>
                        <input
                          type="number"
                          value={variant.mrp || ''}
                          onChange={(e) => updateVariant(variant.id, 'mrp', parseFloat(e.target.value))}
                          min="0"
                          step="0.01"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="1999"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          SKU
                        </label>
                        <input
                          type="text"
                          value={variant.sku || ''}
                          onChange={(e) => updateVariant(variant.id, 'sku', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="SKU-123"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Product Options */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Product Options</h2>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="isPublished"
                    checked={formData.isPublished}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-gray-700">Publish product immediately</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="isCodAllowed"
                    checked={formData.isCodAllowed}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-gray-700">Allow Cash on Delivery</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="isReturnable"
                    checked={formData.isReturnable}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-gray-700">Product is returnable</span>
                </label>
              </div>
            </div>

            {/* Submit */}
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
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Downloading Images & Creating Product...
                  </>
                ) : (
                  'Create Product'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
