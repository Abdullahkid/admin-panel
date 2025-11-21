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

interface InvalidRow {
  rowNumber: number;
  productName: string;
  error: string;
}

interface CsvImportPreviewProps {
  previewData: {
    success: boolean;
    message: string;
    detectedColumns: ColumnMapping;
    totalRows: number;
    validRows: number;
    invalidRows: number;
    totalProductsToCreate?: number;
    totalVariantsToCreate?: number;
    previewProducts: CsvProductGroup[];
    invalidRowDetails?: InvalidRow[];
    warnings?: string[];
  };
  onConfirm: (columnMapping: ColumnMapping) => void;
  onCancel: () => void;
}

export default function CsvImportPreview({ previewData, onConfirm, onCancel }: CsvImportPreviewProps) {
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>(previewData.detectedColumns);
  const [showColumnEditor, setShowColumnEditor] = useState(false);
  const [selectedRow, setSelectedRow] = useState<CsvProductRow | null>(null);

  const handleConfirmImport = () => {
    onConfirm(columnMapping);
  };

  const handleRowClick = (row: CsvProductRow) => {
    setSelectedRow(row);
  };

  const closeModal = () => {
    setSelectedRow(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">CSV Preview</h1>
          <p className="text-gray-600 mt-2">Review the detected data before importing</p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
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
            <p className="text-3xl font-bold text-blue-900 mt-1">
              {previewData.totalProductsToCreate !== undefined
                ? previewData.totalProductsToCreate
                : `${previewData.previewProducts.length}+`}
            </p>
            <p className="text-xs text-gray-500 mt-1">will be created</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-purple-600 font-medium">Variants</p>
            <p className="text-3xl font-bold text-purple-900 mt-1">
              {previewData.totalVariantsToCreate !== undefined
                ? previewData.totalVariantsToCreate
                : previewData.validRows}
            </p>
            <p className="text-xs text-gray-500 mt-1">will be created</p>
          </div>
        </div>

        {/* Invalid Rows */}
        {previewData.invalidRowDetails && previewData.invalidRowDetails.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-red-900 mb-3 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Invalid Rows ({previewData.invalidRowDetails.length})
            </h3>
            <p className="text-sm text-red-700 mb-3">
              These rows will be skipped during import. Please fix the errors and re-upload if needed.
            </p>
            <div className="max-h-64 overflow-y-auto bg-white border border-red-200 rounded p-3">
              <table className="min-w-full divide-y divide-red-200">
                <thead>
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-red-800 uppercase">Row</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-red-800 uppercase">Product Name</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-red-800 uppercase">Error</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-red-100">
                  {previewData.invalidRowDetails.map((row, index) => (
                    <tr key={index} className="hover:bg-red-50">
                      <td className="px-3 py-2 text-sm font-mono text-red-900">{row.rowNumber}</td>
                      <td className="px-3 py-2 text-sm text-red-800">{row.productName || '(empty)'}</td>
                      <td className="px-3 py-2 text-sm text-red-700">{row.error}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Warnings */}
        {previewData.warnings && previewData.warnings.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-yellow-900 mb-2 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Warnings ({previewData.warnings.length})
            </h3>
            <p className="text-sm text-yellow-700 mb-2">
              These issues won't prevent import but may affect data quality.
            </p>
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
                        <tr
                          key={vIndex}
                          onClick={() => handleRowClick(variant)}
                          className="cursor-pointer hover:bg-blue-50 transition-colors"
                        >
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

      {/* Row Details Modal */}
      {selectedRow && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={closeModal}>
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white">Row {selectedRow.rowNumber} - Complete Details</h3>
                <p className="text-blue-100 text-sm mt-1">{selectedRow.productName}</p>
              </div>
              <button
                onClick={closeModal}
                className="text-white hover:bg-blue-800 rounded-full p-2 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {/* Warnings Section */}
              {selectedRow.warnings.length > 0 && (
                <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                  <div className="flex items-center mb-2">
                    <svg className="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <h4 className="font-semibold text-yellow-800">Warnings</h4>
                  </div>
                  <ul className="list-disc list-inside text-sm text-yellow-700">
                    {selectedRow.warnings.map((warning, idx) => (
                      <li key={idx}>{warning}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Basic Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Product Name</label>
                  <p className="text-gray-900 font-medium bg-gray-50 p-3 rounded border border-gray-200">{selectedRow.productName}</p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Variant</label>
                  <p className="text-gray-900 font-medium bg-gray-50 p-3 rounded border border-gray-200">{selectedRow.variant || 'Default / No Variant'}</p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase mb-1">SKU</label>
                  <p className="text-gray-900 font-mono bg-gray-50 p-3 rounded border border-gray-200">{selectedRow.sku}</p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Stock Status</label>
                  <span className={`inline-flex items-center px-3 py-2 rounded font-medium ${
                    selectedRow.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {selectedRow.inStock ? '✓ In Stock' : '✗ Out of Stock'}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Selling Price</label>
                  <p className="text-gray-900 font-bold text-lg bg-gray-50 p-3 rounded border border-gray-200">₹{selectedRow.price.toFixed(2)}</p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Compare at Price (MRP)</label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded border border-gray-200">
                    {selectedRow.compareAtPrice ? `₹${selectedRow.compareAtPrice.toFixed(2)}` : 'Not specified'}
                  </p>
                </div>
              </div>

              {/* Description */}
              {selectedRow.description && (
                <div className="mb-6">
                  <label className="block text-xs font-medium text-gray-500 uppercase mb-2">Description</label>
                  <div className="bg-gray-50 p-4 rounded border border-gray-200 text-gray-900 text-sm whitespace-pre-wrap">
                    {selectedRow.description}
                  </div>
                </div>
              )}

              {/* Product URL */}
              {selectedRow.productUrl && (
                <div className="mb-6">
                  <label className="block text-xs font-medium text-gray-500 uppercase mb-2">Product URL (Source)</label>
                  <a
                    href={selectedRow.productUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 bg-blue-50 p-3 rounded border border-blue-200 block truncate"
                  >
                    {selectedRow.productUrl}
                  </a>
                </div>
              )}

              {/* Images Section */}
              <div className="mb-6">
                <label className="block text-xs font-medium text-gray-500 uppercase mb-2">
                  Product Images ({selectedRow.imageUrls.length})
                </label>
                {selectedRow.imageUrls.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {selectedRow.imageUrls.map((url, idx) => (
                      <div key={idx} className="relative group">
                        <div className="aspect-square bg-gray-100 rounded border border-gray-200 overflow-hidden">
                          <img
                            src={url}
                            alt={`Product ${idx + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2U1ZTdlYiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM5YWEwYTYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBGYWlsZWQ8L3RleHQ+PC9zdmc+';
                            }}
                          />
                        </div>
                        <div className="absolute top-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                          {idx + 1}
                        </div>
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="absolute inset-0 bg-blue-600 bg-opacity-0 hover:bg-opacity-10 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100"
                        >
                          <svg className="w-8 h-8 text-white drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                        <div className="mt-1 text-xs text-gray-500 truncate" title={url}>
                          {url}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-50 border border-gray-200 rounded p-8 text-center">
                    <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-gray-500 text-sm">No images provided for this variant</p>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={closeModal}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
