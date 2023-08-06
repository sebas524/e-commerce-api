import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { PaginationDto } from 'src/shared/dto/pagination.dto';
import { validate as isUUID } from 'uuid';
import { ProductImage } from './entities/productImage.entity';

import { User } from 'src/users/entities/user.entity';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger('ProductsService');

  constructor(
    // * inject Repository:
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,

    private readonly dataSource: DataSource,
  ) {}

  async create(createProductDto: CreateProductDto, user: User) {
    try {
      const { images = [], ...restOfProps } = createProductDto;

      // * CREATE:
      const newProduct = this.productRepository.create({
        ...restOfProps,
        images: images.map((image) => {
          return this.productImageRepository.create({ url: image });
        }),
        user: user,
      });
      // * SAVE:
      const savedProduct = await this.productRepository.save(newProduct);
      return { ...savedProduct, images: images };
    } catch (error) {
      this.myExceptionHandler(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    const foundProducts = await this.productRepository.find({
      take: limit,
      skip: offset,
      // * here is so that images show up as well even though they are not a column:
      relations: {
        images: true,
      },
    });
    return foundProducts.map((product) => {
      return {
        ...product,
        images: product.images.map((image) => {
          return image.url;
        }),
      };
    });
  }

  async findOne(query: string) {
    let foundProduct: Product;
    if (isUUID(query)) {
      foundProduct = await this.productRepository.findOneBy({ id: query });
    } else {
      const queryBuilder = this.productRepository.createQueryBuilder('prod');
      foundProduct = await queryBuilder
        .where('UPPER(title) =:title or slug =:slug', {
          title: query.toUpperCase(),
          slug: query.toLocaleLowerCase(),
        })
        .leftJoinAndSelect('prod.images', 'prodImages')
        .getOne();
    }

    if (!foundProduct) {
      throw new NotFoundException(`Product with id: ${query} not found.`);
    }
    return {
      ...foundProduct,
      images: foundProduct.images.map((image) => {
        return image.url;
      }),
    };
  }

  async update(id: string, updateProductDto: UpdateProductDto, user: User) {
    const { images, ...restOfProps } = updateProductDto;

    const foundproduct = await this.productRepository.preload({
      // * find product by id:
      id: id,
      // * and load all the propesrties inside:
      ...restOfProps,
    });
    if (!foundproduct) {
      throw new NotFoundException(`Product with id: ${id} was not found.`);
    }

    // * creating queryRunner:
    const queryRunner = this.dataSource.createQueryRunner();
    // * now we use it to create a transaction. a transaction is a series of queries that can impact our database(update,delete,insert, etc. but you have to explicitly make the specific commit.)
    // * connect to db:
    await queryRunner.connect();
    // * initiate transaction:
    await queryRunner.startTransaction();

    try {
      if (images) {
        // * delete images:
        // * you could do this with the productRepository but lets do it with queryRunner:
        await queryRunner.manager.delete(ProductImage, { product: { id: id } });

        foundproduct.images = images.map((image) => {
          return this.productImageRepository.create({ url: image });
        });
      } else {
        foundproduct.images = await this.productImageRepository.findBy({
          product: { id: id },
        });
      }

      foundproduct.user = user;

      // * up till now, nothing has changed in db. we need to save it:
      await queryRunner.manager.save(foundproduct);

      // * commit transaction:
      await queryRunner.commitTransaction();
      // * to disable queryRunner:
      await queryRunner.release();

      return {
        ...foundproduct,
        images: foundproduct.images.map((image) => {
          return image.url;
        }),
      };
    } catch (error) {
      // * if error, then rollback:
      await queryRunner.rollbackTransaction();
      // * to disable queryRunner:
      await queryRunner.release();

      this.myExceptionHandler(error);
    }
  }

  async remove(id: string) {
    const productFound = await this.findOne(id);
    await this.productRepository.delete(productFound.id);

    if (!productFound) {
      throw new NotFoundException(`Product with id: ${id} not found.`);
    }
  }

  async removeAllProducts() {
    const query = this.productRepository.createQueryBuilder('prod');

    try {
      return await query.delete().where({}).execute();
    } catch (error) {
      this.myExceptionHandler(error);
    }
  }

  private myExceptionHandler(error: any) {
    if (error.code === '23505') {
      throw new BadRequestException(error.detail);
    }
    this.logger.error(error);
    throw new InternalServerErrorException(
      'Unexpected error! Check server logs...',
    );
  }
}
