'use client';

import { useState, useEffect, useCallback } from 'react';
import { fetchProducts } from '@/services/api';
import { Product, ProductFilters } from '@/types/product';
import FileUpload from '@/components/FileUpload';
import Filters from '@/components/Filters';
import ProductTable from '@/components/ProductTable';

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filters, setFilters] = useState<ProductFilters>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProducts = useCallback(async (currentFilters: ProductFilters) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchProducts(currentFilters);
      setProducts(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to load products. Please try again.';
      setError(errorMessage);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts(filters);
  }, [filters, loadProducts]);

  const handleFilterChange = (newFilters: ProductFilters) => {
    setFilters(newFilters);
  };

  const handleUploadSuccess = () => {
    loadProducts(filters);
  };

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Product Catalog</h1>
          <p className="text-lg text-gray-700">
            Upload CSV files and manage product inventory with multi-currency pricing
          </p>
        </header>

        <FileUpload onUploadSuccess={handleUploadSuccess} />

        <Filters filters={filters} onFilterChange={handleFilterChange} />

        <ProductTable products={products} isLoading={isLoading} error={error} />
      </div>
    </main>
  );
}
