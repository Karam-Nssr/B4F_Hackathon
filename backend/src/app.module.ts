import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { StorageModule } from '@nestjs/storage';
import { AuthModule } from './auth/auth.module.js';
import { UsersModule } from './users/users.module.js';
import { ShopsModule } from './shops/shops.module.js';
import { ProductsModule } from './products/products.module.js';
import { OrdersModule } from './orders/orders.module.js';
import { ShopModule } from './shop/shop.module.js';
import { AdminModule } from './admin/admin.module.js';
import { MediaModule } from './media/media.module.js';
import { createStorageOptions } from './storage/storage.config.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (environment: Record<string, unknown>) => {
        if (
          typeof environment.MONGODB_URI !== 'string' ||
          environment.MONGODB_URI.length === 0
        ) {
          throw new Error('MONGODB_URI is required');
        }
        if (
          typeof environment.JWT_SECRET !== 'string' ||
          environment.JWT_SECRET.length < 32
        ) {
          throw new Error('JWT_SECRET must be at least 32 characters');
        }
        return environment;
      },
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.getOrThrow<string>('MONGODB_URI'),
      }),
    }),
    AuthModule,
    StorageModule.forRoot(createStorageOptions()),
    UsersModule,
    ShopsModule,
    ProductsModule,
    OrdersModule,
    ShopModule,
    AdminModule,
    MediaModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
