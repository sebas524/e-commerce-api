import { Injectable } from '@nestjs/common';
import { ProductsService } from 'src/products/products.service';
import { initialData } from './data/seedData';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { query } from 'express';

@Injectable()
export class SeedService {
  constructor(
    private readonly productsService: ProductsService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async executeSeed() {
    await this.deleteTables();
    const adminUser = await this.addNewUsers();
    await this.addNewProducts(adminUser);

    return 'seed excuted!!!!!!!!!';
  }

  private async deleteTables() {
    // * to remove products
    await this.productsService.removeAllProducts();
    // ! remember that since we have cascade on our products, the images will also be deleted.
    // * to remove users:
    const queryBuilder = this.userRepository.createQueryBuilder();
    await queryBuilder.delete().where({}).execute();
  }

  private async addNewUsers() {
    const seedUsers = initialData.users;
    const users: User[] = [];
    seedUsers.forEach((user) => {
      users.push(this.userRepository.create(user));
    });
    // * remember we have to save it:
    const dbUsers = await this.userRepository.save(seedUsers);
    return dbUsers[0];
  }

  private async addNewProducts(user: User) {
    // * remove all products:
    await this.productsService.removeAllProducts();
    // * get seed data:
    const seedProducts = initialData.products;

    const insertPromises = [];

    // * iterate through array of data:
    seedProducts.forEach((product) => {
      // * add to array and create entry using create method from product service:
      insertPromises.push(this.productsService.create(product, user));
    });
    // * wait for it to be done:
    await Promise.all(insertPromises);
    return true;
  }
}
