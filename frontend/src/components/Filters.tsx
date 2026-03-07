'use client';

import React from 'react';
import { ProductFilters } from '@/types/product';

export interface FiltersProps {
  filters: ProductFilters;
  onFilterChange: (filters: ProductFilters) => void;
}

export const Filters: React.FC<FiltersProps> = ({ filters, onFilterChange }) => {
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filters, name: e.target.value || undefined });
  };

  const handleMinPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value ? parseFloat(e.target.value) : undefined;
    onFilterChange({ ...filters, minPrice: value });
  };

  const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value ? parseFloat(e.target.value) : undefined;
    onFilterChange({ ...filters, maxPrice: value });
  };

  const handleMinExpirationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filters, minExpiration: e.target.value || undefined });
  };

  const handleMaxExpirationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filters, maxExpiration: e.target.value || undefined });
  };

  const handleSortByChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as 'name' | 'price' | 'expirationDate' | undefined;
    onFilterChange({ ...filters, sortBy: value || undefined });
  };

  const handleSortOrderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as 'asc' | 'desc' | undefined;
    onFilterChange({ ...filters, sortOrder: value || undefined });
  };

  const handleReset = () => {
    onFilterChange({});
  };

  return (
    <div className="card mb-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-900">Filters</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="name" className="label-text">
            Product Name
          </label>
          <input
            id="name"
            type="text"
            placeholder="Search product name..."
            value={filters.name || ''}
            onChange={handleNameChange}
            className="input-field"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="minPrice" className="label-text">
            Min Price (USD)
          </label>
          <input
            id="minPrice"
            type="number"
            placeholder="0"
            step="0.01"
            min="0"
            value={filters.minPrice !== undefined ? filters.minPrice : ''}
            onChange={handleMinPriceChange}
            className="input-field"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="maxPrice" className="label-text">
            Max Price (USD)
          </label>
          <input
            id="maxPrice"
            type="number"
            placeholder="999999"
            step="0.01"
            min="0"
            value={filters.maxPrice !== undefined ? filters.maxPrice : ''}
            onChange={handleMaxPriceChange}
            className="input-field"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="minExpiration" className="label-text">
            Min Expiration Date
          </label>
          <input
            id="minExpiration"
            type="date"
            value={filters.minExpiration || ''}
            onChange={handleMinExpirationChange}
            className="input-field"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="maxExpiration" className="label-text">
            Max Expiration Date
          </label>
          <input
            id="maxExpiration"
            type="date"
            value={filters.maxExpiration || ''}
            onChange={handleMaxExpirationChange}
            className="input-field"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="sortBy" className="label-text">
            Sort By
          </label>
          <select
            id="sortBy"
            value={filters.sortBy || ''}
            onChange={handleSortByChange}
            className="select-field"
          >
            <option value="">Default</option>
            <option value="name">Name</option>
            <option value="price">Price</option>
            <option value="expirationDate">Expiration Date</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="sortOrder" className="label-text">
            Sort Order
          </label>
          <select
            id="sortOrder"
            value={filters.sortOrder || ''}
            onChange={handleSortOrderChange}
            className="select-field"
          >
            <option value="">Default</option>
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>

        <div className="flex items-end">
          <button onClick={handleReset} className="btn-secondary w-full">
            Reset Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default Filters;
