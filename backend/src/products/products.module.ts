import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module.js';
import { ShopsModule } from '../shops/shops.module.js';
import { Shop, ShopSchema } from '../shops/schemas/shop.schema.js';
import { Product, ProductSchema } from './schemas/product.schema.js';
import { ProductsController } from './products.controller.js';
import { ProductsService } from './products.service.js';

@Module({
  imports: [
    AuthModule,
    ShopsModule,
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      { name: Shop.name, schema: ShopSchema },
    ]),
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
