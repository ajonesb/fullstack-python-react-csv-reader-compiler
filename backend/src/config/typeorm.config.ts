import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Product } from '@/entities/product.entity';
import { ProductConversion } from '@/entities/product-conversion.entity';

export const typeormConfig = (): TypeOrmModuleOptions => ({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [Product, ProductConversion],
  synchronize: process.env.NODE_ENV !== 'production',
  logging: process.env.NODE_ENV === 'development',
  ssl:
    process.env.NODE_ENV === 'production'
      ? { rejectUnauthorized: false }
      : undefined,
});
