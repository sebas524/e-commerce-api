import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ProductImage } from './productImage.entity';

@Entity()
export class Product {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column('text', { unique: true }) title: string;
  @Column('float', { default: 0 }) price: number;
  @Column('text', { nullable: true }) description: string;
  @Column('text', { unique: true }) slug: string;
  @Column('int', { default: 0 }) stock: number;
  @Column('text', { array: true }) size: string[];
  @Column('text') sex: string;
  @Column('text', { array: true, default: [] }) tags: string[];
  // * one to many relation:
  @OneToMany(() => ProductImage, (productImage) => productImage.product, {
    cascade: true,
    // * eager (will load images everytime we use a find method):
    eager: true,
  })
  images?: ProductImage[];

  // ! METHODS before db insertion:
  @BeforeInsert()
  inspectSlugToBeInserted() {
    if (!this.slug) {
      this.slug = this.title;
    }
    this.slug = this.slug
      .toLowerCase()
      .replaceAll(' ', '_')
      .replaceAll("'", '');
  }

  @BeforeUpdate()
  inspectSlugToBeUpdated() {
    this.slug = this.slug
      .toLowerCase()
      .replaceAll(' ', '_')
      .replaceAll("'", '');
  }
}
