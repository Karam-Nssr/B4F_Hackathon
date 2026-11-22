import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module.js';
import { ProductsModule } from '../products/products.module.js';
import { Product, ProductSchema } from '../products/schemas/product.schema.js';
import { ShopsModule } from '../shops/shops.module.js';
import { Shop, ShopSchema } from '../shops/schemas/shop.schema.js';
import {
  ShopSubOrder,
  ShopSubOrderSchema,
} from '../orders/schemas/shop-sub-order.schema.js';
import { ShopController } from './shop.controller.js';
import { ShopService } from './shop.service.js';

@Module({
  imports: [
    AuthModule,
    ShopsModule,
    ProductsModule,
    MongooseModule.forFeature([
      { name: Shop.name, schema: ShopSchema },
      { name: Product.name, schema: ProductSchema },
      { name: ShopSubOrder.name, schema: ShopSubOrderSchema },
    ]),
  ],
  controllers: [ShopController],
  providers: [ShopService],
})
export class ShopModule {}
