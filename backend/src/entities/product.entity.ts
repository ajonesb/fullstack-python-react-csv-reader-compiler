import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { ProductConversion } from './product-conversion.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'date', nullable: true })
  expirationDate: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => ProductConversion, (conversion) => conversion.product, {
    cascade: true,
    eager: true,
  })
  conversions: ProductConversion[];
}
