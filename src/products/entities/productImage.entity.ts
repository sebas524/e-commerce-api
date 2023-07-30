import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Product } from './product.entity';

@Entity({ name: 'products_images' })
export class ProductImage {
  @PrimaryGeneratedColumn('uuid')
  id: number;
  @Column('text')
  url: string;
  //   * many to one relation:
  @ManyToOne(
    () =>
      // * will return:
      Product,
    // * how does it relate with our table?:
    (product) => product.images,
    // * so that when deleting product, images delete as well:
    { onDelete: 'CASCADE' },
  )
  product: Product;
}
