'use client';

import { Package, Upload, FileSpreadsheet } from 'lucide-react';
import Link from 'next/link';

export default function ProductsPage() {
  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Products</h1>
        <p className="mt-2 text-gray-600">
          Manage products across all stores in your marketplace
        </p>
      </div>

      {/* Stats Cards */}
      <div className="mb-8 grid gap-6 md:grid-cols-3">
        <div className="rounded-lg bg-white p-6 shadow">
          <div className="flex items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Products</p>
              <p className="text-2xl font-bold text-gray-900">-</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <div className="flex items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
              <Package className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Published</p>
              <p className="text-2xl font-bold text-gray-900">-</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <div className="flex items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-100">
              <Package className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Draft</p>
              <p className="text-2xl font-bold text-gray-900">-</p>
            </div>
          </div>
        </div>
      </div>

      {/* Product Management Actions */}
      <div className="rounded-lg bg-white p-8 shadow">
        <h2 className="mb-6 text-xl font-semibold text-gray-900">
          Product Management
        </h2>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* CSV Import */}
          <Link
            href="/dashboard/products/import-csv"
            className="group flex flex-col rounded-lg border-2 border-gray-200 p-6 transition-all hover:border-blue-500 hover:shadow-md"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 group-hover:bg-blue-200">
              <FileSpreadsheet className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              Import from CSV
            </h3>
            <p className="text-sm text-gray-600">
              Bulk upload products using CSV file format
            </p>
          </Link>

          {/* Regular Import */}
          <Link
            href="/dashboard/products/import"
            className="group flex flex-col rounded-lg border-2 border-gray-200 p-6 transition-all hover:border-green-500 hover:shadow-md"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 group-hover:bg-green-200">
              <Upload className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              Manual Import
            </h3>
            <p className="text-sm text-gray-600">
              Add products one at a time with detailed information
            </p>
          </Link>

          {/* Browse All Products (Coming Soon) */}
          <div className="group flex flex-col rounded-lg border-2 border-gray-200 bg-gray-50 p-6 opacity-60">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gray-200">
              <Package className="h-6 w-6 text-gray-600" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              Browse All Products
            </h3>
            <p className="text-sm text-gray-600">
              View and manage all products in the marketplace
            </p>
            <span className="mt-2 inline-block text-xs font-medium text-gray-500">
              Coming Soon
            </span>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-8 rounded-lg bg-blue-50 p-4">
          <h4 className="mb-2 font-medium text-blue-900">
            Product Management Features
          </h4>
          <ul className="space-y-1 text-sm text-blue-800">
            <li>• Import products in bulk using CSV files</li>
            <li>• Manually add products with detailed information</li>
            <li>• Manage product variants, pricing, and inventory</li>
            <li>• Full product listing and filtering (Coming Soon)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
