import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '@/entities/product.entity';
import { ProductFilterDto } from '@/dto/product-filter.dto';

/**
* The ProductRepository class is responsible for handling database operations related to the Product entity. 
* It uses TypeORM's Repository to perform CRUD operations and custom queries on the products table in the database.
*/

@Injectable()

export class ProductRepository {
  constructor(
    @InjectRepository(Product)
    // The constructor injects the TypeORM Repository for the Product entity, allowing us to perform database operations on products. This is done using NestJS's dependency injection system.
    private readonly repository: Repository<Product>,
  ) { }

  /**
  * This method creates products in batches to optimize performance when inserting large datasets.
  * It takes an array of partial product objects (which may not have all fields set) and saves them to the database in chunks of 100 to avoid overwhelming the database with a single large insert operation.
  */
  async createBatch(products: Partial<Product>[]): Promise<Product[]> {
    if (products.length === 0) {
      return [];
    }

    return await this.repository.save(products, { chunk: 100 });
  }

  /**
  * This method retrieves products from the database based on various optional filters provided in the ProductFilterDto.
  * It constructs a dynamic query using TypeORM's QueryBuilder to apply the filters for name, price range, expiration date range, and sorting options.
  * The method returns an array of products that match the specified criteria.
  */
  async findWithFilters(filters: ProductFilterDto): Promise<Product[]> {
    let query = this.repository.createQueryBuilder('product').leftJoinAndSelect(
      'product.conversions',
      'conversions',
    );

    if (filters.name) {
      const safeName = filters.name.replace(/[\\%_]/g, '\\$&');
      query = query.where('product.name ILIKE :name', {
        name: `%${safeName}%`,
      });
    }

    if (filters.minPrice !== undefined) {
      query = query.andWhere('product.price >= :minPrice', {
        minPrice: filters.minPrice,
      });
    }

    if (filters.maxPrice !== undefined) {
      query = query.andWhere('product.price <= :maxPrice', {
        maxPrice: filters.maxPrice,
      });
    }

    if (filters.minExpiration) {
      query = query.andWhere('product.expirationDate >= :minExpiration', {
        minExpiration: filters.minExpiration,
      });
    }

    if (filters.maxExpiration) {
      query = query.andWhere('product.expirationDate <= :maxExpiration', {
        maxExpiration: filters.maxExpiration,
      });
    }

    const sortBy =
      filters.sortBy && ['name', 'price', 'expirationDate'].includes(filters.sortBy)
        ? filters.sortBy
        : 'createdAt';
    const sortOrder =
      filters.sortOrder && ['asc', 'desc'].includes(filters.sortOrder.toLowerCase())
        ? filters.sortOrder.toUpperCase()
        : 'DESC';

    query = query.orderBy(`product.${sortBy}`, sortOrder as 'ASC' | 'DESC');

    return await query.getMany();
  }
}
