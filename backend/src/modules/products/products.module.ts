import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '@/entities/product.entity';
import { ProductConversion } from '@/entities/product-conversion.entity';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { ProductRepository } from './product.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Product, ProductConversion])],
  providers: [ProductsService, ProductRepository],
  controllers: [ProductsController],
  exports: [ProductsService],
})
export class ProductsModule {}
