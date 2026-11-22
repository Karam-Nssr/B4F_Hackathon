import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Shop } from '../shops/schemas/shop.schema.js';
import { User } from '../users/schemas/user.schema.js';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Shop.name) private readonly shopModel: Model<Shop>,
  ) {}

  async getStats() {
    const [totalUsers, totalShops, activeShops] = await Promise.all([
      this.userModel.countDocuments(),
      this.shopModel.countDocuments(),
      this.shopModel.countDocuments({ isActive: true }),
    ]);
    return { totalUsers, totalShops, activeShops };
  }

  listUsers() {
    return this.userModel
      .find()
      .select('fullName email role createdAt')
      .sort({ createdAt: -1 })
      .lean()
      .exec();
  }

  listShops() {
    return this.shopModel
      .find()
      .select('ownerId shopName category description isActive createdAt')
      .sort({ createdAt: -1 })
      .lean()
      .exec();
  }
}
