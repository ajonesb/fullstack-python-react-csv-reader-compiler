import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '@/entities/product.entity';
import { ProductConversion } from '@/entities/product-conversion.entity';
import { ProductFilterDto } from '@/dto/product-filter.dto';
import { ProductRepository } from './product.repository';

/**
 * ============================================================================
 * Response DTO for products with multi-currency support
 * ============================================================================
 */
export interface ProductWithConversions {
  id: string;
  name: string;
  price: number;
  expirationDate: Date | null;
  // Currency code mapped to converted price value
  currencies: {
    [currency: string]: number;
  };
}

/**
 * ============================================================================
 * ProductsService
 *
 * Handles business logic for product management, including filtering,
 * batch operations, and multi-currency price conversions.
 * ============================================================================
 */
@Injectable()
export class ProductsService {
  constructor(
    private readonly productRepository: ProductRepository,
    @InjectRepository(ProductConversion)
    private readonly conversionRepository: Repository<ProductConversion>,
  ) {}

  /**
   * Retrieves products based on provided filters and transforms them
   * into response DTOs with currency conversions.
   *
   * @param filters - Filter criteria for product search
   * @returns Array of products with converted currencies
   */
  async getProducts(filters: ProductFilterDto): Promise<ProductWithConversions[]> {
    const products = await this.productRepository.findWithFilters(filters);
    return this.transformProductsToResponse(products);
  }

  /**
   * Saves multiple products to the database in a batch operation.
   *
   * @param products - Array of partial product objects to save
   * @returns Array of saved products with generated IDs
   */
  async saveBatchProducts(products: Partial<Product>[]): Promise<Product[]> {
    return await this.productRepository.createBatch(products);
  }

  /**
   * Saves multiple currency conversions to the database in chunks
   * to optimize performance for large datasets.
   *
   * @param conversions - Array of partial conversion objects to save
   */
  async saveBatchConversions(conversions: Partial<ProductConversion>[]): Promise<void> {
    // Skip processing if no conversions provided
    if (conversions.length === 0) {
      return;
    }

    // Save in chunks of 100 to prevent memory overflow
    await this.conversionRepository.save(conversions, { chunk: 100 });
  }

  /**
   * ──────────────────────────────────────────────────────────────────────
   * Private Helper Methods
   * ──────────────────────────────────────────────────────────────────────
   */

  /**
   * Transforms Product entities into ProductWithConversions response DTOs,
   * converting numeric values and flattening currency conversions.
   *
   * @param products - Array of product entities with loaded conversions
   * @returns Array of formatted response DTOs
   */
  private transformProductsToResponse(products: Product[]): ProductWithConversions[] {
    return products.map((product) => ({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      expirationDate: product.expirationDate,
      currencies: this.transformConversions(product.conversions),
    }));
  }

  /**
   * Converts an array of ProductConversion entities into a flat object
   * mapping currency codes to their respective converted prices.
   *
   * @param conversions - Array of product conversion entities
   * @returns Object with currency code keys and converted price values
   */
  private transformConversions(
    conversions: ProductConversion[],
  ): { [currency: string]: number } {
    const result: { [currency: string]: number } = {};

    // Build currency -> price mapping from conversion records
    for (const conversion of conversions) {
      result[conversion.currency] = Number(conversion.convertedPrice);
    }

    return result;
  }
}
