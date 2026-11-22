import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ShopSubOrder } from '../orders/schemas/shop-sub-order.schema.js';
import { Product } from '../products/schemas/product.schema.js';
import { ShopsService } from '../shops/shops.service.js';
import type { OrderStatus } from '../orders/schemas/shop-sub-order.schema.js';

@Injectable()
export class ShopService {
  constructor(
    @InjectModel(Product.name) private readonly productModel: Model<Product>,
    @InjectModel(ShopSubOrder.name)
    private readonly shopSubOrderModel: Model<ShopSubOrder>,
    private readonly shopsService: ShopsService,
  ) {}

  async getOverview(ownerId: string) {
    const shop = await this.shopsService.findOwnedShop(ownerId);
    const shopId = shop._id;
    const [totalProducts, totalOrders, pendingOrders, completedOrders, sales] =
      await Promise.all([
        this.productModel.countDocuments({ shopId }),
        this.shopSubOrderModel.countDocuments({ shopId }),
        this.shopSubOrderModel.countDocuments({ shopId, status: 'PENDING' }),
        this.shopSubOrderModel.countDocuments({ shopId, status: 'COMPLETED' }),
        this.shopSubOrderModel.aggregate<{ totalSalesSyp: number }>([
          { $match: { shopId, status: 'COMPLETED' } },
          { $group: { _id: null, totalSalesSyp: { $sum: '$subtotalSyp' } } },
        ]),
      ]);

    return {
      totalProducts,
      totalOrders,
      pendingOrders,
      completedOrders,
      totalSalesSyp: sales[0]?.totalSalesSyp ?? 0,
    };
  }

  async listOrders(ownerId: string) {
    const shop = await this.shopsService.findOwnedShop(ownerId);
    return this.shopSubOrderModel
      .find({ shopId: shop._id })
      .populate('masterOrderId', 'createdAt')
      .sort({ createdAt: -1 })
      .lean()
      .exec();
  }

  async updateOrderStatus(
    ownerId: string,
    orderId: Types.ObjectId,
    status: OrderStatus,
  ) {
    const shop = await this.shopsService.findOwnedShop(ownerId);
    const order = await this.shopSubOrderModel
      .findOne({ _id: orderId, shopId: shop._id })
      .exec();
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    if (status === 'CONFIRMED') {
      const confirmationDeadline =
        order.createdAt.getTime() +
        order.confirmationWindowHours * 60 * 60 * 1000;
      if (Date.now() > confirmationDeadline) {
        throw new ForbiddenException(
          'The order confirmation window has expired',
        );
      }
    }

    order.status = status;
    return order.save();
  }
}
