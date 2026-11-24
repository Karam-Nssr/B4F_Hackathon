import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { CurrentUser } from '../common/auth/current-user.decorator.js';
import type { AuthenticatedUser } from '../common/auth/authenticated-user.js';
import { JwtAuthGuard } from '../common/auth/jwt-auth.guard.js';
import { Roles } from '../common/auth/roles.decorator.js';
import { RolesGuard } from '../common/auth/roles.guard.js';
import { ParseObjectIdPipe } from '../common/pipes/parse-object-id.pipe.js';
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

  @Get('my/:orderId')
  getMine(
    @CurrentUser() user: AuthenticatedUser,
    @Param('orderId', ParseObjectIdPipe) orderId: Types.ObjectId,
  ) {
    return this.ordersService.getOrder(user.sub, orderId);
  }

  @Patch('my/sub-orders/:subOrderId/cancel')
  cancelSubOrderMine(
    @CurrentUser() user: AuthenticatedUser,
    @Param('subOrderId', ParseObjectIdPipe) subOrderId: Types.ObjectId,
  ) {
    return this.ordersService.cancelSubOrder(user.sub, subOrderId);
  }

  @Patch('my/:orderId/cancel')
  cancelMine(
    @CurrentUser() user: AuthenticatedUser,
    @Param('orderId', ParseObjectIdPipe) orderId: Types.ObjectId,
  ) {
    return this.ordersService.cancelOrder(user.sub, orderId);
  }
}
