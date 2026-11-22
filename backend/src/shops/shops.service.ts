import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Shop } from './schemas/shop.schema.js';

@Injectable()
export class ShopsService {
  constructor(
    @InjectModel(Shop.name) private readonly shopModel: Model<Shop>,
  ) {}

  listActive() {
    return this.shopModel
      .find({ isActive: true })
      .select('shopName category description isActive createdAt')
      .sort({ shopName: 1 })
      .lean()
      .exec();
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
