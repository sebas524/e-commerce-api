import { Injectable } from '@nestjs/common';
import { ProductsService } from 'src/products/products.service';
import { initialData } from './data/seedData';

@Injectable()
export class SeedService {
  constructor(private readonly productsService: ProductsService) {}

  async executeSeed() {
    await this.addNewProducts();

    return 'seed excuted!!!!!!!!!';
  }

  private async addNewProducts() {
    // * remove all products:
    await this.productsService.removeAllProducts();
    // * get seed data:
    const seedProducts = initialData.products;

    const insertPromises = [];

    // * iterate through array of data:
    seedProducts.forEach((product) => {
      // * add to array and create entry using create method from product service:
      insertPromises.push(this.productsService.create(product));
    });
    // * wait for it to be done:
    await Promise.all(insertPromises);
    return true;
  }
}
