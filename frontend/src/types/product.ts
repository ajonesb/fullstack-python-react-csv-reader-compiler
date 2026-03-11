export interface Product {
  id: string;
  name: string;
  price: number;
  expirationDate: string | null;
  currencies: {
    [currency: string]: number;
  };
}

export interface ProductFilters {
  name?: string;
  minPrice?: number;
  maxPrice?: number;
  minExpiration?: string;
  maxExpiration?: string;
  sortBy?: 'name' | 'price' | 'expirationDate';
  sortOrder?: 'asc' | 'desc';
}
