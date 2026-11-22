import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from '../products/schemas/product.schema.js';
import { Shop, ShopSchema } from './schemas/shop.schema.js';
import { ShopsController } from './shops.controller.js';
import { ShopsService } from './shops.service.js';

@Module({
  imports: [
    // Product is registered here (not imported from ProductsModule) so the
    // shop-detail endpoint can load a shop's products without creating a
    // module cycle: ProductsModule already imports ShopsModule.
    MongooseModule.forFeature([
      { name: Shop.name, schema: ShopSchema },
      { name: Product.name, schema: ProductSchema },
    ]),
  ],
  controllers: [ShopsController],
  providers: [ShopsService],
  exports: [ShopsService],
})
export class ShopsModule {}
