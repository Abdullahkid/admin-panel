'use client';

import { useState } from 'react';

interface CsvProductRow {
  rowNumber: number;
  productName: string;
  variant: string | null;
  sku: string;
  price: number;
  compareAtPrice: number | null;
  inStock: boolean;
  productUrl: string | null;
  description: string | null;
  imageUrls: string[];
  warnings: string[];
}

interface CsvProductGroup {
  baseProductName: string;
  variants: CsvProductRow[];
  totalImages: number;
  priceRange: string;
}

interface ColumnMapping {
  productName: string;
  variant: string;
  sku: string;
  price: string;
  compareAtPrice: string;
  inStock: string;
  productUrl: string;
  description: string;
  images: string;
}

interface CsvImportPreviewProps {
  previewData: {
    success: boolean;
    message: string;
    detectedColumns: ColumnMapping;
    totalRows: number;
    validRows: number;
    invalidRows: number;
    previewProducts: CsvProductGroup[];
    warnings?: string[];
  };
  onConfirm: (columnMapping: ColumnMapping) => void;
  onCancel: () => void;
}

export default function CsvImportPreview({ previewData, onConfirm, onCancel }: CsvImportPreviewProps) {
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>(previewData.detectedColumns);
  const [showColumnEditor, setShowColumnEditor] = useState(false);

  const handleConfirmImport = () => {
    onConfirm(columnMapping);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">CSV Preview</h1>
          <p className="text-gray-600 mt-2">Review the detected data before importing</p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 font-medium">Total Rows</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{previewData.totalRows}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-green-600 font-medium">Valid Rows</p>
            <p className="text-3xl font-bold text-green-900 mt-1">{previewData.validRows}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-red-600 font-medium">Invalid Rows</p>
            <p className="text-3xl font-bold text-red-900 mt-1">{previewData.invalidRows}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-blue-600 font-medium">Products</p>
            <p className="text-3xl font-bold text-blue-900 mt-1">{previewData.previewProducts.length}+</p>
          </div>
        </div>

        {/* Warnings */}
        {previewData.warnings && previewData.warnings.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-yellow-900 mb-2 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Warnings
            </h3>
            <ul className="list-disc list-inside text-sm text-yellow-800">
              {previewData.warnings.map((warning, index) => (
                <li key={index}>{warning}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Column Mapping */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Column Mapping</h2>
                <p className="text-sm text-gray-600 mt-1">Detected columns from your CSV file</p>
              </div>
              <button
                onClick={() => setShowColumnEditor(!showColumnEditor)}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                {showColumnEditor ? 'Hide Details' : 'Edit Mapping'}
              </button>
            </div>
          </div>

          {showColumnEditor && (
            <div className="p-6 bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(columnMapping).map(([key, value]) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </label>
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => setColumnMapping({ ...columnMapping, [key]: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Preview Products */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Product Preview</h2>
            <p className="text-sm text-gray-600 mt-1">Showing first {previewData.previewProducts.length} products</p>
          </div>

          <div className="divide-y divide-gray-200">
            {previewData.previewProducts.map((product, index) => (
              <div key={index} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{product.baseProductName}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {product.variants.length} variant{product.variants.length !== 1 ? 's' : ''} • {product.totalImages} image{product.totalImages !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <span className="text-lg font-bold text-blue-600">{product.priceRange}</span>
                </div>

                {/* Variants Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Variant</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Images</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Warnings</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {product.variants.map((variant, vIndex) => (
                        <tr key={vIndex}>
                          <td className="px-4 py-3 text-sm text-gray-900">{variant.variant || 'Default'}</td>
                          <td className="px-4 py-3 text-sm text-gray-600 font-mono">{variant.sku}</td>
                          <td className="px-4 py-3 text-sm">
                            <div className="text-gray-900 font-medium">₹{variant.price.toFixed(2)}</div>
                            {variant.compareAtPrice && (
                              <div className="text-xs text-gray-500 line-through">₹{variant.compareAtPrice.toFixed(2)}</div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              variant.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {variant.inStock ? 'In Stock' : 'Out of Stock'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">{variant.imageUrls.length}</td>
                          <td className="px-4 py-3 text-sm">
                            {variant.warnings.length > 0 ? (
                              <div className="text-yellow-600 text-xs">
                                {variant.warnings.map((w, i) => (
                                  <div key={i}>{w}</div>
                                ))}
                              </div>
                            ) : (
                              <span className="text-green-600 text-xs">✓ Valid</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Sample Images */}
                {product.variants[0].imageUrls.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs text-gray-500 mb-2">Sample Images (first variant):</p>
                    <div className="flex gap-2 overflow-x-auto">
                      {product.variants[0].imageUrls.slice(0, 5).map((url, imgIndex) => (
                        <div key={imgIndex} className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded border border-gray-200 overflow-hidden">
                          <img
                            src={url}
                            alt={`Product ${imgIndex + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjZTVlN2ViIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzlhYTBhNiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
                            }}
                          />
                        </div>
                      ))}
                      {product.variants[0].imageUrls.length > 5 && (
                        <div className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded border border-gray-200 flex items-center justify-center">
                          <span className="text-xs text-gray-500">+{product.variants[0].imageUrls.length - 5} more</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={onCancel}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmImport}
            className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Confirm Import ({previewData.totalRows} rows)
          </button>
        </div>
      </div>
    </div>
  );
}
