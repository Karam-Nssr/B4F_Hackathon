import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../common/auth/current-user.decorator.js';
import type { AuthenticatedUser } from '../common/auth/authenticated-user.js';
import { JwtAuthGuard } from '../common/auth/jwt-auth.guard.js';
import { Roles } from '../common/auth/roles.decorator.js';
import { RolesGuard } from '../common/auth/roles.guard.js';
import { CreateOrderDto } from './dto/create-order.dto.js';
import { OrdersService } from './orders.service.js';

@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('user')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() createOrderDto: CreateOrderDto,
  ) {
    return this.ordersService.create(user.sub, createOrderDto);
  }

  @Get('my')
  listMine(@CurrentUser() user: AuthenticatedUser) {
    return this.ordersService.listMine(user.sub);
  }
}
