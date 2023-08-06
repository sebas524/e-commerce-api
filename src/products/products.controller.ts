import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from 'src/shared/dto/pagination.dto';
import { AuthDeco } from 'src/users/decorators/authDeco.decorator';
import { PermittedRoles } from 'src/users/interfaces/permitted-roles.enum';
import { UserDeco } from 'src/users/decorators/get-user.decorator';
import { User } from 'src/users/entities/user.entity';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @AuthDeco()
  create(@Body() createProductDto: CreateProductDto, @UserDeco() user: User) {
    return this.productsService.create(createProductDto, user);
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    console.log(paginationDto);

    return this.productsService.findAll(paginationDto);
  }

  @Get(':query')
  findOne(@Param('query') id: string) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  @AuthDeco(PermittedRoles.admin)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProductDto: UpdateProductDto,
    @UserDeco() user: User,
  ) {
    return this.productsService.update(id, updateProductDto, user);
  }

  @Delete(':id')
  @AuthDeco(PermittedRoles.admin)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.remove(id);
  }
}
