import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Types } from 'mongoose';
import type { AuthenticatedUser } from '../common/auth/authenticated-user.js';
import { CurrentUser } from '../common/auth/current-user.decorator.js';
import { JwtAuthGuard } from '../common/auth/jwt-auth.guard.js';
import { Roles } from '../common/auth/roles.decorator.js';
import { RolesGuard } from '../common/auth/roles.guard.js';
import { ParseObjectIdPipe } from '../common/pipes/parse-object-id.pipe.js';
import { UpdateOrderStatusDto } from '../orders/dto/update-order-status.dto.js';
import { CreateProductDto } from '../products/dto/create-product.dto.js';
import { UpdateProductDto } from '../products/dto/update-product.dto.js';
import { ProductsService } from '../products/products.service.js';
import { ShopService } from './shop.service.js';

@Controller('shop')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('shop')
export class ShopController {
  constructor(
    private readonly shopService: ShopService,
    private readonly productsService: ProductsService,
  ) {}

  @Get('overview')
  overview(@CurrentUser() user: AuthenticatedUser) {
    return this.shopService.getOverview(user.sub);
  }

  @Get('products')
  listProducts(@CurrentUser() user: AuthenticatedUser) {
    return this.productsService.listOwned(user.sub);
  }

  @Post('products')
  createProduct(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateProductDto,
  ) {
    return this.productsService.create(user.sub, dto);
  }

  @Patch('products/:id')
  updateProduct(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseObjectIdPipe) productId: Types.ObjectId,
    @Body() dto: UpdateProductDto,
  ) {
    return this.productsService.updateOwned(user.sub, productId, dto);
  }

  @Delete('products/:id')
  deleteProduct(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseObjectIdPipe) productId: Types.ObjectId,
  ) {
    return this.productsService.deleteOwned(user.sub, productId);
  }

  @Get('orders')
  listOrders(@CurrentUser() user: AuthenticatedUser) {
    return this.shopService.listOrders(user.sub);
  }

  @Patch('orders/:id/status')
  updateOrderStatus(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseObjectIdPipe) orderId: Types.ObjectId,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.shopService.updateOrderStatus(user.sub, orderId, dto.status);
  }
}
