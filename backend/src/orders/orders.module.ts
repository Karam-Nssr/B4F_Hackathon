import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module.js';
import { Product, ProductSchema } from '../products/schemas/product.schema.js';
import { Shop, ShopSchema } from '../shops/schemas/shop.schema.js';
import { User, UserSchema } from '../users/schemas/user.schema.js';
import {
  MasterOrder,
  MasterOrderSchema,
} from './schemas/master-order.schema.js';
import {
  ShopSubOrder,
  ShopSubOrderSchema,
} from './schemas/shop-sub-order.schema.js';
import { OrdersController } from './orders.controller.js';
import { OrdersService } from './orders.service.js';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Product.name, schema: ProductSchema },
      { name: Shop.name, schema: ShopSchema },
      { name: MasterOrder.name, schema: MasterOrderSchema },
      { name: ShopSubOrder.name, schema: ShopSubOrderSchema },
    ]),
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [MongooseModule],
})
export class OrdersModule {}
