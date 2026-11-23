import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product } from '../products/schemas/product.schema.js';
import { Shop } from './schemas/shop.schema.js';

@Injectable()
export class ShopsService {
  constructor(
    @InjectModel(Shop.name) private readonly shopModel: Model<Shop>,
    @InjectModel(Product.name) private readonly productModel: Model<Product>,
  ) {}

  listActive() {
    return this.shopModel
      .find({ isActive: true })
      .select(
        'shopName category description imageUrl imageCredit imageCreditUrl isActive createdAt',
      )
      .sort({ shopName: 1 })
      .lean()
      .exec();
  }

  // Public shop details + the shop's active products (SAD §7.1).
  async findOneActive(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Shop not found');
    }
    const shop = await this.shopModel
      .findOne({ _id: id, isActive: true })
      .select(
        'shopName category description imageUrl imageCredit imageCreditUrl isActive createdAt',
      )
      .lean()
      .exec();
    if (!shop) {
      throw new NotFoundException('Shop not found');
    }
    const products = await this.productModel
      .find({ shopId: shop._id, isActive: true })
      .sort({ createdAt: -1 })
      .lean()
      .exec();
    return {
      _id: shop._id,
      shopName: shop.shopName,
      category: shop.category,
      description: shop.description,
      imageUrl: shop.imageUrl,
      imageCredit: shop.imageCredit,
      imageCreditUrl: shop.imageCreditUrl,
      isActive: shop.isActive,
      // Added at runtime by `timestamps: true`, not declared on the class.
      createdAt: (shop as { createdAt?: Date }).createdAt,
      products,
    };
  }

  async findOwnedShop(ownerId: string) {
    const shop = await this.shopModel
      .findOne({ ownerId, isActive: true })
      .exec();
    if (!shop) {
      throw new ForbiddenException(
        'No active shop is associated with this account',
      );
    }
    return shop;
  }
}
