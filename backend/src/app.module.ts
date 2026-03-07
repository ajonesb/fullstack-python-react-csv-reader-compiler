import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeormConfig } from '@/config/typeorm.config';
import { UploadModule } from '@/modules/upload/upload.module';
import { ProductsModule } from '@/modules/products/products.module';
import { CurrencyModule } from '@/modules/currency/currency.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    TypeOrmModule.forRoot(typeormConfig()),
    UploadModule,
    ProductsModule,
    CurrencyModule,
  ],
})
export class AppModule {}
