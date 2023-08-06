import { Product } from 'src/products/entities/product.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column('text', { unique: true })
  email: string;

  @Column('text', {
    // * so password doesnt appear in response:
    select: false,
  })
  password: string;
  @Column('text')
  name: string;
  @Column('text', { array: true, default: ['user'] })
  roles: string[];
  //   * we dont want to delete users, we just make them inactive so thats why we create this column as well:
  @Column('boolean', { default: true })
  isActive: boolean;

  @OneToMany(
    () => {
      return Product;
    },
    (product) => {
      product.user;
    },
  )
  product: Product;

  @BeforeInsert()
  checkEmail() {
    this.email = this.email.toLowerCase().trim();
  }
  @BeforeUpdate()
  doubleCheckEmail() {
    // * in case email is changed:
    this.checkEmail();
  }
}
