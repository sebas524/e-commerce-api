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
import { Repository } from 'typeorm';
import { PaginationDto } from 'src/shared/dto/pagination.dto';
import { validate as isUUID } from 'uuid';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger('ProductsService');

  constructor(
    // * inject Repository:
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(createProductDto: CreateProductDto) {
    try {
      // * CREATE:
      const newProduct = this.productRepository.create(createProductDto);
      // * SAVE:
      const savedProduct = await this.productRepository.save(newProduct);
      return savedProduct;
    } catch (error) {
      this.myExceptionHandler(error);
    }
  }

  findAll(paginationDto: PaginationDto) {
    const { limit = 4, offset = 0 } = paginationDto;

    return this.productRepository.find({
      take: limit,
      skip: offset,
    });
  }

  async findOne(query: string) {
    let foundProduct: Product;
    if (isUUID(query)) {
      foundProduct = await this.productRepository.findOneBy({ id: query });
    } else {
      // foundProduct = await this.productRepository.findOneBy({ slug: query });
      const queryBuilder = this.productRepository.createQueryBuilder();
      foundProduct = await queryBuilder
        .where('UPPER(title) =:title or slug =:slug', {
          title: query.toUpperCase(),
          slug: query.toLocaleLowerCase(),
        })
        .getOne();
    }

    if (!foundProduct) {
      throw new NotFoundException(`Product with id: ${query} not found.`);
    }
    return foundProduct;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const foundproduct = await this.productRepository.preload({
      // * find product by id:
      id: id,
      // * and load all the propesrties inside:
      ...updateProductDto,
    });
    if (!foundproduct) {
      throw new NotFoundException(`Product with id: ${id} was not found.`);
    }

    try {
      const updatedProduct = await this.productRepository.save(foundproduct);

      return updatedProduct;
    } catch (error) {
      this.myExceptionHandler(error);
    }
  }

  async remove(id: string) {
    const productToDelete = await this.productRepository.delete({ id });
    if (!productToDelete) {
      throw new NotFoundException(`Product with id: ${id} not found.`);
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
