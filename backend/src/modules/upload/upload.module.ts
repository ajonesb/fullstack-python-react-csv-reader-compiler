import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { ProductsModule } from '@/modules/products/products.module';
import { CurrencyModule } from '@/modules/currency/currency.module';

@Module({
  imports: [ProductsModule, CurrencyModule],
  controllers: [UploadController],
  providers: [UploadService],
})
export class UploadModule {}
