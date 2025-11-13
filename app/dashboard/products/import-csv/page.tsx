'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api/client';
import { useAdminAuth } from '@/lib/auth/AdminAuthContext';
import CsvImportPreview from '@/components/CsvImportPreview';
import CsvImportProgress from '@/components/CsvImportProgress';
import StoreSelector, { Store } from '@/components/StoreSelector';

const PRODUCT_CATEGORIES = [
  'FASHION',
  'FOOTWEAR',
  'ELECTRONICS',
  'COSMETICS',
  'ACCESSORIES'
];

export default function CsvImportPage() {
  const { isAuthenticated, isLoading } = useAdminAuth();
  const router = useRouter();
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvContent, setCsvContent] = useState('');
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('FASHION');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Preview state
  const [previewData, setPreviewData] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Import state
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
        setError('Please select a valid CSV file');
        return;
      }

      setCsvFile(file);
      setError('');

      // Read file content
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setCsvContent(content);
      };
      reader.readAsText(file);
    }
  };

  const handlePreview = async () => {
    if (!csvFile) {
      setError('Please select a CSV file');
      return;
    }

    if (!selectedStoreId) {
      setError('Please select a store before uploading');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Use FormData for large file uploads
      const formData = new FormData();
      formData.append('file', csvFile);
      formData.append('sellerId', selectedStoreId);

      // IMPORTANT: Set Content-Type to undefined (not string 'undefined')
      // This lets Axios auto-detect FormData and add proper boundary parameter
      const response = await apiClient.post('/admin/products/csv/preview', formData, {
        headers: {
          'Content-Type': undefined as any,
        },
      });

      setPreviewData(response.data);
      setShowPreview(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to preview CSV');
      console.error('Preview error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async (columnMapping: any) => {
    if (!csvFile) {
      setError('CSV file not found. Please select the file again.');
      return;
    }

    if (!selectedStoreId) {
      setError('Store not selected. Please go back and select a store.');
      return;
    }

    setImporting(true);
    setError('');

    try {
      // Use FormData for large file uploads
      const formData = new FormData();
      formData.append('file', csvFile);
      formData.append('sellerId', selectedStoreId);
      formData.append('columnMapping', JSON.stringify(columnMapping));
      formData.append('downloadImages', 'true');
      if (selectedCategory) {
        formData.append('category', selectedCategory);
      }

      const response = await apiClient.post('/admin/products/csv/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setImportResult(response.data);
      setShowPreview(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to import products');
      console.error('Import error:', err);
    } finally {
      setImporting(false);
    }
  };

  const handleReset = () => {
    setCsvFile(null);
    setCsvContent('');
    setPreviewData(null);
    setShowPreview(false);
    setImportResult(null);
    setError('');
  };

  if (!isAuthenticated) {
    return null;
  }

  // Show import result
  if (importResult) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="text-center mb-6">
              {importResult.success ? (
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              ) : (
                <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              )}
              <h2 className="text-2xl font-bold text-gray-900">
                {importResult.success ? 'Import Completed!' : 'Import Failed'}
              </h2>
              <p className="text-gray-600 mt-2">{importResult.message}</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-600 font-medium">Products Created</p>
                <p className="text-2xl font-bold text-blue-900">{importResult.productsCreated}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-600 font-medium">Variants Created</p>
                <p className="text-2xl font-bold text-green-900">{importResult.variantsCreated}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-purple-600 font-medium">Images Processed</p>
                <p className="text-2xl font-bold text-purple-900">{importResult.imagesProcessed}</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="text-sm text-red-600 font-medium">Failed</p>
                <p className="text-2xl font-bold text-red-900">{importResult.failed}</p>
              </div>
            </div>

            {importResult.errors && importResult.errors.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">Errors ({importResult.errors.length})</h3>
                <div className="max-h-64 overflow-y-auto bg-red-50 border border-red-200 rounded-lg p-4">
                  {importResult.errors.map((error: any, index: number) => (
                    <div key={index} className="mb-2 last:mb-0">
                      <span className="font-medium">Row {error.rowNumber}:</span> {error.productName} - {error.error}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <p className="text-sm text-gray-500 mb-6">
              Import completed in {(importResult.duration / 1000).toFixed(2)} seconds
            </p>

            <div className="flex gap-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700"
              >
                Go to Dashboard
              </button>
              <button
                onClick={handleReset}
                className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-300"
              >
                Import Another CSV
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show import progress
  if (importing) {
    return <CsvImportProgress />;
  }

  // Show preview
  if (showPreview && previewData) {
    return (
      <CsvImportPreview
        previewData={previewData}
        onConfirm={handleImport}
        onCancel={() => setShowPreview(false)}
      />
    );
  }

  // Show upload form
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
          <h1 className="text-3xl font-bold text-gray-900 mt-4">Import Products from CSV</h1>
          <p className="text-gray-600 mt-2">Upload a CSV file with scraped product data</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="space-y-6">
            {/* Store Selection - MANDATORY */}
            <StoreSelector
              value={selectedStoreId}
              onChange={(storeId, store) => {
                setSelectedStoreId(storeId);
                setSelectedStore(store);
              }}
              required={true}
            />

            {/* Category Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Category <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {PRODUCT_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>
                    {cat.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CSV File <span className="text-red-500">*</span>
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                  id="csv-upload"
                />
                <label htmlFor="csv-upload" className="cursor-pointer">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <p className="mt-2 text-sm text-gray-600">
                    <span className="font-medium text-blue-600 hover:text-blue-500">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500 mt-1">CSV files only</p>
                </label>
              </div>

              {csvFile && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm font-medium text-blue-900">Selected file:</p>
                  <p className="text-sm text-blue-700">{csvFile.name}</p>
                  <p className="text-xs text-blue-600 mt-1">
                    {(csvFile.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6 border-t">
              <button
                type="button"
                onClick={() => router.push('/dashboard')}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handlePreview}
                disabled={!csvFile || !selectedStoreId || loading}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Parsing CSV...
                  </>
                ) : (
                  'Preview & Import'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
