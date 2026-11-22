import { Controller, Get, Param } from '@nestjs/common';
import { ShopsService } from './shops.service.js';

@Controller('shops')
export class ShopsController {
  constructor(private readonly shopsService: ShopsService) {}

  @Get()
  list() {
    return this.shopsService.listActive();
  }

  // Shop details + its active products.
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.shopsService.findOneActive(id);
  }
}
