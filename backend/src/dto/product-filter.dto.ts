import { IsOptional, IsString, IsNumber, IsDateString } from 'class-validator';
import { Transform } from 'class-transformer';

/**
 * DTO for filtering and sorting products
 * Handles optional filter criteria and sorting preferences
 */
export class ProductFilterDto {
  /**
   * Filter products by name (partial match)
   * @example "Apple Juice"
   */
  @IsOptional()
  @IsString()
  name?: string;

  /**
   * Minimum price filter (inclusive)
   * Automatically converts string input to float
   * @example 10.50
   */
  @IsOptional()
  @Transform(({ value }) => (value ? parseFloat(value) : undefined))
  @IsNumber()
  minPrice?: number;

  /**
   * Maximum price filter (inclusive)
   * Automatically converts string input to float
   * @example 99.99
   */
  @IsOptional()
  @Transform(({ value }) => (value ? parseFloat(value) : undefined))
  @IsNumber()
  maxPrice?: number;

  /**
   * Minimum expiration date filter (ISO 8601 format)
   * @example "2024-12-31"
   */
  @IsOptional()
  @IsDateString()
  minExpiration?: string;

  /**
   * Maximum expiration date filter (ISO 8601 format)
   * @example "2025-06-30"
   */
  @IsOptional()
  @IsDateString()
  maxExpiration?: string;

  /**
   * Field to sort results by
   * @example "price"
   */
  @IsOptional()
  @IsString()
  sortBy?: 'name' | 'price' | 'expirationDate';

  /**
   * Sort direction for results
   * @example "asc"
   */
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc';
}
