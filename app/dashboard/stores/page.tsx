'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/react-query/queryClient';
import { apiClient } from '@/lib/api/client';
import Link from 'next/link';
import { Search, Plus, Store, ChevronRight, Filter, X } from 'lucide-react';

interface StoreListItem {
  id: string;
  storeName: string;
  storeUsername: string;
  dxtin: string;
}

interface StoreListResponse {
  stores: StoreListItem[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export default function StoresListPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const limit = 20;

  // Fetch stores with React Query
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.stores.list({ page, search }),
    queryFn: async () => {
      const response = await apiClient.get<StoreListResponse>('/admin/stores', {
        params: { page, limit, search: search || undefined },
      });
      return response.data;
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const clearSearch = () => {
    setSearchInput('');
    setSearch('');
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Stores</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage all stores on the platform
          </p>
        </div>

        <Link
          href="/dashboard/stores/create"
          className="flex items-center space-x-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>Create Store</span>
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="rounded-lg bg-white p-4 shadow">
        <form onSubmit={handleSearch} className="flex items-center space-x-3">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by store name, username, or DXTIN..."
                className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 transition-colors"
          >
            Search
          </button>

          <button
            type="button"
            className="flex items-center space-x-2 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
            title="Filters coming soon"
          >
            <Filter className="h-5 w-5" />
            <span>Filters</span>
            <span className="ml-1 rounded bg-gray-200 px-2 py-0.5 text-xs">Soon</span>
          </button>
        </form>

        {search && (
          <div className="mt-3 flex items-center space-x-2 text-sm text-gray-600">
            <span>Searching for:</span>
            <span className="rounded-full bg-blue-100 px-3 py-1 text-blue-700">
              {search}
            </span>
            <button
              onClick={clearSearch}
              className="text-blue-600 hover:underline"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* Store Stats */}
      {data && (
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg bg-white p-6 shadow">
            <div className="flex items-center space-x-3">
              <div className="rounded-full bg-blue-100 p-3">
                <Store className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Stores</p>
                <p className="text-2xl font-bold text-gray-900">{data.total}</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <div className="flex items-center space-x-3">
              <div className="rounded-full bg-green-100 p-3">
                <Store className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Current Page</p>
                <p className="text-2xl font-bold text-gray-900">{data.page}</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <div className="flex items-center space-x-3">
              <div className="rounded-full bg-purple-100 p-3">
                <Store className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Showing</p>
                <p className="text-2xl font-bold text-gray-900">
                  {data.stores.length}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-red-800">
          <p className="font-medium">Error loading stores</p>
          <p className="mt-1 text-sm">
            {error instanceof Error ? error.message : 'An error occurred'}
          </p>
          <button
            onClick={() => refetch()}
            className="mt-3 text-sm font-medium text-red-600 hover:underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Store List */}
      {data && data.stores.length > 0 && (
        <div className="rounded-lg bg-white shadow">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Store Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Username
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    DXTIN
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.stores.map((store) => (
                  <tr
                    key={store.id}
                    className="transition-colors hover:bg-gray-50"
                  >
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                          <Store className="h-5 w-5" />
                        </div>
                        <div className="ml-4">
                          <div className="font-medium text-gray-900">
                            {store.storeName}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      @{store.storeUsername}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {store.dxtin}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                      <Link
                        href={`/dashboard/stores/${store.id}`}
                        className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-700"
                      >
                        <span>View Details</span>
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="border-t bg-gray-50 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Showing <span className="font-medium">{data.stores.length}</span> of{' '}
                <span className="font-medium">{data.total}</span> stores
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Previous
                </button>

                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, Math.ceil(data.total / limit)) }, (_, i) => {
                    const pageNumber = i + 1;
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => setPage(pageNumber)}
                        className={`rounded-lg px-3 py-2 text-sm font-medium ${
                          page === pageNumber
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setPage(page + 1)}
                  disabled={!data.hasMore}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {data && data.stores.length === 0 && (
        <div className="rounded-lg bg-white p-12 text-center shadow">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
            <Store className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            {search ? 'No stores found' : 'No stores yet'}
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            {search
              ? `No stores match "${search}". Try a different search term.`
              : 'Get started by creating your first store.'}
          </p>
          {search ? (
            <button
              onClick={clearSearch}
              className="mt-4 text-sm font-medium text-blue-600 hover:underline"
            >
              Clear search
            </button>
          ) : (
            <Link
              href="/dashboard/stores/create"
              className="mt-6 inline-flex items-center space-x-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              <Plus className="h-5 w-5" />
              <span>Create Store</span>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
