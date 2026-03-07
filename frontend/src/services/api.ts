import axios from 'axios';
import { Product, ProductFilters } from '@/types/product';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
});

export const uploadCsvFile = async (
  file: File,
  onUploadProgress?: (percent: number) => void,
): Promise<{ message: string }> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post<{ message: string }>('/api/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (event) => {
      if (onUploadProgress && event.total) {
        onUploadProgress(Math.round((event.loaded * 100) / event.total));
      }
    },
  });

  return response.data;
};

export const fetchProducts = async (filters: ProductFilters): Promise<Product[]> => {
  const params = new URLSearchParams();

  if (filters.name) params.append('name', filters.name);
  if (filters.minPrice !== undefined) params.append('minPrice', filters.minPrice.toString());
  if (filters.maxPrice !== undefined) params.append('maxPrice', filters.maxPrice.toString());
  if (filters.minExpiration) params.append('minExpiration', filters.minExpiration);
  if (filters.maxExpiration) params.append('maxExpiration', filters.maxExpiration);
  if (filters.sortBy) params.append('sortBy', filters.sortBy);
  if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

  const response = await api.get<Product[]>('/api/products', { params });
  return response.data;
};
