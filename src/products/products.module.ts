import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { ProductImage } from './entities/productImage.entity';
import { UsersModule } from 'src/users/users.module';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService],

  imports: [
    // * important to keep in mind that everytime you create a new entity inside this particular module, you need to import TypeOrmModule.forFeature and add that specific new entity. like this:
    TypeOrmModule.forFeature([Product, ProductImage]),
    UsersModule,
  ],
  exports: [TypeOrmModule, ProductsService],
})
export class ProductsModule {}
