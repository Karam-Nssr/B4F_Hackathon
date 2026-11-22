import { Controller, Get, Query } from '@nestjs/common';
import { QueryProductsDto } from './dto/query-products.dto.js';
import { ProductsService } from './products.service.js';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  browse(@Query() query: QueryProductsDto) {
    return this.productsService.browse(query);
  }
}
