'use client';

import React from 'react';
import { Product } from '@/types/product';

export interface ProductTableProps {
  products: Product[];
  isLoading: boolean;
  error: string | null;
}

export const ProductTable: React.FC<ProductTableProps> = ({ products, isLoading, error }) => {
  if (isLoading) {
    return (
      <div className="card">
        <div className="py-8 text-center text-gray-600">Loading products...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="card">
        <div className="py-8 text-center text-gray-600">No products found.</div>
      </div>
    );
  }

  const formatPrice = (price: number): string => {
    return price.toFixed(2);
  };

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-gray-50 border-b-2 border-gray-300">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-900">Name</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-900">Price (USD)</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-900">EUR</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-900">GBP</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-900">JPY</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-900">CAD</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-900">AUD</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-900">Expiration Date</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-b border-gray-300 hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-primary max-w-xs overflow-hidden text-ellipsis whitespace-nowrap">
                  {product.name}
                </td>
                <td className="px-4 py-3">${formatPrice(product.price)}</td>
                <td className="px-4 py-3">€{formatPrice(product.currencies.EUR || 0)}</td>
                <td className="px-4 py-3">£{formatPrice(product.currencies.GBP || 0)}</td>
                <td className="px-4 py-3">¥{formatPrice(product.currencies.JPY || 0)}</td>
                <td className="px-4 py-3">C${formatPrice(product.currencies.CAD || 0)}</td>
                <td className="px-4 py-3">A${formatPrice(product.currencies.AUD || 0)}</td>
                <td className="px-4 py-3">{formatDate(product.expirationDate)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-300 text-sm text-gray-700">
        Showing {products.length} product{products.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
};

export default ProductTable;
