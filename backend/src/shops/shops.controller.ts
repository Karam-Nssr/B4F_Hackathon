import { Controller, Get } from '@nestjs/common';
import { ShopsService } from './shops.service.js';

@Controller('shops')
export class ShopsController {
  constructor(private readonly shopsService: ShopsService) {}

  @Get()
  list() {
    return this.shopsService.listActive();
  }
}
