"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ChevronDown, Search, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { auth } from "@/lib/firebase";

export interface Store {
  id: string;
  storeName: string;
  storeUsername: string;
  dxtin: string;
}

interface StoreListResponse {
  stores: Store[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

interface StoreSelectorProps {
  value: string | null;
  onChange: (storeId: string | null, store: Store | null) => void;
  disabled?: boolean;
  required?: boolean;
}

export default function StoreSelector({
  value,
  onChange,
  disabled = false,
  required = false,
}: StoreSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Debounced search function
  const debouncedSearch = useCallback((searchQuery: string) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setPage(1);
      setStores([]);
      fetchStores(1, searchQuery);
    }, 300);
  }, []);

  // Fetch stores from API
  const fetchStores = async (pageNum: number, searchQuery: string = "") => {
    try {
      setLoading(true);

      // Get Firebase auth token
      const user = auth.currentUser;
      let token = "";
      if (user) {
        token = await user.getIdToken(true);
      }

      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: "50",
      });

      if (searchQuery.trim()) {
        params.append("search", searchQuery.trim());
      }

      const response = await fetch(`/api/admin/stores?${params.toString()}`, {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Store fetch failed:", response.status, errorText);
        throw new Error(`Failed to fetch stores: ${response.status}`);
      }

      const data: StoreListResponse = await response.json();

      if (pageNum === 1) {
        setStores(data.stores);
      } else {
        setStores((prev) => [...prev, ...data.stores]);
      }

      setHasMore(data.hasMore);
    } catch (error) {
      console.error("Error fetching stores:", error);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    if (isOpen && stores.length === 0 && !loading) {
      fetchStores(1);
    }
  }, [isOpen]);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSearch = e.target.value;
    setSearch(newSearch);
    debouncedSearch(newSearch);
  };

  // Handle store selection
  const handleSelectStore = (store: Store) => {
    setSelectedStore(store);
    onChange(store.id, store);
    setIsOpen(false);
    setSearch("");
  };

  // Handle clear selection
  const handleClear = () => {
    setSelectedStore(null);
    onChange(null, null);
    setSearch("");
  };

  // Load more stores (infinite scroll)
  const handleLoadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchStores(nextPage, search);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Label */}
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Select Store {required && <span className="text-red-500">*</span>}
      </label>

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          "w-full flex items-center justify-between px-4 py-2.5 border rounded-lg text-left transition-colors",
          disabled
            ? "bg-gray-100 cursor-not-allowed text-gray-400"
            : "bg-white hover:border-gray-400 cursor-pointer",
          isOpen ? "border-blue-500 ring-2 ring-blue-200" : "border-gray-300",
          required && !selectedStore ? "border-red-300" : ""
        )}
      >
        <span className={selectedStore ? "text-gray-900" : "text-gray-400"}>
          {selectedStore
            ? `${selectedStore.storeName} (@${selectedStore.storeUsername})`
            : "Select a store..."}
        </span>
        <ChevronDown
          className={cn(
            "h-5 w-5 text-gray-400 transition-transform",
            isOpen && "transform rotate-180"
          )}
        />
      </button>

      {/* Validation Message */}
      {required && !selectedStore && (
        <p className="text-xs text-red-500 mt-1">Please select a store before uploading</p>
      )}

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 flex flex-col">
          {/* Search Input */}
          <div className="p-3 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or username..."
                value={search}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
              />
            </div>
          </div>

          {/* Store List */}
          <div className="flex-1 overflow-y-auto max-h-64">
            {loading && stores.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                <span className="ml-2 text-gray-500">Loading stores...</span>
              </div>
            ) : stores.length === 0 ? (
              <div className="py-8 text-center text-gray-500">
                {search ? "No stores found matching your search" : "No stores available"}
              </div>
            ) : (
              <>
                {stores.map((store) => (
                  <button
                    key={store.id}
                    type="button"
                    onClick={() => handleSelectStore(store)}
                    className={cn(
                      "w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center justify-between border-b border-gray-100 last:border-b-0",
                      value === store.id && "bg-blue-50 hover:bg-blue-100"
                    )}
                  >
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{store.storeName}</div>
                      <div className="text-sm text-gray-500">
                        @{store.storeUsername} • {store.dxtin}
                      </div>
                    </div>
                    {value === store.id && (
                      <Check className="h-5 w-5 text-blue-600 flex-shrink-0" />
                    )}
                  </button>
                ))}

                {/* Load More */}
                {hasMore && (
                  <button
                    type="button"
                    onClick={handleLoadMore}
                    disabled={loading}
                    className="w-full px-4 py-3 text-center text-sm text-blue-600 hover:bg-gray-50 disabled:opacity-50 flex items-center justify-center"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Loading more...
                      </>
                    ) : (
                      "Load more stores"
                    )}
                  </button>
                )}
              </>
            )}
          </div>

          {/* Clear Selection */}
          {selectedStore && (
            <div className="p-2 border-t border-gray-200">
              <button
                type="button"
                onClick={handleClear}
                className="w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
              >
                Clear selection
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
