import { Controller, Get, Query } from '@nestjs/common';
import { ProductsService, ProductWithConversions } from './products.service';
import { ProductFilterDto } from '@/dto/product-filter.dto';

/**
 * Controller for managing product-related API endpoints.
 *
 * This controller handles all HTTP requests related to products,
 * including filtering and retrieving product data with conversions.
 */
@Controller('api/products')
export class ProductsController {
  /**
   * Initializes the ProductsController with the ProductsService.
   *
   * @param productsService - Service for handling product business logic
   */
  constructor(private readonly productsService: ProductsService) {}

  /**
   * Retrieves a list of products based on provided filters.
   *
   * This endpoint accepts optional query parameters for filtering products
   * and returns products with their conversion information.
   *
   * @param filters - Query parameters containing product filters
   * @returns Promise resolving to an array of products with conversions
   */
  @Get()
  async getProducts(@Query() filters: ProductFilterDto): Promise<ProductWithConversions[]> {
    return await this.productsService.getProducts(filters);
  }
}
